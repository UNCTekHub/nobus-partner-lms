import nodemailer from 'nodemailer';

// Create reusable transporter — configure via environment variables
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[Email] SMTP not configured — emails will be logged to console only');
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

const FROM_NAME = process.env.SMTP_FROM_NAME || 'Nobus Cloud Partner LMS';
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@nobus.cloud';
const PLATFORM_URL = process.env.PLATFORM_URL || 'http://localhost:3001';

// Send the partner onboarding email when an organization is approved
export async function sendPartnerApprovalEmail({ contactName, contactEmail, companyName, partnerId, tempPassword }) {
  const subject = `Welcome to Nobus Cloud Partner Program — ${companyName} Approved!`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0f766e, #0d9488); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Nobus Cloud</h1>
        <p style="color: #99f6e4; margin: 8px 0 0; font-size: 14px;">Partner Learning Management System</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <h2 style="color: #1e293b; margin-top: 0;">Welcome aboard, ${contactName}!</h2>

        <p style="color: #475569; line-height: 1.6;">
          Great news — <strong>${companyName}</strong> has been approved as a Nobus Cloud Partner!
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
            Login to Your LMS
          </a>
        </div>

        <!-- Getting Started -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
          <h3 style="color: #1e293b; font-size: 16px;">Getting Started</h3>
          <ol style="color: #475569; line-height: 1.8; padding-left: 20px;">
            <li><strong>Login</strong> with your credentials above</li>
            <li><strong>Change your password</strong> from your profile settings</li>
            <li><strong>Invite your team</strong> — add sales, presales, and technical staff</li>
            <li><strong>Start learning</strong> — explore Sales, Presales, and Technical certification paths</li>
            <li><strong>Track progress</strong> — monitor your team's certifications and tier progression</li>
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

— Nobus Cloud Partner Program
  `;

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: contactEmail,
    subject,
    html,
    text,
  };

  const transport = getTransporter();
  if (!transport) {
    console.log('[Email] Would send onboarding email to:', contactEmail);
    console.log('[Email] Subject:', subject);
    return { sent: false, reason: 'SMTP not configured' };
  }

  try {
    const info = await transport.sendMail(mailOptions);
    console.log('[Email] Onboarding email sent to:', contactEmail, 'MessageId:', info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] Failed to send onboarding email:', err.message);
    return { sent: false, reason: err.message };
  }
}

// Send rejection email
export async function sendPartnerRejectionEmail({ contactName, contactEmail, companyName }) {
  const subject = `Nobus Cloud Partner Application Update — ${companyName}`;

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

  const transport = getTransporter();
  if (!transport) {
    console.log('[Email] Would send rejection email to:', contactEmail);
    return { sent: false, reason: 'SMTP not configured' };
  }

  try {
    const info = await transport.sendMail(mailOptions);
    console.log('[Email] Rejection email sent to:', contactEmail);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] Failed to send rejection email:', err.message);
    return { sent: false, reason: err.message };
  }
}
