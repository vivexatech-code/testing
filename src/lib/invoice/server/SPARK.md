# Invoice PDF on Vercel (Spark-safe)

Firebase Cloud Functions are **not** used for invoices.

## Endpoints

- `POST /api/invoices/generate` — body `{ bookingId, force?, sendEmail? }`
- `POST /api/invoices/resend-email` — body `{ bookingId?, invoiceId? }` (admin only)

Auth: `Authorization: Bearer <Firebase ID token>`

## Vercel env

Required:

- `FIREBASE_SERVICE_ACCOUNT_JSON` — service account JSON (or base64)
- Cloudinary: either
  - `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` (+ optional `CLOUDINARY_CLOUD_NAME`), or
  - `CLOUDINARY_UPLOAD_PRESET` / `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (unsigned raw upload)

Optional:

- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — email PDF attachment
