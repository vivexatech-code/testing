const { getDb, getFcm, parseServiceAccount } = require('../lib/firebaseAdmin');
const { assertSecret } = require('../lib/auth');
const {
  collectTokensFromDoc,
  deliverToTokens,
  customerBody,
  techBody,
} = require('../lib/push');

/**
 * GET/POST /api/process-outbox
 * Vercel Cron (every minute) + manual trigger.
 * Auth: Authorization Bearer NOTIFY_SECRET, or Vercel Cron header, or ?secret=
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cronHeader = req.headers['x-vercel-cron'];
    if (!cronHeader) {
      assertSecret(req);
    } else if (process.env.NOTIFY_SECRET) {
      /* cron allowed; optional extra check via CRON_SECRET if set */
      const cronSecret = process.env.CRON_SECRET;
      if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
        /* Vercel Hobby crons may not send custom auth — allow x-vercel-cron alone */
      }
    }

    const db = getDb();
    const messaging = parseServiceAccount() ? getFcm() : null;

    const snap = await db
      .collection('bookingNotificationOutbox')
      .where('processed', '==', false)
      .orderBy('createdAt', 'asc')
      .limit(25)
      .get();

    let processed = 0;
    const errors = [];

    for (const docSnap of snap.docs) {
      const row = docSnap.data() || {};
      try {
        const eventType = String(row.eventType || '').trim();
        const customerId = String(row.customerId || '').trim();
        const technicianId = String(row.technicianId || '').trim();
        const bookingId = String(row.bookingId || '').trim();
        const serviceName = String(row.serviceName || '');
        const bookingCode = String(row.bookingCode || '');
        const audience = String(row.audience || 'customer').toLowerCase();

        let resolvedTechId = technicianId;
        let resolvedCustomerId = customerId;
        let resolvedService = serviceName;
        let resolvedCode = bookingCode;

        if (bookingId && (!resolvedTechId || !resolvedCustomerId)) {
          const bSnap = await db.collection('bookings').doc(bookingId).get();
          if (bSnap.exists) {
            const b = bSnap.data() || {};
            resolvedCustomerId = resolvedCustomerId || String(b.customerId || '');
            resolvedTechId = resolvedTechId || String(b.technicianId || '');
            resolvedService = resolvedService || String(b.serviceName || '');
            resolvedCode = resolvedCode || String(b.bookingCode || '');
          }
        }

        if (
          (audience === 'customer' || audience === 'both' || audience === 'all') &&
          resolvedCustomerId
        ) {
          const cSnap = await db.collection('customers').doc(resolvedCustomerId).get();
          const tokens = collectTokensFromDoc(cSnap.exists ? cSnap.data() : {});
          await deliverToTokens(messaging, tokens, {
            title: row.title || 'Booking Update',
            body: row.body || customerBody(eventType, resolvedService),
            data: { type: eventType, bookingId, eventType },
          });
        }

        if (
          (audience === 'technician' || audience === 'both' || audience === 'all') &&
          resolvedTechId
        ) {
          const tSnap = await db.collection('technicians').doc(resolvedTechId).get();
          const tokens = collectTokensFromDoc(tSnap.exists ? tSnap.data() : {});
          const techEvent =
            eventType === 'assigned' || eventType === 'created'
              ? 'booking_assigned'
              : eventType === 'cancelled'
                ? 'booking_cancelled'
                : eventType;
          await deliverToTokens(messaging, tokens, {
            title: row.techTitle || 'Repair Series',
            body: row.techBody || techBody(techEvent, resolvedService, resolvedCode),
            data: {
              type: techEvent === 'booking_assigned' ? 'booking_assigned' : techEvent,
              bookingId,
              eventType: techEvent,
            },
          });
        }

        await docSnap.ref.update({
          processed: true,
          processedAt: new Date(),
          processedBy: 'vercel-outbox',
        });
        processed += 1;
      } catch (e) {
        errors.push({ id: docSnap.id, error: e.message || String(e) });
        try {
          await docSnap.ref.update({
            lastError: e.message || String(e),
            lastErrorAt: new Date(),
          });
        } catch {
          /* ignore */
        }
      }
    }

    return res.status(200).json({
      ok: true,
      scanned: snap.size,
      processed,
      errors,
    });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({ error: e.message || 'Outbox process failed' });
  }
};
