import { Resend } from 'resend'

/**
 * Email service (Resend).
 *
 * Designed to degrade gracefully: if `RESEND_API_KEY` is not configured the
 * client is `null` and {@link sendEmail} becomes a logged no-op. This keeps
 * local development and the Stripe webhook handler working without a key —
 * a transient mail outage (or missing config) must never break order
 * processing.
 */

const apiKey = process.env.RESEND_API_KEY

export const resend = apiKey ? new Resend(apiKey) : null

/** Verified sender. Falls back to the foundation's no-reply address. */
export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Barometers Realm <noreply@barometers.info>'

/** Optional reply-to (e.g. a monitored support inbox). */
export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO

interface SendEmailInput {
  to: string | string[]
  subject: string
  html: string
  text?: string
  /**
   * Unique key for safe retries. Recommended pattern `<event-type>/<entity-id>`
   * (e.g. `order-confirmation/<orderId>`). Keys expire after 24h on Resend.
   */
  idempotencyKey?: string
}

export interface SendEmailResult {
  sent: boolean
  /** True when skipped because no API key is configured. */
  skipped?: boolean
  error?: string
}

/**
 * Send a transactional email. Never throws — returns a result object so callers
 * (notably webhooks) can log failures without aborting their own work.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping "${input.subject}" to ${input.to}`)
    return { sent: false, skipped: true }
  }

  try {
    const { data, error } = await resend.emails.send(
      {
        from: EMAIL_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
        ...(input.text ? { text: input.text } : {}),
        ...(EMAIL_REPLY_TO ? { replyTo: EMAIL_REPLY_TO } : {}),
      },
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    )

    if (error) {
      console.error('[email] Resend returned an error:', error)
      return { sent: false, error: error.message }
    }

    console.log(`[email] Sent "${input.subject}" to ${input.to} (id: ${data?.id})`)
    return { sent: true }
  } catch (error) {
    console.error('[email] Unexpected error sending email:', error)
    return { sent: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
