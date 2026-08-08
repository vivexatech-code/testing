function invoiceSecretsFromEnv() {
  return {
    cloudinary: {
      cloudName:
        process.env.CLOUDINARY_CLOUD_NAME ||
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        'dk15jnxzd',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      uploadPreset:
        process.env.CLOUDINARY_UPLOAD_PRESET ||
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
        'tmsdm4e5',
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY || '',
      fromEmail:
        process.env.RESEND_FROM_EMAIL ||
        'Repair Series <repairseries@gmail.com>',
    },
  }
}

module.exports = { invoiceSecretsFromEnv }
