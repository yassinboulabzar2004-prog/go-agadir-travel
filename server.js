const path = require('path');
const cors = require('cors');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_DIR = path.join(__dirname, 'HOME PAGE');

app.use(cors({
  origin: [
    'https://goagadirtravel.com',
    'https://www.goagadirtravel.com'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.static(SITE_DIR));

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? `€${number}` : escapeHtml(value || '€0');
};

const requiredEnv = () => ['RESEND_API_KEY', 'OWNER_EMAIL'].filter((key) => !process.env[key]);

const resendFromEmail = () => process.env.RESEND_FROM_EMAIL || 'Go Agadir Travel <bookings@goagadirtravel.com>';

const sendResendEmail = async ({ to, replyTo, subject, text, html }) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: resendFromEmail(),
      to,
      reply_to: replyTo,
      subject,
      text,
      html
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = result.message || result.error || `Resend API returned ${response.status}`;
    throw new Error(message);
  }

  return result;
};

const makeRows = (rows) => rows.map(([label, value]) => `
  <tr>
    <td style="padding:12px 0;color:#64748b;font-weight:800;">${escapeHtml(label)}</td>
    <td style="padding:12px 0;color:#251006;font-weight:900;text-align:right;">${escapeHtml(value || 'None')}</td>
  </tr>
`).join('');

const addonsText = (addons = []) => {
  if (!addons.length) {
    return 'None';
  }

  return addons.map((addon) => {
    const pax = addon.pax || 1;
    return `${addon.name} x ${pax} (${formatMoney(addon.total).replace('€', 'EUR ')})`;
  }).join(', ');
};

const buildEmailTemplate = ({ title, subtitle, booking, customer, bookingId, ownerView = false }) => {
  const pickup = booking.pickup?.choice === "I'd like to be picked up"
    ? `${booking.pickup.choice} - ${booking.pickup.location || 'Location not provided'}`
    : booking.pickup?.choice || 'Not selected';

  const rows = [
    ['Booking ID', bookingId],
    ['Activity', booking.activity],
    ['Date & Time', `${booking.date} @ ${booking.time}`],
    ['Travelers', booking.travelers],
    ['Option Type', booking.option],
    ['Add-ons', addonsText(booking.addons)],
    ['Pickup point', pickup],
    ['Total Trip Price', formatMoney(booking.totalPrice)]
  ];

  const customerRows = [
    ['Full name', customer.name],
    ['Email', customer.email],
    ['WhatsApp', `${customer.whatsappCountry || ''} ${customer.whatsapp || ''}`],
    ['Notes', customer.notes || 'None']
  ];

  return `
<!doctype html>
<html>
  <body style="margin:0;background:#fffaf4;font-family:Inter,Arial,sans-serif;color:#061433;">
    <div style="max-width:760px;margin:0 auto;padding:34px 18px;">
      <div style="border:1px solid #f3dfc0;border-radius:28px;background:#ffffff;box-shadow:0 20px 55px rgba(119,72,0,.10);overflow:hidden;">
        <div style="padding:30px 34px;background:#251006;color:#fff;">
          <div style="display:inline-block;padding:9px 14px;border-radius:999px;background:#ff8a00;color:#fff;font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">Go Agadir Travel</div>
          <h1 style="margin:22px 0 8px;font-size:34px;line-height:1.1;text-transform:uppercase;">${escapeHtml(title)}</h1>
          <p style="margin:0;color:#ffe1b4;font-weight:800;">${escapeHtml(subtitle)}</p>
        </div>

        <div style="padding:30px 34px;">
          <h2 style="margin:0 0 16px;color:#ff6f00;font-size:13px;letter-spacing:4px;text-transform:uppercase;">Booking summary</h2>
          <table style="width:100%;border-collapse:collapse;border-top:1px solid #f3dfc0;border-bottom:1px solid #f3dfc0;">
            ${makeRows(rows)}
          </table>

          ${ownerView ? `
          <h2 style="margin:30px 0 16px;color:#ff6f00;font-size:13px;letter-spacing:4px;text-transform:uppercase;">Lead traveler</h2>
          <table style="width:100%;border-collapse:collapse;border-top:1px solid #f3dfc0;border-bottom:1px solid #f3dfc0;">
            ${makeRows(customerRows)}
          </table>
          ` : ''}

          <p style="margin:28px 0 0;color:#344054;font-size:15px;line-height:1.7;font-weight:800;">
            ${ownerView
              ? 'Please contact the traveler on WhatsApp to finalize pickup and availability.'
              : 'No payment is required today. Our local concierge will contact you on WhatsApp within 1-2 hours to confirm availability and pickup details.'}
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;
};

const buildTextEmail = ({ booking, customer, bookingId }) => {
  const pickup = booking.pickup?.choice === "I'd like to be picked up"
    ? `${booking.pickup.choice} - ${booking.pickup.location || 'Location not provided'}`
    : booking.pickup?.choice || 'Not selected';

  return [
    `Booking ID: ${bookingId}`,
    `Activity: ${booking.activity}`,
    `Date & Time: ${booking.date} @ ${booking.time}`,
    `Travelers: ${booking.travelers}`,
    `Option Type: ${booking.option}`,
    `Add-ons: ${addonsText(booking.addons)}`,
    `Pickup point: ${pickup}`,
    `Total Trip Price: ${formatMoney(booking.totalPrice)}`,
    '',
    `Name: ${customer.name}`,
    `Email: ${customer.email}`,
    `WhatsApp: ${customer.whatsappCountry || ''} ${customer.whatsapp || ''}`,
    `Notes: ${customer.notes || 'None'}`
  ].join('\n');
};

const isValidBooking = (body) => {
  const customer = body.customer || {};
  const booking = body.booking || {};
  const missing = [];

  if (!customer.name) missing.push('customer.name');
  if (!customer.email || !customer.email.includes('@')) missing.push('customer.email');
  if (!customer.whatsapp) missing.push('customer.whatsapp');
  if (!booking.activity) missing.push('booking.activity');
  if (!booking.date) missing.push('booking.date');
  if (!booking.time) missing.push('booking.time');
  if (!booking.travelers) missing.push('booking.travelers');

  return missing;
};

app.post('/send-booking', async (req, res) => {
  const missingEnv = requiredEnv();
  if (missingEnv.length) {
    return res.status(500).json({
      ok: false,
      message: `Missing server environment variables: ${missingEnv.join(', ')}`
    });
  }

  const missingFields = isValidBooking(req.body);
  if (missingFields.length) {
    return res.status(400).json({
      ok: false,
      message: `Missing booking fields: ${missingFields.join(', ')}`
    });
  }

  const bookingId = `GAT-${Date.now().toString(36).toUpperCase()}`;
  const customer = req.body.customer;
  const booking = req.body.booking;

  res.json({
    ok: true,
    bookingId,
    message: 'Booking request received'
  });

  setImmediate(() => {
    try {
      const customerTemplate = buildEmailTemplate({
        title: 'Booking request received!',
        subtitle: 'No payment today - final confirmation is on the way',
        booking,
        customer,
        bookingId
      });

      const ownerTemplate = buildEmailTemplate({
        title: 'New booking request',
        subtitle: 'A traveler submitted a checkout request',
        booking,
        customer,
        bookingId,
        ownerView: true
      });

      const emailText = buildTextEmail({ booking, customer, bookingId });

      Promise.all([
        sendResendEmail({
          to: customer.email,
          replyTo: process.env.OWNER_EMAIL,
          subject: `Booking request received - ${booking.activity}`,
          text: emailText,
          html: customerTemplate
        }),
        sendResendEmail({
          to: process.env.OWNER_EMAIL,
          replyTo: customer.email,
          subject: `New booking request: ${booking.activity}`,
          text: emailText,
          html: ownerTemplate
        })
      ]).catch((error) => {
        console.error('Booking email failed via Resend:', error);
      });
    } catch (error) {
      console.error('Booking email setup failed:', error);
    }
  });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(SITE_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
