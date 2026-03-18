import {
  mysqlTable,
  varchar,
  int,
  decimal,
  text,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

// ── BORGHI ──────────────────────────────────────────────────

export const boroughs = mysqlTable('boroughs', {
  id: varchar('id', { length: 100 }).primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  province: varchar('province', { length: 100 }),
  region: varchar('region', { length: 100 }),
  population: int('population'),
  altitudeMeters: int('altitude_meters'),
  areaKm2: decimal('area_km2', { precision: 8, scale: 2 }),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  mainVideoUrl: text('main_video_url'),
  virtualTourUrl: text('virtual_tour_url'),
  description: text('description'),
  companiesCount: int('companies_count').default(0),
  heroImageIndex: int('hero_image_index').default(0),
  heroImageAlt: varchar('hero_image_alt', { length: 300 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex('slug').on(table.slug),
])

export const boroughHighlights = mysqlTable('borough_highlights', {
  id: int('id').primaryKey().autoincrement(),
  boroughId: varchar('borough_id', { length: 100 }).notNull(),
  value: text('value').notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('borough_id').on(table.boroughId),
])

export const boroughNotableProducts = mysqlTable('borough_notable_products', {
  id: int('id').primaryKey().autoincrement(),
  boroughId: varchar('borough_id', { length: 100 }).notNull(),
  value: text('value').notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('borough_id').on(table.boroughId),
])

export const boroughNotableExperiences = mysqlTable('borough_notable_experiences', {
  id: int('id').primaryKey().autoincrement(),
  boroughId: varchar('borough_id', { length: 100 }).notNull(),
  value: text('value').notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('borough_id').on(table.boroughId),
])

export const boroughNotableRestaurants = mysqlTable('borough_notable_restaurants', {
  id: int('id').primaryKey().autoincrement(),
  boroughId: varchar('borough_id', { length: 100 }).notNull(),
  value: text('value').notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('borough_id').on(table.boroughId),
])

export const boroughGalleryImages = mysqlTable('borough_gallery_images', {
  id: int('id').primaryKey().autoincrement(),
  boroughId: varchar('borough_id', { length: 100 }).notNull(),
  srcIndex: int('src_index').default(0),
  altText: varchar('alt_text', { length: 300 }),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('borough_id').on(table.boroughId),
])

// ── RELATIONS ───────────────────────────────────────────────

export const boroughsRelations = relations(boroughs, ({ many }) => ({
  highlights: many(boroughHighlights),
  notableProducts: many(boroughNotableProducts),
  notableExperiences: many(boroughNotableExperiences),
  notableRestaurants: many(boroughNotableRestaurants),
  galleryImages: many(boroughGalleryImages),
}))

export const boroughHighlightsRelations = relations(boroughHighlights, ({ one }) => ({
  borough: one(boroughs, { fields: [boroughHighlights.boroughId], references: [boroughs.id] }),
}))

export const boroughNotableProductsRelations = relations(boroughNotableProducts, ({ one }) => ({
  borough: one(boroughs, { fields: [boroughNotableProducts.boroughId], references: [boroughs.id] }),
}))

export const boroughNotableExperiencesRelations = relations(boroughNotableExperiences, ({ one }) => ({
  borough: one(boroughs, { fields: [boroughNotableExperiences.boroughId], references: [boroughs.id] }),
}))

export const boroughNotableRestaurantsRelations = relations(boroughNotableRestaurants, ({ one }) => ({
  borough: one(boroughs, { fields: [boroughNotableRestaurants.boroughId], references: [boroughs.id] }),
}))

export const boroughGalleryImagesRelations = relations(boroughGalleryImages, ({ one }) => ({
  borough: one(boroughs, { fields: [boroughGalleryImages.boroughId], references: [boroughs.id] }),
}))
