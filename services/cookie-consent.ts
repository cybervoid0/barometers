import { FrontRoutes } from '@/constants'
import { CookieConsentConfig } from 'vanilla-cookieconsent'

/**
 * Cookie consent configuration for the application.
 *
 * This configuration:
 * - Defines cookie categories (necessary, analytics, functional)
 * - Configures Google Analytics and PayPal services
 * - Sets up automatic cookie clearing for rejected services
 * - Provides user interface text and descriptions
 * - Ensures GDPR compliance with detailed cookie information
 * - Only shows to EU users (GDPR compliance)
 */
const cookieConsentConfig = {
  autoShow: true,
  guiOptions: {
    consentModal: {
      position: 'bottom left',
    },
  },
  categories: {
    necessary: {
      readOnly: true,
      enabled: true,
    },
    analytics: {
      services: {
        googleAnalytics: {
          label: 'Google Analytics',
          cookies: [
            { name: /^_ga$/ }, // Universal/GA4 base
            { name: /^_ga_\w{6,}$/ }, // GA4 property cookie (_ga_XXXXXXXX)
            { name: /^_gid$/ },
          ],
        },
      },
      autoClear: {
        cookies: [{ name: /^_ga$/ }, { name: /^_ga_\w{6,}$/ }, { name: /^_gid$/ }],
      },
    },
    functional: {
      services: {
        payPal: {
          label: 'PayPal',
          cookies: [
            {
              name: /^(cookie_prefs|cookie_check|d_id|datadome|ddall|enforce_policy|fn_dt|l7_az|LANG|nsid|rssk|tcs|TLTDID|TLTSID|ts|ts_c|tsrce|x-pp-s)$/,
              domain: '.paypal.com',
            },
          ],
        },
      },
      autoClear: {
        cookies: [
          {
            name: /^(cookie_prefs|cookie_check|d_id|datadome|ddall|enforce_policy|fn_dt|l7_az|LANG|nsid|rssk|tcs|TLTDID|TLTSID|ts|ts_c|tsrce|x-pp-s)$/,
            domain: '.paypal.com',
          },
        ],
      },
    },
  },
  language: {
    default: 'en',

    translations: {
      en: {
        consentModal: {
          title: "Hello traveler, it's cookie time!",
          description:
            'Our website uses tracking cookies to understand how you interact with it. The tracking will be enabled only if you accept explicitly. <a href="#" data-cc="show-preferencesModal" class="cc__link">Manage preferences</a>',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          showPreferencesBtn: 'Manage preferences',
          footer: `
						<a href="${FrontRoutes.Terms}">Terms & Conditions</a>
					`,
        },
        preferencesModal: {
          title: 'Cookie preferences',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          savePreferencesBtn: 'Save preferences',
          closeIconLabel: 'Close',
          sections: [
            {
              title: 'Cookie Usage',
              description:
                'I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="${FrontRoutes.Terms}" class="cc__link">terms and conditions</a>.',
            },
            {
              title: 'Strictly necessary cookies',
              description:
                'These cookies are essential for the website to function properly. They cannot be disabled.',
              linkedCategory: 'necessary',
              cookieTable: {
                headers: {
                  name: 'Name',
                  domain: 'Service',
                  description: 'Description',
                  expiration: 'Expiration',
                },
                body: [
                  {
                    name: '__Host-next-auth.csrf-token',
                    domain: 'NextAuth.js',
                    description: 'CSRF protection token for secure authentication.',
                    expiration: 'Session',
                  },
                  {
                    name: '__Secure-next-auth.callback-url',
                    domain: 'NextAuth.js',
                    description: 'Callback URL for authentication redirects.',
                    expiration: 'Session',
                  },
                  {
                    name: 'cc_cookie',
                    domain: 'Cookie Consent',
                    description: 'Stores your cookie preferences and consent choices.',
                    expiration: '1 year',
                  },
                  {
                    name: 'geo_country',
                    domain: 'Geolocation',
                    description:
                      'Stores your country code (e.g., "DE", "US") to determine if cookie consent is required for EU users.',
                    expiration: '1 day',
                  },
                ],
              },
            },
            {
              title: 'Performance and Analytics cookies',
              linkedCategory: 'analytics',
              cookieTable: {
                headers: {
                  name: 'Name',
                  domain: 'Service',
                  description: 'Description',
                  expiration: 'Expiration',
                },
                body: [
                  {
                    name: '_ga',
                    domain: 'Google Analytics',
                    description: 'Cookie set by Google Analytics for tracking website usage.',
                    expiration: 'Expires after 12 days',
                  },
                  {
                    name: '_gid',
                    domain: 'Google Analytics',
                    description: 'Cookie set by Google Analytics for tracking website usage',
                    expiration: 'Session',
                  },
                ],
              },
            },
            {
              title: 'Functional cookies',
              linkedCategory: 'functional',
              description:
                'These cookies enable enhanced functionality and personalization, such as payment processing.',
              cookieTable: {
                headers: {
                  name: 'Name',
                  domain: 'Service',
                  description: 'Description',
                  expiration: 'Expiration',
                },
                body: [
                  {
                    name: 'cookie_prefs',
                    domain: 'PayPal',
                    description: 'Stores user cookie preferences for PayPal services.',
                    expiration: '1 year',
                  },
                  {
                    name: 'cookie_check',
                    domain: 'PayPal',
                    description: 'Verifies that cookies are enabled in the browser.',
                    expiration: 'Session',
                  },
                  {
                    name: 'd_id',
                    domain: 'PayPal',
                    description: 'Device identifier for fraud prevention and security.',
                    expiration: '1 year',
                  },
                  {
                    name: 'datadome',
                    domain: 'PayPal',
                    description: 'Bot protection and security monitoring.',
                    expiration: '1 year',
                  },
                  {
                    name: 'ddall',
                    domain: 'PayPal',
                    description: 'DataDome security and bot detection configuration.',
                    expiration: '1 year',
                  },
                  {
                    name: 'enforce_policy',
                    domain: 'PayPal',
                    description: 'GDPR compliance and privacy policy enforcement.',
                    expiration: '1 year',
                  },
                  {
                    name: 'fn_dt',
                    domain: 'PayPal',
                    description: 'Function timestamp for session tracking.',
                    expiration: 'Session',
                  },
                  {
                    name: 'l7_az',
                    domain: 'PayPal',
                    description: 'Load balancer availability zone identifier.',
                    expiration: 'Session',
                  },
                  {
                    name: 'LANG',
                    domain: 'PayPal',
                    description: 'User language preference for localization.',
                    expiration: '1 year',
                  },
                  {
                    name: 'nsid',
                    domain: 'PayPal',
                    description: 'Session identifier for maintaining user session.',
                    expiration: 'Session',
                  },
                  {
                    name: 'rssk',
                    domain: 'PayPal',
                    description: 'Risk assessment session key for fraud prevention.',
                    expiration: '1 year',
                  },
                  {
                    name: 'tcs',
                    domain: 'PayPal',
                    description: 'Terms and conditions acceptance tracking.',
                    expiration: 'Session',
                  },
                  {
                    name: 'TLTDID/TLTSID',
                    domain: 'PayPal',
                    description: 'Transaction and session identifiers for payment processing.',
                    expiration: 'Session / 1 year',
                  },
                  {
                    name: 'ts/ts_c/tsrce',
                    domain: 'PayPal',
                    description: 'Timestamp cookies for session synchronization.',
                    expiration: '1 year',
                  },
                  {
                    name: 'x-pp-s',
                    domain: 'PayPal',
                    description: 'PayPal session token for secure payment processing.',
                    expiration: 'Session',
                  },
                ],
              },
            },
            {
              title: 'More information',
              description: `For any queries in relation to my policy on cookies and your choices, please <a class="cc__link" href="${FrontRoutes.Terms}">contact me</a>.`,
            },
          ],
        },
      },
    },
  },
} satisfies CookieConsentConfig

export { cookieConsentConfig }
