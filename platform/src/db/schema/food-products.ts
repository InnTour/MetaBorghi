import {
  mysqlTable,
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

// ── PRODOTTI FOOD ───────────────────────────────────────────

export const foodProducts = mysqlTable('food_products', {
  id: varchar('id', { length: 100 }).primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 300 }),
  producerId: varchar('producer_id', { length: 100 }),
  boroughId: varchar('borough_id', { length: 100 }),
  category: varchar('category', { length: 100 }),
  descriptionShort: text('description_short'),
  descriptionLong: text('description_long'),
  tagline: text('tagline'),
  pairingSuggestions: text('pairing_suggestions'),
  price: decimal('price', { precision: 10, scale: 2 }),
  unit: varchar('unit', { length: 100 }),
  weightGrams: int('weight_grams'),
  shelfLifeDays: int('shelf_life_days'),
  storageInstructions: text('storage_instructions'),
  originProtected: varchar('origin_protected', { length: 200 }),
  allergens: text('allergens'),
  ingredients: text('ingredients'),
  stockQty: int('stock_qty').default(0),
  minOrderQty: int('min_order_qty').default(1),
  isShippable: tinyint('is_shippable').default(0),
  shippingNotes: text('shipping_notes'),
  isActive: tinyint('is_active').default(1),
  isFeatured: tinyint('is_featured').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex('slug').on(table.slug),
])

// ── RELATIONS ───────────────────────────────────────────────

export const foodProductsRelations = relations(foodProducts, ({ one }) => ({
  producer: one(companies, { fields: [foodProducts.producerId], references: [companies.id] }),
  borough: one(boroughs, { fields: [foodProducts.boroughId], references: [boroughs.id] }),
}))
