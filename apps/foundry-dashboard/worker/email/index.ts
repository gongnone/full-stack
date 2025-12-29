import { SESClient, SendEmailCommand, type SendEmailCommandInput } from '@aws-sdk/client-ses';
import type { Env } from '../index';

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

/**
 * Create SES client from environment configuration
 */
function createSESClient(env: Env): SESClient {
  return new SESClient({
    region: env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
}

/**
 * Send an email via AWS SES
 * Includes retry logic with exponential backoff
 */
async function sendEmail(
  env: Env,
  options: SendEmailOptions,
  retries = 3
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const client = createSESClient(env);
  const fromEmail = env.EMAIL_FROM || 'noreply@foundry.williamjshaw.ca';

  const params: SendEmailCommandInput = {
    Destination: {
      ToAddresses: [options.to],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: options.html,
        },
        Text: {
          Charset: 'UTF-8',
          Data: options.text,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: options.subject,
      },
    },
    Source: fromEmail,
  };

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const command = new SendEmailCommand(params);
      const response = await client.send(command);

      return {
        success: true,
        messageId: response.MessageId,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Log error without PII (email address or subject)
      console.error(`Email send attempt ${attempt}/${retries} failed:`, {
        error: lastError.message,
      });

      if (attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

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
 * Midnight Command branded email template wrapper
 */
function wrapInTemplate(content: string): string {
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
              ${content}
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

  const htmlContent = `
    <p style="margin: 0 0 20px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      Hi ${userName},
    </p>
    <p style="margin: 0 0 24px; font-size: 16px; color: #E7E9EA; line-height: 1.6;">
      Welcome to The Agentic Content Foundry! Click the button below to verify your email address and activate your account.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
      <tr>
        <td style="background-color: #00D26A; border-radius: 6px;">
          <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #0F1419; text-decoration: none;">
            Verify Email
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 0 0 16px; font-size: 14px; color: #8B98A5; line-height: 1.6;">
      This link expires in 24 hours.
    </p>
    <p style="margin: 0; font-size: 14px; color: #8B98A5; line-height: 1.6;">
      If you didn't create this account, you can safely ignore this email.
    </p>
  `;

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
    html: wrapInTemplate(htmlContent),
    text: textContent.trim(),
  });

  return result;
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
