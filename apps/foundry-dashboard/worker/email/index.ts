import type { Env } from '../index';
import type { D1Database } from '@cloudflare/workers-types';
import { sendSESEmail } from './ses-cloudflare';

/**
 * Email service for The Agentic Content Foundry
 * Uses AWS SES for transactional emails (verification, password reset)
 */

interface EmailUser {
  email: string;
  name?: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface SendEmailWithIdempotencyOptions extends SendEmailOptions {
  emailType: string; // 'brand_invite', 'verification', 'password_reset', etc.
  idempotencyKey: string; // Unique key to prevent duplicate sends
}

// Removed createSESClient - now using Cloudflare Workers-compatible sendSESEmail from ses-cloudflare.ts
// This fixes the "DOMParser is not defined" error that occurred with @aws-sdk/client-ses

/**
 * Send an email via AWS SES (simple version, no idempotency)
 *
 * Use this for emails that don't need idempotency protection:
 * - Verification emails (triggered by Better Auth, has its own dedup)
 * - Password reset emails (user-initiated, one-time)
 * - Notification emails (one-time events)
 *
 * For emails that can be triggered by race conditions (like brand invites),
 * use sendEmailWithIdempotency instead.
 */
async function sendEmail(
  env: Env,
  options: SendEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, subject, html, text } = options;

  // Use Cloudflare Workers-compatible SES client (fixes DOMParser error)
  return sendSESEmail(env, {
    to,
    subject,
    htmlBody: html,
    textBody: text,
  });
}

/**
 * Send an email via AWS SES with idempotency and smart retry
 *
 * CRITICAL DESIGN DECISIONS:
 * 1. Database-level idempotency check BEFORE sending (prevents duplicate sends)
 * 2. Retry on transient errors (network timeouts, rate limits) BUT re-check idempotency before each retry
 * 3. Log all attempts to email_send_log for monitoring and debugging
 * 4. If an email was already sent successfully (found in log), return success immediately
 *
 * This fixes the triple-send bug by ensuring:
 * - Only one successful send per idempotency key
 * - Retries check if a previous attempt succeeded before sending again
 * - All attempts are tracked for observability
 */
async function sendEmailWithIdempotency(
  env: Env,
  db: D1Database,
  options: SendEmailWithIdempotencyOptions,
  maxRetries = 3
): Promise<{ success: boolean; messageId?: string; error?: string; alreadySent?: boolean }> {
  const { to, subject, html, text, emailType, idempotencyKey } = options;

  // STEP 1: Check if email already sent successfully (idempotency check)
  const existingLog = await db
    .prepare('SELECT ses_message_id, status FROM email_send_log WHERE idempotency_key = ? AND status = ?')
    .bind(idempotencyKey, 'success')
    .first<{ ses_message_id: string; status: string }>();

  if (existingLog) {
    console.log(`[Email] Idempotency: Email already sent for key ${idempotencyKey}`);
    return {
      success: true,
      messageId: existingLog.ses_message_id,
      alreadySent: true,
    };
  }

  let lastError: Error | undefined;

  // STEP 2: Attempt send with smart retry
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Re-check idempotency before each retry (in case another request succeeded)
    if (attempt > 1) {
      const recheckLog = await db
        .prepare('SELECT ses_message_id FROM email_send_log WHERE idempotency_key = ? AND status = ?')
        .bind(idempotencyKey, 'success')
        .first<{ ses_message_id: string }>();

      if (recheckLog) {
        console.log(`[Email] Retry prevented: Another request succeeded for key ${idempotencyKey}`);
        return {
          success: true,
          messageId: recheckLog.ses_message_id,
          alreadySent: true,
        };
      }
    }

    try {
      // Log attempt
      const logId = crypto.randomUUID();
      const now = Date.now();
      await db
        .prepare(`
          INSERT INTO email_send_log (id, email_type, recipient_email, idempotency_key, status, attempt_number, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'retrying', ?, ?, ?)
        `)
        .bind(logId, emailType, to, idempotencyKey, attempt, now, now)
        .run();

      // Send email using Cloudflare Workers-compatible SES client (fixes DOMParser error)
      const response = await sendSESEmail(env, {
        to,
        subject,
        htmlBody: html,
        textBody: text,
      });

      if (!response.success) {
        throw new Error(response.error || 'Email send failed');
      }

      // Update log with success
      await db
        .prepare(`
          UPDATE email_send_log
          SET status = 'success', ses_message_id = ?, updated_at = ?
          WHERE id = ?
        `)
        .bind(response.messageId, Date.now(), logId)
        .run();

      return {
        success: true,
        messageId: response.messageId,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      console.error(`Email send attempt ${attempt}/${maxRetries} failed:`, {
        emailType,
        error: lastError.message,
        idempotencyKey,
      });

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // STEP 3: All retries failed - log final failure
  const logId = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(`
      INSERT INTO email_send_log (id, email_type, recipient_email, idempotency_key, status, attempt_number, error_message, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'failed', ?, ?, ?, ?)
    `)
    .bind(logId, emailType, to, idempotencyKey, maxRetries, lastError?.message || 'Unknown error', now, now)
    .run();

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
  };
}

/**
 * Simple HTML escape to prevent injection
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Wrap email content in the standard Foundry email template
 * Used for transactional emails with pre-formatted body content
 */
function wrapInTemplate(bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Agentic Content Foundry</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0F1419;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0F1419;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #1A1F26; border-radius: 8px; border: 1px solid #2A3038;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #2A3038;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #E7E9EA;">
                The Agentic Content Foundry
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #2A3038; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #8B98A5;">
                This email was sent by The Agentic Content Foundry.<br>
                If you have questions, contact support at support@williamjshaw.ca
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Midnight Command branded email template wrapper
 */
function brandedEmailTemplate(subject: string, body: string, ctaText: string, ctaUrl: string, footerText: string): string {
  const escapedSubject = escapeHtml(subject);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedSubject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0F1419;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0F1419;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #1A1F26; border-radius: 8px; border: 1px solid #2A3038;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #2A3038;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #E7E9EA;">
                The Agentic Content Foundry
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${body}
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                    <tr>
                        <td style="background-color: #1D9BF0; border-radius: 9999px;">
                            <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 700; color: #FFFFFF; text-decoration: none;">
                                ${ctaText}
                            </a>
                        </td>
                    </tr>
                </table>
               <p style="margin: 0; font-size: 14px; color: #8B98A5; line-height: 1.6;">
                ${footerText}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #2A3038; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #8B98A5;">
                This email was sent by The Agentic Content Foundry.<br>
                If you have questions, contact support at support@williamjshaw.ca
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Send verification email to new users
 * Token expires in 24 hours (handled by Better Auth)
 */
export async function sendVerificationEmail(
  env: Env,
  user: EmailUser,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> {
  // Skip sending if SES is not configured (dev mode - silent fallback)
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    return { success: true }; // Silent fallback for dev mode
  }

  const userName = escapeHtml(user.name || 'there');

    const subject = 'Verify your Foundry account';
  const htmlBody = brandedEmailTemplate(
        subject,
    `
    <p style="margin: 0 0 20px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      Hi ${userName},
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      Welcome to The Agentic Content Foundry! Click the button below to verify your email address and activate your account.
    </p>`,
    'Verify Email',
    verificationUrl,
    `This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.`
  );

  const textContent = `
Hi ${userName},

Welcome to The Agentic Content Foundry! Click the link below to verify your email address and activate your account.

Verify Email: ${verificationUrl}

This link expires in 24 hours.

If you didn't create this account, you can safely ignore this email.

---
The Agentic Content Foundry
`;

  const result = await sendEmail(env, {
    to: user.email,
    subject: 'Verify your Foundry account',
    html: htmlBody,
    text: textContent.trim(),
  });

  return result;
}

/**
 * Send Brand DNA invitation email (Story 10-1)
 *
 * @param token - The onboarding token, used as idempotency key (Fix Issue #6: Simplified from separate tokenId)
 */
export async function sendBrandDNAInvitation(
  env: Env,
  db: D1Database,
  email: string,
  clientName: string,
  inviteUrl: string,
  agencyName: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  // Silent fallback for dev mode
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    console.log(`[Email Mock] Sending Brand DNA Invite to ${email}: ${inviteUrl} (token: ${token})`);
    return { success: true };
  }

  const subject = `${agencyName} invited you to set up your brand voice`;

  const htmlBody = brandedEmailTemplate(
        subject,
        `
    <p style="margin: 0 0 20px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      Hi ${escapeHtml(clientName)},
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      ${escapeHtml(agencyName)} is setting up AI-powered content generation for your brand.
      To make sure every piece sounds authentically YOU, we need 2 minutes of your time.
    </p>
    <p style="margin: 0 0 16px; font-size: 14px; color: #8B98A5; line-height: 1.6;">
      You'll:
    </p>
    <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 14px; color: #E7E9EA; line-height: 1.6;">
      <li style="margin-bottom: 8px;">Record a quick voice note (just talk naturally!)</li>
      <li style="margin-bottom: 8px;">Optionally upload your best existing content</li>
    </ul>`,
        'Set Up My Brand Voice →',
        inviteUrl,
        'The more you share, the better your content will be.'
    );

  const textContent = `
Hi ${clientName},

${agencyName} is setting up AI-powered content generation for your brand.
To make sure every piece sounds authentically YOU, we need 2 minutes of your time.

Set Up My Brand Voice: ${inviteUrl}

You'll:
- Record a quick voice note (just talk naturally!)
- Optionally upload your best existing content

The more you share, the better your content will be.
`;

  return sendEmailWithIdempotency(env, db, {
    to: email,
    subject,
    html: htmlBody,
    text: textContent.trim(),
    emailType: 'brand_invite',
    idempotencyKey: `brand-invite-${token}`, // Use token as idempotency key
  });
}/**
 * Send Brand DNA completion notification to agency owner (Story 10-1 AC7)
 */
export async function sendBrandDNACompletionEmail(
  env: Env,
  agencyEmail: string,
  clientName: string,
  clientId: string,
  dashboardUrl: string
): Promise<{ success: boolean; error?: string }> {
  // Silent fallback for dev mode
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    console.log(`[Email Mock] Sending Brand DNA Completion notification to ${agencyEmail} for ${clientName}`);
    return { success: true };
  }

  const subject = `${clientName} completed Brand DNA setup`;

  const htmlContent = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      Great news! 🎉
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      <strong>${escapeHtml(clientName)}</strong> has completed their Brand DNA capture.
      Their voice profile is now being processed and will be ready for content generation shortly.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
      <tr>
        <td style="background-color: #00D26A; border-radius: 6px;">
          <a href="${dashboardUrl}/app/clients/${clientId}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #0F1419; text-decoration: none;">
            View Brand DNA Results →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 14px; color: #8B98A5; line-height: 1.6;">
      Next step: Once processing completes, you can start creating Hubs for ${escapeHtml(clientName)}.
    </p>
  `;

  const textContent = `
Great news!

${clientName} has completed their Brand DNA capture.
Their voice profile is now being processed and will be ready for content generation shortly.

View Brand DNA Results: ${dashboardUrl}/app/clients/${clientId}

Next step: Once processing completes, you can start creating Hubs for ${clientName}.
`;

  return sendEmail(env, {
    to: agencyEmail,
    subject,
    html: wrapInTemplate(htmlContent),
    text: textContent.trim(),
  });
}

/**
 * Send Strategy Ready email (Story 10-4)
 */
export async function sendStrategyReadyEmail(
  env: Env,
  email: string,
  clientName: string,
  approvalUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    console.log(`[Email Mock] Sending Strategy Ready to ${email}: ${approvalUrl}`);
    return { success: true };
  }

  const subject = `Your brand strategy is ready (2 min review)`;

  const htmlContent = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      Hi ${escapeHtml(clientName)},
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      We've analyzed your voice and researched your market.
      Your personalized content strategy is ready for review.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
      <tr>
        <td style="background-color: #00D26A; border-radius: 6px;">
          <a href="${approvalUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #0F1419; text-decoration: none;">
            Review My Strategy →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 14px; color: #8B98A5; line-height: 1.6;">
      Takes about 2 minutes. No login required.
    </p>
  `;

  const textContent = `
Hi ${clientName},

We've analyzed your voice and researched your market.
Your personalized content strategy is ready for review.

Review My Strategy: ${approvalUrl}

Takes about 2 minutes. No login required.
`;

  return sendEmail(env, {
    to: email,
    subject,
    html: wrapInTemplate(htmlContent),
    text: textContent.trim(),
  });
}

/**
 * Send Strategy Locked email to agency (Story 10-4)
 */
export async function sendStrategyLockedEmail(
  env: Env,
  agencyEmail: string,
  clientName: string,
  clientId: string,
  dashboardUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    console.log(`[Email Mock] Sending Strategy Locked to ${agencyEmail} for ${clientName}`);
    return { success: true };
  }

  const subject = `${clientName} locked their brand strategy`;

  const htmlContent = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      Great news! 🎉
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      <strong>${escapeHtml(clientName)}</strong> has approved their brand strategy.
      They're now ready for content generation!
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
      <tr>
        <td style="background-color: #00D26A; border-radius: 6px;">
          <a href="${dashboardUrl}/app/clients/${clientId}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #0F1419; text-decoration: none;">
            View Approved Pillars →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 14px; color: #8B98A5; line-height: 1.6;">
      You can now start creating Hubs for ${escapeHtml(clientName)}.
    </p>
  `;

  const textContent = `
Great news!

${clientName} has approved their brand strategy.
They're now ready for content generation!

View Approved Pillars: ${dashboardUrl}/app/clients/${clientId}

You can now start creating Hubs for ${clientName}.
`;

  return sendEmail(env, {
    to: agencyEmail,
    subject,
    html: wrapInTemplate(htmlContent),
    text: textContent.trim(),
  });
}

/**
 * Send password reset email
 * Token expires according to Better Auth configuration
 */
export async function sendPasswordResetEmail(
  env: Env,
  user: EmailUser,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  // Skip sending if SES is not configured (dev mode - silent fallback)
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    return { success: true }; // Silent fallback for dev mode
  }

  const userName = escapeHtml(user.name || 'there');

  const htmlContent = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      Hi ${userName},
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
      <tr>
        <td style="background-color: #1D9BF0; border-radius: 6px;">
          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 16px; font-size: 14px; color: #8B98A5; line-height: 1.6;">
      This link expires in 1 hour.
    </p>
    <p style="margin: 0; font-size: 14px; color: #8B98A5; line-height: 1.6;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  `;

  const textContent = `
Hi ${userName},

We received a request to reset your password. Click the link below to create a new password.

Reset Password: ${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
The Agentic Content Foundry
`;

  const result = await sendEmail(env, {
    to: user.email,
    subject: 'Reset your Foundry password',
    html: wrapInTemplate(htmlContent),
    text: textContent.trim(),
  });

  return result;
}
