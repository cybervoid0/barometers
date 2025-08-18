import { FrontRoutes } from '@/constants'
import { CookieConsentConfig } from 'vanilla-cookieconsent'

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
            {
              name: /^(_ga|_gid)/,
            },
          ],
        },
      },
      autoClear: {
        cookies: [
          {
            name: /^(_ga|_gid)/,
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
