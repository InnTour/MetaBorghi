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
import { companies } from './companies'

// ── OSPITALITÀ ──────────────────────────────────────────────

export const accommodations = mysqlTable('accommodations', {
  id: varchar('id', { length: 100 }).primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 300 }),
  type: mysqlEnum('type', [
    'HOTEL', 'AGRITURISMO', 'MASSERIA', 'BED_AND_BREAKFAST', 'HOSTEL', 'APPARTAMENTO',
  ]).default('AGRITURISMO'),
  providerId: varchar('provider_id', { length: 100 }),
  boroughId: varchar('borough_id', { length: 100 }),
  addressFull: text('address_full'),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  distanceCenterKm: decimal('distance_center_km', { precision: 5, scale: 2 }),
  descriptionShort: text('description_short'),
  descriptionLong: text('description_long'),
  tagline: text('tagline'),
  roomsCount: int('rooms_count'),
  maxGuests: int('max_guests'),
  pricePerNightFrom: decimal('price_per_night_from', { precision: 10, scale: 2 }),
  starsOrCategory: varchar('stars_or_category', { length: 100 }),
  checkInTime: varchar('check_in_time', { length: 10 }),
  checkOutTime: varchar('check_out_time', { length: 10 }),
  minStayNights: int('min_stay_nights').default(1),
  amenities: text('amenities'),
  accessibility: text('accessibility'),
  languagesSpoken: text('languages_spoken'),
  cancellationPolicy: text('cancellation_policy'),
  bookingEmail: varchar('booking_email', { length: 200 }),
  bookingPhone: varchar('booking_phone', { length: 50 }),
  bookingUrl: text('booking_url'),
  mainVideoUrl: text('main_video_url'),
  virtualTourUrl: text('virtual_tour_url'),
  isActive: tinyint('is_active').default(1),
  isFeatured: tinyint('is_featured').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex('slug').on(table.slug),
])

// ── RELATIONS ───────────────────────────────────────────────

export const accommodationsRelations = relations(accommodations, ({ one }) => ({
  provider: one(companies, { fields: [accommodations.providerId], references: [companies.id] }),
  borough: one(boroughs, { fields: [accommodations.boroughId], references: [boroughs.id] }),
}))
