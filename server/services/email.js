import nodemailer from 'nodemailer';
import fs from 'fs';

// Create reusable transporter - configure via environment variables
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[Email] SMTP not configured - emails will be logged to console only');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

let transporter = null;

function getTransporter() {
  if (!transporter) transporter = createTransporter();
  return transporter;
}

const FROM_NAME = process.env.SMTP_FROM_NAME || 'Nobus PartnerCentral';
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@nobus.cloud';
const PLATFORM_URL = process.env.PLATFORM_URL || 'http://localhost:3001';

// Whether real email delivery is configured. Used by callers to decide messaging.
export function emailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

// Single send path for every email. Safe when SMTP is off (logs and no-ops).
// When EMAIL_TEST_FILE is set, each intended send is appended as JSON for tests.
async function sendMail(mailOptions) {
  if (!mailOptions.from) mailOptions.from = `"${FROM_NAME}" <${FROM_EMAIL}>`;
  if (process.env.EMAIL_TEST_FILE) {
    try { fs.appendFileSync(process.env.EMAIL_TEST_FILE, JSON.stringify({ to: mailOptions.to, subject: mailOptions.subject, at: new Date().toISOString() }) + '\n'); } catch { /* ignore */ }
  }
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Email] (unsent - SMTP off) "${mailOptions.subject}" -> ${mailOptions.to}`);
    return { sent: false, reason: 'SMTP not configured' };
  }
  try {
    const info = await transport.sendMail(mailOptions);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] send failed:', err.message);
    return { sent: false, reason: err.message };
  }
}

// Shared branded wrapper so every platform email looks consistent.
export function renderBrandedEmail({ heading, paragraphs = [], ctaText, ctaUrl, rows, footerNote }) {
  const body = paragraphs.map((p) => `<p style="color:#475569;line-height:1.6;margin:0 0 14px;">${p}</p>`).join('');
  const table = rows && rows.length
    ? `<div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:16px 20px;margin:20px 0;"><table style="width:100%;border-collapse:collapse;">${rows.map((r) => `<tr><td style="padding:5px 0;color:#64748b;font-size:14px;">${r.label}</td><td style="padding:5px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;">${r.value}</td></tr>`).join('')}</table></div>`
    : '';
  const cta = ctaText && ctaUrl
    ? `<div style="text-align:center;margin:28px 0;"><a href="${ctaUrl}" style="display:inline-block;background:#0f766e;color:#fff;padding:13px 30px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">${ctaText}</a></div>`
    : '';
  const html = `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
    <div style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:26px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:22px;">Nobus Cloud</h1><p style="color:#99f6e4;margin:6px 0 0;font-size:13px;">PartnerCentral</p></div>
    <div style="padding:30px;"><h2 style="color:#1e293b;margin:0 0 16px;">${heading}</h2>${body}${table}${cta}${footerNote ? `<p style="color:#94a3b8;font-size:13px;line-height:1.6;margin-top:20px;">${footerNote}</p>` : ''}</div>
    <div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;"><p style="color:#94a3b8;font-size:12px;margin:0;">Nobus PartnerCentral · automated message. Manage which emails you receive in your profile settings.</p></div>
  </div>`;
  const text = `${heading}\n\n${paragraphs.join('\n\n')}${rows ? '\n\n' + rows.map((r) => `${r.label}: ${r.value}`).join('\n') : ''}${ctaUrl ? `\n\n${ctaText}: ${ctaUrl}` : ''}`;
  return { html, text };
}

const absUrl = (link) => (!link ? null : link.startsWith('http') ? link : `${PLATFORM_URL}${link}`);

// Generic event notification email (subject/body derived from the in-app notice).
export async function sendNotificationEmail({ to, name, subject, message, link, ctaText }) {
  const url = absUrl(link);
  const { html, text } = renderBrandedEmail({
    heading: subject,
    paragraphs: [`Hi ${name || 'there'},`, message],
    ctaText: url ? (ctaText || 'Open PartnerCentral') : null,
    ctaUrl: url,
  });
  return sendMail({ to, subject, html, text });
}

// Digest email with a heading and a list of summary lines.
export async function sendDigestEmail({ to, name, subject, intro, lines, link, ctaText }) {
  const url = absUrl(link);
  const { html, text } = renderBrandedEmail({
    heading: subject,
    paragraphs: [`Hi ${name || 'there'},`, intro, ...lines],
    ctaText: url ? (ctaText || 'Open PartnerCentral') : null,
    ctaUrl: url,
  });
  return sendMail({ to, subject, html, text });
}

// Send the partner onboarding email when an organization is approved
export async function sendPartnerApprovalEmail({ contactName, contactEmail, companyName, partnerId, tempPassword }) {
  const subject = `Welcome to Nobus Cloud Partner Program - ${companyName} Approved!`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0f766e, #0d9488); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Nobus Cloud</h1>
        <p style="color: #99f6e4; margin: 8px 0 0; font-size: 14px;">Partner Portal</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <h2 style="color: #1e293b; margin-top: 0;">Welcome aboard, ${contactName}!</h2>

        <p style="color: #475569; line-height: 1.6;">
          Great news - <strong>${companyName}</strong> has been approved as a Nobus Cloud Partner!
          Your organization is now part of our partner ecosystem.
        </p>

        <!-- Partner Details Card -->
        <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #0f766e; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Your Partner Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Organization</td>
              <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${companyName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Partner ID</td>
              <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${partnerId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Tier</td>
              <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600;">Registered</td>
            </tr>
          </table>
        </div>

        <!-- Login Credentials -->
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #92400e; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Your Login Credentials</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Email</td>
              <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${contactEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Temporary Password</td>
              <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600; font-family: monospace;">${tempPassword}</td>
            </tr>
          </table>
          <p style="color: #92400e; font-size: 12px; margin-bottom: 0;">
            ⚠ Please change your password after your first login.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${PLATFORM_URL}"
             style="display: inline-block; background: #0f766e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Login to PartnerCentral
          </a>
        </div>

        <!-- Getting Started -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
          <h3 style="color: #1e293b; font-size: 16px;">Getting Started</h3>
          <ol style="color: #475569; line-height: 1.8; padding-left: 20px;">
            <li><strong>Login</strong> with your credentials above</li>
            <li><strong>Change your password</strong> from your profile settings</li>
            <li><strong>Invite your team</strong> - add sales, presales, and technical staff</li>
            <li><strong>Start learning</strong> - explore Sales, Presales, and Technical certification paths</li>
            <li><strong>Track progress</strong> - monitor your team's certifications and tier progression</li>
          </ol>
        </div>

        <!-- Tier Info -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #1e293b; font-size: 14px; margin-top: 0;">Partner Tier Progression</h3>
          <p style="color: #475569; font-size: 13px; line-height: 1.6; margin-bottom: 0;">
            Your organization starts at <strong>Registered</strong> tier. As your team completes certifications,
            you'll progress through <strong>Silver → Gold → Platinum → Elite</strong> tiers, unlocking
            additional benefits, higher margins, and exclusive opportunities.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          Nobus Cloud Partner Program<br>
          This is an automated message. If you did not apply for partnership, please ignore this email.
        </p>
      </div>
    </div>
  `;

  const text = `
Welcome to Nobus Cloud Partner Program!

Hi ${contactName},

${companyName} has been approved as a Nobus Cloud Partner!

Your Partner Details:
- Organization: ${companyName}
- Partner ID: ${partnerId}
- Tier: Registered

Your Login Credentials:
- Email: ${contactEmail}
- Temporary Password: ${tempPassword}
- Login URL: ${PLATFORM_URL}

Please change your password after your first login.

Getting Started:
1. Login with your credentials
2. Change your password from profile settings
3. Invite your team members
4. Start the Sales, Presales, or Technical learning paths
5. Track progress and advance your partner tier

Partner Tier Progression:
Registered → Silver → Gold → Platinum → Elite

- Nobus Cloud Partner Program
  `;

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: contactEmail,
    subject,
    html,
    text,
  };

  return sendMail(mailOptions);
}

// Send rejection email
export async function sendPartnerRejectionEmail({ contactName, contactEmail, companyName }) {
  const subject = `Nobus Cloud Partner Application Update - ${companyName}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #0f766e, #0d9488); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Nobus Cloud</h1>
        <p style="color: #99f6e4; margin: 8px 0 0; font-size: 14px;">Partner Program</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1e293b; margin-top: 0;">Dear ${contactName},</h2>
        <p style="color: #475569; line-height: 1.6;">
          Thank you for your interest in the Nobus Cloud Partner Program. After reviewing
          <strong>${companyName}</strong>'s application, we are unable to approve it at this time.
        </p>
        <p style="color: #475569; line-height: 1.6;">
          This could be due to incomplete information or eligibility criteria. You are welcome to
          reapply with updated details.
        </p>
        <p style="color: #475569; line-height: 1.6;">
          If you have questions, please contact our partner team for further guidance.
        </p>
      </div>
      <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Nobus Cloud Partner Program</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: contactEmail,
    subject,
    html,
  };

  return sendMail(mailOptions);
}

// Send a password reset link. The token is contained in resetUrl and is never logged.
export async function sendPasswordResetEmail({ contactName, contactEmail, resetUrl }) {
  const subject = 'Reset your Nobus PartnerCentral password';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #0f766e, #0d9488); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Nobus Cloud</h1>
        <p style="color: #99f6e4; margin: 8px 0 0; font-size: 14px;">Partner Portal</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1e293b; margin-top: 0;">Password reset request</h2>
        <p style="color: #475569; line-height: 1.6;">
          Hi ${contactName || 'there'}, we received a request to reset your PartnerCentral password.
          Click the button below to choose a new one. This link expires in 1 hour.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #0f766e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
          If you did not request this, you can safely ignore this email; your password will not change.
        </p>
      </div>
      <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Nobus PartnerCentral · automated message</p>
      </div>
    </div>
  `;

  const text = `Password reset request\n\nHi ${contactName || 'there'},\n\nReset your Nobus PartnerCentral password using this link (expires in 1 hour):\n${resetUrl}\n\nIf you did not request this, ignore this email.`;

  const mailOptions = { from: `"${FROM_NAME}" <${FROM_EMAIL}>`, to: contactEmail, subject, html, text };
  return sendMail(mailOptions);
}
