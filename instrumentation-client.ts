import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Only report from production — local dev errors must not reach Sentry.
  enabled: process.env.NODE_ENV === 'production',
  integrations: [Sentry.replayIntegration()],
  // Non-actionable noise — none of these originate from our application logic:
  ignoreErrors: [
    // Privacy browsers' injected content scripts (e.g. DuckDuckGo Mobile)
    // throwing from their own message handlers; no stacktrace, not our code.
    'invalid origin',
    // Bots/scanners POSTing malformed multipart to non-existent routes.
    'missing final boundary',
    // Stale bundle/deployment on the client after a release (old chunk).
    'Failed to find Server Action',
    // WebKit/Safari generic for aborted or failed fetches (user left / network).
    'Load failed',
    // Browser extensions / page translators mutating the DOM out from under
    // React's reconciler.
    "Failed to execute 'removeChild' on 'Node'",
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,
  enableLogs: true,
  // record replays only for sessions that hit an error — the 50/mo quota is too
  // small to spend on random sessions (see Sentry billing). Bump session rate
  // back up only with a larger reserved/PAYG budget.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
