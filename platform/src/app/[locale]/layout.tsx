import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { NextIntlClientProvider, useMessages } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import '@/app/globals.css'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: {
      default: t('title'),
      template: '%s | MetaBorghi',
    },
    description: t('description'),
    metadataBase: new URL(process.env.AUTH_URL || 'https://metaborghi.org'),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l === 'irp' ? 'it' : l, `/${l}`])
      ),
    },
    openGraph: {
      type: 'website',
      siteName: 'MetaBorghi',
      locale: locale === 'irp' ? 'it_IT' : locale === 'en' ? 'en_US' : 'it_IT',
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default

  return (
    <html lang={locale === 'irp' ? 'it' : locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
