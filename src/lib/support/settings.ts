import { doc, onSnapshot, type Firestore, type Unsubscribe } from "firebase/firestore";

export const FALLBACK_SUPPORT_EMAIL = "support@repairseries.com";
export const FALLBACK_SUPPORT_PHONE = "+911800000111";

export type SupportSettings = {
  supportEmail: string | null;
  supportPhone: string | null;
};

/** Subscribe to `settings/app` support fields (same as mobile app). */
export function subscribeSupportSettings(
  db: Firestore,
  onNext: (data: SupportSettings) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, "settings", "app"),
    (snap) => {
      if (!snap.exists()) {
        onNext({ supportEmail: null, supportPhone: null });
        return;
      }
      const d = snap.data() || {};
      const email =
        d.supportEmail != null
          ? String(d.supportEmail).trim() || null
          : d.support_email != null
            ? String(d.support_email).trim() || null
            : null;
      const phone =
        d.supportPhone != null
          ? String(d.supportPhone).trim() || null
          : d.support_phone != null
            ? String(d.support_phone).trim() || null
            : null;
      onNext({ supportEmail: email, supportPhone: phone });
    },
    (err) => onError?.(err),
  );
}
