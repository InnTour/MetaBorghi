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
  index,
} from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { boroughs } from './boroughs'
import { companies } from './companies'

// ── ESPERIENZE ──────────────────────────────────────────────

export const experiences = mysqlTable('experiences', {
  id: varchar('id', { length: 100 }).primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull(),
  title: varchar('title', { length: 300 }),
  tagline: text('tagline'),
  descriptionShort: text('description_short'),
  descriptionLong: text('description_long'),
  category: mysqlEnum('category', [
    'GASTRONOMIA', 'CULTURA', 'NATURA', 'ARTIGIANATO', 'BENESSERE', 'AVVENTURA',
  ]).default('CULTURA'),
  providerId: varchar('provider_id', { length: 100 }),
  boroughId: varchar('borough_id', { length: 100 }),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  durationMinutes: int('duration_minutes'),
  maxParticipants: int('max_participants'),
  minParticipants: int('min_participants'),
  pricePerPerson: decimal('price_per_person', { precision: 10, scale: 2 }),
  cancellationPolicy: text('cancellation_policy'),
  difficultyLevel: mysqlEnum('difficulty_level', ['FACILE', 'MEDIO', 'DIFFICILE']).default('FACILE'),
  accessibilityInfo: text('accessibility_info'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  reviewsCount: int('reviews_count').default(0),
  isActive: tinyint('is_active').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex('slug').on(table.slug),
])

export const experienceLanguages = mysqlTable('experience_languages', {
  id: int('id').primaryKey().autoincrement(),
  experienceId: varchar('experience_id', { length: 100 }).notNull(),
  lang: varchar('lang', { length: 50 }).notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('experience_id').on(table.experienceId),
])

export const experienceIncludes = mysqlTable('experience_includes', {
  id: int('id').primaryKey().autoincrement(),
  experienceId: varchar('experience_id', { length: 100 }).notNull(),
  value: text('value').notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('experience_id').on(table.experienceId),
])

export const experienceExcludes = mysqlTable('experience_excludes', {
  id: int('id').primaryKey().autoincrement(),
  experienceId: varchar('experience_id', { length: 100 }).notNull(),
  value: text('value').notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('experience_id').on(table.experienceId),
])

export const experienceBring = mysqlTable('experience_bring', {
  id: int('id').primaryKey().autoincrement(),
  experienceId: varchar('experience_id', { length: 100 }).notNull(),
  value: text('value').notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('experience_id').on(table.experienceId),
])

export const experienceSeasonalTags = mysqlTable('experience_seasonal_tags', {
  id: int('id').primaryKey().autoincrement(),
  experienceId: varchar('experience_id', { length: 100 }).notNull(),
  value: varchar('value', { length: 100 }).notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('experience_id').on(table.experienceId),
])

export const experienceTimeline = mysqlTable('experience_timeline', {
  id: int('id').primaryKey().autoincrement(),
  experienceId: varchar('experience_id', { length: 100 }).notNull(),
  timeSlot: varchar('time_slot', { length: 10 }),
  title: varchar('title', { length: 200 }),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('experience_id').on(table.experienceId),
])

// ── RELATIONS ───────────────────────────────────────────────

export const experiencesRelations = relations(experiences, ({ one, many }) => ({
  provider: one(companies, { fields: [experiences.providerId], references: [companies.id] }),
  borough: one(boroughs, { fields: [experiences.boroughId], references: [boroughs.id] }),
  languages: many(experienceLanguages),
  includes: many(experienceIncludes),
  excludes: many(experienceExcludes),
  bring: many(experienceBring),
  seasonalTags: many(experienceSeasonalTags),
  timeline: many(experienceTimeline),
}))

export const experienceLanguagesRelations = relations(experienceLanguages, ({ one }) => ({
  experience: one(experiences, { fields: [experienceLanguages.experienceId], references: [experiences.id] }),
}))

export const experienceIncludesRelations = relations(experienceIncludes, ({ one }) => ({
  experience: one(experiences, { fields: [experienceIncludes.experienceId], references: [experiences.id] }),
}))

export const experienceExcludesRelations = relations(experienceExcludes, ({ one }) => ({
  experience: one(experiences, { fields: [experienceExcludes.experienceId], references: [experiences.id] }),
}))

export const experienceBringRelations = relations(experienceBring, ({ one }) => ({
  experience: one(experiences, { fields: [experienceBring.experienceId], references: [experiences.id] }),
}))

export const experienceSeasonalTagsRelations = relations(experienceSeasonalTags, ({ one }) => ({
  experience: one(experiences, { fields: [experienceSeasonalTags.experienceId], references: [experiences.id] }),
}))

export const experienceTimelineRelations = relations(experienceTimeline, ({ one }) => ({
  experience: one(experiences, { fields: [experienceTimeline.experienceId], references: [experiences.id] }),
}))
