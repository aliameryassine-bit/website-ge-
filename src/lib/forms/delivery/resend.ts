/**
 * Email notification: Resend.
 *
 * Called over HTTP rather than through the SDK. One POST to one endpoint does
 * not justify a dependency in the server bundle, and the base URL being an
 * environment variable is what makes the delivery path testable end to end
 * without a live account.
 *
 * The body is plain text, not HTML. This email is an operational alert read on
 * a phone, and the fields are the content.
 *
 * `replyTo` is the lead's own address, so replying from the inbox reaches them
 * directly instead of bouncing off a no-reply sender.
 */

const DEFAULT_BASE_URL = 'https://api.resend.com';

export type EmailResult =
  { sent: true; id: string } | { sent: false; reason: string; configured: boolean };

type ResendConfig = { baseUrl: string; apiKey: string; from: string; to: string[] };

function config(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEADS_FROM_EMAIL;
  const to = process.env.LEADS_TO_EMAIL;
  if (!apiKey || !from || !to) return null;
  return {
    baseUrl: process.env.RESEND_BASE_URL ?? DEFAULT_BASE_URL,
    apiKey,
    from,
    to: to
      .split(',')
      .map((address) => address.trim())
      .filter(Boolean),
  };
}

export async function sendNotification(args: {
  subject: string;
  body: string;
  replyTo?: string;
}): Promise<EmailResult> {
  const settings = config();
  if (!settings) {
    return {
      sent: false,
      configured: false,
      reason:
        'RESEND_API_KEY, LEADS_FROM_EMAIL or LEADS_TO_EMAIL is not set, so no notification can be sent.',
    };
  }

  try {
    const response = await fetch(`${settings.baseUrl}/emails`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${settings.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: settings.from,
        to: settings.to,
        subject: args.subject,
        text: args.body,
        ...(args.replyTo ? { reply_to: args.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return {
        sent: false,
        configured: true,
        reason: `Resend returned HTTP ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`,
      };
    }

    const body = (await response.json()) as { id?: string };
    return { sent: true, id: body.id ?? 'unknown' };
  } catch (error) {
    return {
      sent: false,
      configured: true,
      reason: `Resend request failed: ${(error as Error).message}`,
    };
  }
}
