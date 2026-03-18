import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function HomePage() {
  const t = useTranslations('home')
  const tNav = useTranslations('nav')

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 py-32 text-center bg-gradient-to-br from-brand-green/10 via-brand-cyan/5 to-brand-yellow/5">
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
          {t('hero.title')}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {t('hero.subtitle')}
        </p>
        <Link
          href="/borghi"
          className="mt-10 rounded-lg bg-[#00D084] px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-[#00b872] hover:shadow-xl"
        >
          {t('hero.cta')}
        </Link>
      </section>

      {/* Sezioni preview — da popolare in Fase 1 con dati reali */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-bold">{t('sections.borghi')}</h2>
        <p className="mt-2 text-muted-foreground">
          25 comuni dell'Alta Irpinia — da Lacedonia a Nusco
        </p>
        {/* Listing cards borghi — MVP 1 */}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-bold">{t('sections.esperienze')}</h2>
        {/* Listing cards esperienze — MVP 1 */}
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
        <p>MetaBorghi — {t.raw('sections.borghi')}</p>
      </footer>
    </main>
  )
}
