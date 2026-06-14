import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [Sentry.replayIntegration()],
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
