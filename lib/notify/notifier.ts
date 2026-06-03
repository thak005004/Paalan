/**
 * Notifier — delivers a confirm magic-link to a parent/helper.
 *
 * v1 ships SmsNotifier (Twilio / MSG91 stub; falls back to console in dev).
 * WhatsApp and email arrive later as sibling implementations — see Decision 12.
 */

export type NotifyChannel = 'sms' | 'whatsapp' | 'email';

export interface NotifyMessage {
  to: string;
  channel: NotifyChannel;
  body: string;
  link: string;
}

export interface NotifyResult {
  channel: NotifyChannel;
  delivered: boolean;
  providerId?: string;
  raw?: unknown;
}

export interface Notifier {
  readonly channel: NotifyChannel;
  send(msg: NotifyMessage): Promise<NotifyResult>;
}

export class SmsNotifier implements Notifier {
  readonly channel = 'sms' as const;

  async send(msg: NotifyMessage): Promise<NotifyResult> {
    const apiKey = process.env.SMS_API_KEY;
    const sender = process.env.SMS_SENDER_ID;

    if (!apiKey || !sender) {
      // Dev fallback: log to console so the magic link is visible
      // without standing up an SMS vendor.
      console.log(
        `[SmsNotifier · dev] → ${msg.to}\n  ${msg.body}\n  link: ${msg.link}`
      );
      return { channel: 'sms', delivered: true, providerId: 'dev-console' };
    }

    // Real vendor call would happen here — Twilio / MSG91 / etc.
    // The interface is the contract; the implementation is swappable.
    console.log(
      `[SmsNotifier] would call provider with key=${apiKey.slice(0, 4)}…`
    );
    return { channel: 'sms', delivered: true, providerId: 'stub' };
  }
}

export const smsNotifier = new SmsNotifier();

const notifiers = new Map<NotifyChannel, Notifier>();
notifiers.set(smsNotifier.channel, smsNotifier);

export function getNotifier(channel: NotifyChannel): Notifier {
  const n = notifiers.get(channel);
  if (!n) {
    throw new Error(
      `No notifier registered for channel "${channel}" — only "sms" is enabled in v1.`
    );
  }
  return n;
}
