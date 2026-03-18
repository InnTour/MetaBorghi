import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { db } from '@/db'
import { boroughs } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'borghi' })

  try {
    const borough = await db.query.boroughs.findFirst({
      where: eq(boroughs.slug, slug),
    })
    if (!borough) return { title: t('title') }

    return {
      title: borough.name,
      description: borough.description?.slice(0, 160),
      openGraph: {
        title: borough.name,
        description: borough.description?.slice(0, 160),
      },
    }
  } catch {
    return { title: t('title') }
  }
}

export default async function BoroughDetailPage({ params }: Props) {
  const { slug } = await params
  const t = await getTranslations('borghi')

  let borough: (typeof boroughs.$inferSelect) | undefined
  try {
    borough = await db.query.boroughs.findFirst({
      where: eq(boroughs.slug, slug),
      with: {
        highlights: true,
        notableProducts: true,
        notableExperiences: true,
        notableRestaurants: true,
        galleryImages: true,
      },
    })
  } catch {
    notFound()
  }

  if (!borough) notFound()

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold">{borough.name}</h1>

      {borough.province && (
        <p className="mt-1 text-lg text-muted-foreground">
          {borough.province}, {borough.region}
        </p>
      )}

      {/* Stats */}
      <div className="mt-6 flex flex-wrap gap-6 text-sm">
        {borough.population && (
          <div className="rounded-lg bg-muted px-4 py-2">
            <span className="font-medium">{t('population')}</span>: {borough.population.toLocaleString('it-IT')}
          </div>
        )}
        {borough.altitudeMeters && (
          <div className="rounded-lg bg-muted px-4 py-2">
            <span className="font-medium">{t('altitude')}</span>: {borough.altitudeMeters}m s.l.m.
          </div>
        )}
        {borough.areaKm2 && (
          <div className="rounded-lg bg-muted px-4 py-2">
            <span className="font-medium">{t('area')}</span>: {borough.areaKm2} km²
          </div>
        )}
      </div>

      {/* Descrizione */}
      {borough.description && (
        <div className="prose prose-lg mt-8 max-w-none">
          <p>{borough.description}</p>
        </div>
      )}

      {/* Virtual Tour */}
      {borough.virtualTourUrl && (
        <div className="mt-8">
          <a
            href={borough.virtualTourUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#00B4D8] px-6 py-3 text-white font-semibold hover:bg-[#0096b4] transition"
          >
            {t('virtual_tour')}
          </a>
        </div>
      )}

      {/* Video */}
      {borough.mainVideoUrl && (
        <div className="mt-8 aspect-video overflow-hidden rounded-xl">
          <iframe
            src={borough.mainVideoUrl}
            className="h-full w-full"
            allowFullScreen
            loading="lazy"
            title={`Video ${borough.name}`}
          />
        </div>
      )}

      {/* Mappa — MapLibre in Fase 1 */}
      {borough.lat && borough.lng && (
        <div className="mt-8 rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
          Coordinate: {borough.lat}, {borough.lng} — Mappa MapLibre in Fase 1
        </div>
      )}
    </main>
  )
}
