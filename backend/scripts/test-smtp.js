// Simple SMTP verification and test email script
// Usage: node scripts/test-smtp.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

async function main() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = (process.env.SMTP_SECURE === 'true');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || `noreply@localhost`;
  const to = process.env.ADMIN_DEFAULT_EMAIL || process.env.EMAIL_TO || 'your-email@example.com';

  if (!host || !user || !pass) {
    console.error('Missing SMTP configuration in .env. Please ensure SMTP_HOST, SMTP_USER, and SMTP_PASS are set.');
    process.exit(1);
  }

  console.log('SMTP config: ', { host, port, secure, user, from, to });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // Helpful debug options
    logger: true,
    debug: true,
  });

  try {
    console.log('Verifying SMTP connection (transporter.verify)...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');
  } catch (err) {
    console.error('❌ SMTP verification failed:', err && err.message ? err.message : err);
    process.exit(2);
  }

  // Send a small test email
  const subject = `Varlixo SMTP test - ${new Date().toISOString()}`;
  const text = 'This is a test email sent from the local Varlixo test-smtp.js script.';

  try {
    console.log(`Sending test email to ${to} ...`);
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
    });
    console.log('✅ Test email queued/sent. MessageId:', info.messageId || info.response || '(no id)');
    console.log('Info:', info);
  } catch (err) {
    console.error('❌ Failed to send test email:', err && err.message ? err.message : err);
    process.exit(3);
  }
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(99);
});
