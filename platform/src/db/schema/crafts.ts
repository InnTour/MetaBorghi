import {
  mysqlTable,
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

// ── PRODOTTI ARTIGIANALI ────────────────────────────────────

export const craftProducts = mysqlTable('craft_products', {
  id: varchar('id', { length: 100 }).primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 300 }),
  descriptionShort: text('description_short'),
  descriptionLong: text('description_long'),
  price: decimal('price', { precision: 10, scale: 2 }),
  isCustomOrderAvailable: tinyint('is_custom_order_available').default(0),
  leadTimeDays: int('lead_time_days'),
  techniqueDescription: text('technique_description'),
  dimensions: varchar('dimensions', { length: 100 }),
  weightGrams: int('weight_grams'),
  artisanId: varchar('artisan_id', { length: 100 }),
  boroughId: varchar('borough_id', { length: 100 }),
  isUniquePiece: tinyint('is_unique_piece').default(0),
  productionSeriesQty: int('production_series_qty'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  reviewsCount: int('reviews_count').default(0),
  stockQty: int('stock_qty').default(0),
  isActive: tinyint('is_active').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex('slug').on(table.slug),
])

export const craftMaterialTypes = mysqlTable('craft_material_types', {
  id: int('id').primaryKey().autoincrement(),
  craftId: varchar('craft_id', { length: 100 }).notNull(),
  value: varchar('value', { length: 100 }).notNull(),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('craft_id').on(table.craftId),
])

export const craftCustomizationOptions = mysqlTable('craft_customization_options', {
  id: int('id').primaryKey().autoincrement(),
  craftId: varchar('craft_id', { length: 100 }).notNull(),
  name: varchar('name', { length: 200 }),
  valuesJson: text('values_json'),
  priceModifier: decimal('price_modifier', { precision: 10, scale: 2 }).default('0'),
}, (table) => [
  index('craft_id').on(table.craftId),
])

export const craftProcessSteps = mysqlTable('craft_process_steps', {
  id: int('id').primaryKey().autoincrement(),
  craftId: varchar('craft_id', { length: 100 }).notNull(),
  title: varchar('title', { length: 200 }),
  description: text('description'),
  sortOrder: int('sort_order').default(0),
}, (table) => [
  index('craft_id').on(table.craftId),
])

// ── RELATIONS ───────────────────────────────────────────────

export const craftProductsRelations = relations(craftProducts, ({ one, many }) => ({
  artisan: one(companies, { fields: [craftProducts.artisanId], references: [companies.id] }),
  borough: one(boroughs, { fields: [craftProducts.boroughId], references: [boroughs.id] }),
  materialTypes: many(craftMaterialTypes),
  customizationOptions: many(craftCustomizationOptions),
  processSteps: many(craftProcessSteps),
}))

export const craftMaterialTypesRelations = relations(craftMaterialTypes, ({ one }) => ({
  craft: one(craftProducts, { fields: [craftMaterialTypes.craftId], references: [craftProducts.id] }),
}))

export const craftCustomizationOptionsRelations = relations(craftCustomizationOptions, ({ one }) => ({
  craft: one(craftProducts, { fields: [craftCustomizationOptions.craftId], references: [craftProducts.id] }),
}))

export const craftProcessStepsRelations = relations(craftProcessSteps, ({ one }) => ({
  craft: one(craftProducts, { fields: [craftProcessSteps.craftId], references: [craftProducts.id] }),
}))
