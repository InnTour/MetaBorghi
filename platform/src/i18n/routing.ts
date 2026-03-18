import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['it', 'en', 'irp'],
  defaultLocale: 'it',
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/borghi': {
      it: '/borghi',
      en: '/villages',
      irp: '/vurghi',
    },
    '/borghi/[slug]': {
      it: '/borghi/[slug]',
      en: '/villages/[slug]',
      irp: '/vurghi/[slug]',
    },
    '/esperienze': {
      it: '/esperienze',
      en: '/experiences',
      irp: '/esperienze',
    },
    '/esperienze/[slug]': {
      it: '/esperienze/[slug]',
      en: '/experiences/[slug]',
      irp: '/esperienze/[slug]',
    },
    '/aziende': {
      it: '/aziende',
      en: '/companies',
      irp: '/aziende',
    },
    '/aziende/[slug]': {
      it: '/aziende/[slug]',
      en: '/companies/[slug]',
      irp: '/aziende/[slug]',
    },
    '/artigianato': {
      it: '/artigianato',
      en: '/crafts',
      irp: '/artigianato',
    },
    '/prodotti': {
      it: '/prodotti',
      en: '/products',
      irp: '/prodotti',
    },
    '/contatti': {
      it: '/contatti',
      en: '/contacts',
      irp: '/contatti',
    },
  },
})
