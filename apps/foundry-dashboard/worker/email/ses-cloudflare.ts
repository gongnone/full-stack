/**
 * Cloudflare Workers-native SES email sender
 *
 * This replaces the AWS SDK v3 which has DOMParser issues in Workers runtime.
 * Uses direct HTTPS API calls with AWS Signature V4 authentication.
 */

import { AwsClient } from 'aws4fetch';
import type { Env } from '../index';

export interface SESEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  from?: string;
}

/**
 * Send email via AWS SES using Cloudflare Workers-compatible fetch
 *
 * This avoids the DOMParser error by using aws4fetch instead of @aws-sdk/client-ses.
 *
 * @see https://github.com/aws/aws-sdk-js-v3/issues/7375
 */
export async function sendSESEmail(
  env: Env,
  params: SESEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, subject, htmlBody, textBody, from } = params;

  const region = env.AWS_REGION || 'us-east-1';
  const fromEmail = from || env.EMAIL_FROM || 'noreply@foundry.williamjshaw.ca';

  // Create AWS client with credentials
  const aws = new AwsClient({
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
    region,
  });

  // Build SES SendEmail request
  const sesParams = new URLSearchParams({
    'Action': 'SendEmail',
    'Source': fromEmail,
    'Destination.ToAddresses.member.1': to,
    'Message.Subject.Data': subject,
    'Message.Subject.Charset': 'UTF-8',
    'Message.Body.Html.Data': htmlBody,
    'Message.Body.Html.Charset': 'UTF-8',
    'Message.Body.Text.Data': textBody,
    'Message.Body.Text.Charset': 'UTF-8',
  });

  try {
    // Sign and send the request
    const response = await aws.fetch(`https://email.${region}.amazonaws.com/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: sesParams.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SES API error: ${response.status} - ${errorText}`);
    }

    // Parse XML response to get MessageId
    const responseText = await response.text();
    const messageIdMatch = responseText.match(/<MessageId>(.*?)<\/MessageId>/);
    const messageId = messageIdMatch ? messageIdMatch[1] : undefined;

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      error: err.message,
    };
  }
}
