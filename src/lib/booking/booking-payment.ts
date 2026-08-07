import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  type Firestore,
} from "firebase/firestore";

export async function confirmRsAppPayment(
  db: Firestore,
  params: { bookingId: string; customerId: string },
): Promise<void> {
  const { bookingId, customerId } = params;
  if (!bookingId || !customerId) throw new Error("Missing booking or customer");
  const ref = doc(db, "bookings", bookingId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Booking not found");
  const data = snap.data() as Record<string, unknown>;
  if (String(data.customerId ?? "") !== String(customerId)) {
    throw new Error("Not allowed");
  }
  const pr = data.paymentRequest as Record<string, unknown> | undefined;
  if (!pr || String(pr.status).toLowerCase() !== "pending") {
    throw new Error("No pending payment request");
  }
  const completionPhoto = data.completionPhoto as { url?: string } | undefined;
  if (!completionPhoto?.url?.trim()) {
    throw new Error("Technician has not submitted completion photo yet");
  }
  await updateDoc(ref, {
    paymentStatus: "paid",
    paymentMethod: "rs_app",
    paidAt: serverTimestamp(),
    status: "Completed",
    completedAt: serverTimestamp(),
    paymentRequest: {
      ...pr,
      status: "paid",
      paidAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });
}
