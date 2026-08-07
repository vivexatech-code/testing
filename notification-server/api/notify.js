const { getDb, getFcm, parseServiceAccount } = require('../lib/firebaseAdmin');
const { assertSecret, readJsonBody } = require('../lib/auth');
const {
  collectTokensFromDoc,
  deliverToTokens,
  customerBody,
  techBody,
} = require('../lib/push');

/**
 * POST /api/notify
 * Body: {
 *   secret?,
 *   eventType: 'created'|'assigned'|'started'|'completed'|'cancelled'|...,
 *   bookingId?,
 *   customerId?,
 *   technicianId?,
 *   serviceName?,
 *   bookingCode?,
 *   title?,
 *   body?,
 *   audience?: 'customer'|'technician'|'both'
 * }
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    assertSecret(req);
    const body = readJsonBody(req);
    const eventType = String(body.eventType || '').trim();
    if (!eventType) return res.status(400).json({ error: 'eventType required' });

    const db = getDb();
    const messaging = parseServiceAccount() ? getFcm() : null;

    let customerId = body.customerId ? String(body.customerId) : '';
    let technicianId = body.technicianId ? String(body.technicianId) : '';
    let serviceName = String(body.serviceName || '');
    let bookingCode = String(body.bookingCode || '');
    const bookingId = body.bookingId ? String(body.bookingId) : '';

    if (bookingId && (!customerId || !technicianId || !serviceName)) {
      const snap = await db.collection('bookings').doc(bookingId).get();
      if (snap.exists) {
        const b = snap.data() || {};
        customerId = customerId || String(b.customerId || '');
        technicianId = technicianId || String(b.technicianId || '');
        serviceName = serviceName || String(b.serviceName || '');
        bookingCode = bookingCode || String(b.bookingCode || '');
      }
    }

    const audience = String(body.audience || 'both').toLowerCase();
    const results = { customer: null, technician: null };

    const notifyCustomer =
      audience === 'customer' || audience === 'both' || audience === 'all';
    const notifyTech =
      audience === 'technician' || audience === 'both' || audience === 'all';

    if (notifyCustomer && customerId) {
      const cSnap = await db.collection('customers').doc(customerId).get();
      const tokens = collectTokensFromDoc(cSnap.exists ? cSnap.data() : {});
      const title = body.title || 'Booking Update';
      const msgBody = body.body || customerBody(eventType, serviceName);
      results.customer = await deliverToTokens(messaging, tokens, {
        title,
        body: msgBody,
        data: {
          type: eventType,
          bookingId,
          eventType,
        },
      });
    }

    if (notifyTech && technicianId) {
      const tSnap = await db.collection('technicians').doc(technicianId).get();
      const tokens = collectTokensFromDoc(tSnap.exists ? tSnap.data() : {});
      const techEvent =
        eventType === 'assigned' || eventType === 'created'
          ? 'booking_assigned'
          : eventType === 'cancelled'
            ? 'booking_cancelled'
            : eventType;
      const title = body.techTitle || 'Repair Series';
      const msgBody = body.techBody || techBody(techEvent, serviceName, bookingCode);
      results.technician = await deliverToTokens(messaging, tokens, {
        title,
        body: msgBody,
        data: {
          type: techEvent === 'booking_assigned' ? 'booking_assigned' : techEvent,
          bookingId,
          eventType: techEvent,
          serviceName,
          bookingCode,
        },
      });
    }

    return res.status(200).json({ ok: true, results });
  } catch (e) {
    const code = e.statusCode || 500;
    return res.status(code).json({ error: e.message || 'Notify failed' });
  }
};
