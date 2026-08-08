/* eslint-disable @typescript-eslint/no-require-imports */

export const { generateAndStoreInvoice } = require("./generateAndStoreInvoice") as {
  generateAndStoreInvoice: (
    db: unknown,
    options: {
      bookingId: string;
      booking?: Record<string, unknown>;
      force?: boolean;
      sendEmail?: boolean;
      secrets?: {
        cloudinary?: Record<string, string>;
        resend?: Record<string, string>;
      };
    },
  ) => Promise<{
    reused: boolean;
    invoiceId: string;
    invoiceNumber: string;
    pdfUrl: string;
    email?: Record<string, unknown>;
  }>;
};

export const { sendInvoiceEmail } = require("./sendEmail") as {
  sendInvoiceEmail: (args: {
    invoice: Record<string, unknown>;
    pdfBuffer: Buffer;
    config: { apiKey?: string; fromEmail?: string };
  }) => Promise<{
    skipped?: boolean;
    reason?: string;
    id?: string | null;
    to?: string;
  }>;
};

export const { invoiceSecretsFromEnv } = require("./secrets") as {
  invoiceSecretsFromEnv: () => {
    cloudinary: Record<string, string>;
    resend: Record<string, string>;
  };
};
