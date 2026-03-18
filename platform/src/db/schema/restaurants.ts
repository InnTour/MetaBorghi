import {
  mysqlTable,
  mysqlEnum,
  varchar,
  int,
  decimal,
  text,
  tinyint,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { boroughs } from './boroughs'

// ── RISTORAZIONE ────────────────────────────────────────────

export const restaurants = mysqlTable('restaurants', {
  id: varchar('id', { length: 100 }).primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 300 }),
  type: mysqlEnum('type', [
    'RISTORANTE', 'TRATTORIA', 'PIZZERIA', 'AGRITURISMO', 'ENOTECA', 'BAR', 'OSTERIA',
  ]).default('RISTORANTE'),
  boroughId: varchar('borough_id', { length: 100 }),
  addressFull: text('address_full'),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  descriptionShort: text('description_short'),
  descriptionLong: text('description_long'),
  tagline: text('tagline'),
  cuisineType: varchar('cuisine_type', { length: 200 }),
  priceRange: mysqlEnum('price_range', ['BUDGET', 'MEDIO', 'ALTO', 'GOURMET']).default('MEDIO'),
  seatsIndoor: int('seats_indoor'),
  seatsOutdoor: int('seats_outdoor'),
  openingHours: varchar('opening_hours', { length: 200 }),
  closingDay: varchar('closing_day', { length: 100 }),
  specialties: text('specialties'),
  menuHighlights: text('menu_highlights'),
  contactEmail: varchar('contact_email', { length: 200 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  websiteUrl: text('website_url'),
  socialInstagram: text('social_instagram'),
  socialFacebook: text('social_facebook'),
  bookingUrl: text('booking_url'),
  acceptsGroups: tinyint('accepts_groups').default(0),
  maxGroupSize: int('max_group_size'),
  b2bOpenForContact: tinyint('b2b_open_for_contact').default(0),
  b2bInterests: text('b2b_interests'),
  isActive: tinyint('is_active').default(1),
  isFeatured: tinyint('is_featured').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex('slug').on(table.slug),
])

// ── RELATIONS ───────────────────────────────────────────────

export const restaurantsRelations = relations(restaurants, ({ one }) => ({
  borough: one(boroughs, { fields: [restaurants.boroughId], references: [boroughs.id] }),
}))
