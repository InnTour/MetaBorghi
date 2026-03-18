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

// ── AZIENDE ─────────────────────────────────────────────────

export const companies = mysqlTable('companies', {
  id: varchar('id', { length: 100 }).primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 200 }),
  legalName: varchar('legal_name', { length: 200 }),
  vatNumber: varchar('vat_number', { length: 20 }),
  type: mysqlEnum('type', ['PRODUTTORE_FOOD', 'MISTO', 'AGRITURISMO']).default('MISTO'),
  tagline: text('tagline'),
  descriptionShort: text('description_short'),
  descriptionLong: text('description_long'),
  foundingYear: int('founding_year'),
  employeesCount: int('employees_count'),
  boroughId: varchar('borough_id', { length: 100 }),
  addressFull: text('address_full'),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  contactEmail: varchar('contact_email', { length: 200 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  websiteUrl: text('website_url'),
  socialInstagram: text('social_instagram'),
  socialFacebook: text('social_facebook'),
  socialLinkedin: text('social_linkedin'),
  tier: mysqlEnum('tier', ['BASE', 'PREMIUM', 'PLATINUM']).default('BASE'),
  isVerified: tinyint('is_verified').default(0),
  isActive: tinyint('is_active').default(1),
  b2bOpenForContact: tinyint('b2b_open_for_contact').default(0),
  founderName: varchar('founder_name', { length: 200 }),
  founderQuote: text('founder_quote'),
  mainVideoUrl: text('main_video_url'),
  virtualTourUrl: text('virtual_tour_url'),
  heroImageIndex: int('hero_image_index').default(0),
  heroImageAlt: varchar('hero_image_alt', { length: 300 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex('slug').on(table.slug),
])

export const companyCertifications = mysqlTable('company_certifications', {
  id: int('id').primaryKey().autoincrement(),
  companyId: varchar('company_id', { length: 100 }).notNull(),
  value: varchar('value', { length: 100 }).notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('company_id').on(table.companyId),
])

export const companyB2bInterests = mysqlTable('company_b2b_interests', {
  id: int('id').primaryKey().autoincrement(),
  companyId: varchar('company_id', { length: 100 }).notNull(),
  value: varchar('value', { length: 100 }).notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('company_id').on(table.companyId),
])

export const companyAwards = mysqlTable('company_awards', {
  id: int('id').primaryKey().autoincrement(),
  companyId: varchar('company_id', { length: 100 }).notNull(),
  year: int('year'),
  title: text('title'),
  entity: text('entity'),
}, (table) => [
  index('company_id').on(table.companyId),
])

// ── RELATIONS ───────────────────────────────────────────────

export const companiesRelations = relations(companies, ({ one, many }) => ({
  borough: one(boroughs, { fields: [companies.boroughId], references: [boroughs.id] }),
  certifications: many(companyCertifications),
  b2bInterests: many(companyB2bInterests),
  awards: many(companyAwards),
}))

export const companyCertificationsRelations = relations(companyCertifications, ({ one }) => ({
  company: one(companies, { fields: [companyCertifications.companyId], references: [companies.id] }),
}))

export const companyB2bInterestsRelations = relations(companyB2bInterests, ({ one }) => ({
  company: one(companies, { fields: [companyB2bInterests.companyId], references: [companies.id] }),
}))

export const companyAwardsRelations = relations(companyAwards, ({ one }) => ({
  company: one(companies, { fields: [companyAwards.companyId], references: [companies.id] }),
}))
