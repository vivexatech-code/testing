/**
 * Calls the free Vercel notify server from the website.
 */
export async function requestRemotePush(payload: Record<string, unknown>) {
  const base = String(process.env.NEXT_PUBLIC_NOTIFY_API_URL || "")
    .trim()
    .replace(/\/$/, "");
  const secret = String(process.env.NEXT_PUBLIC_NOTIFY_SECRET || "").trim();
  if (!base || !secret) return { skipped: true as const };

  try {
    const res = await fetch(`${base}/api/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ ...payload, secret }),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: res.ok, status: res.status, ...json };
  } catch (e: unknown) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}
