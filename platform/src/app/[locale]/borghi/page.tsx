import { getTranslations } from 'next-intl/server'
import { db } from '@/db'
import { boroughs } from '@/db/schema'
import { asc } from 'drizzle-orm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BorghiPage() {
  const t = await getTranslations('borghi')

  let allBoroughs: (typeof boroughs.$inferSelect)[] = []
  try {
    allBoroughs = await db.select().from(boroughs).orderBy(asc(boroughs.name))
  } catch {
    // In sviluppo locale senza DB, mostra placeholder
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{t('subtitle')}</p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allBoroughs.map((borough) => (
          <Link
            key={borough.id}
            href={`/borghi/${borough.slug}`}
            className="group rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-md hover:border-brand-green/50"
          >
            <h2 className="text-xl font-semibold group-hover:text-[#00D084] transition-colors">
              {borough.name}
            </h2>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {borough.population && (
                <span>{t('population')}: {borough.population.toLocaleString('it-IT')}</span>
              )}
              {borough.altitudeMeters && (
                <span>{t('altitude')}: {borough.altitudeMeters}m</span>
              )}
            </div>
            {borough.description && (
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                {borough.description}
              </p>
            )}
          </Link>
        ))}

        {allBoroughs.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            {t('search')} — Connetti il database per vedere i 25 borghi.
          </p>
        )}
      </div>
    </main>
  )
}
