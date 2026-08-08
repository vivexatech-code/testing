import { NextRequest } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export type InvoiceAccess = {
  uid: string;
  role: "customer" | "admin";
};

function bearerToken(req: NextRequest): string {
  const header = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || "";
}

export async function requireInvoiceCaller(req: NextRequest): Promise<InvoiceAccess> {
  const token = bearerToken(req);
  if (!token) {
    throw Object.assign(new Error("Sign in required"), { status: 401 });
  }

  let uid = "";
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    uid = String(decoded.uid || "");
  } catch {
    throw Object.assign(new Error("Invalid or expired session"), { status: 401 });
  }
  if (!uid) {
    throw Object.assign(new Error("Sign in required"), { status: 401 });
  }

  const adminSnap = await getAdminDb().doc(`adminUsers/${uid}`).get();
  if (adminSnap.exists && String(adminSnap.data()?.status ?? "") === "active") {
    return { uid, role: "admin" };
  }

  return { uid, role: "customer" };
}

export async function assertBookingAccess(
  access: InvoiceAccess,
  booking: Record<string, unknown>,
): Promise<void> {
  if (access.role === "admin") return;
  if (String(booking.customerId ?? "") === String(access.uid)) return;
  throw Object.assign(new Error("Not allowed"), { status: 403 });
}
