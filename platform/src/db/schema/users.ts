import {
  mysqlTable,
  mysqlEnum,
  varchar,
  int,
  text,
  tinyint,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { boroughs } from './boroughs'
import { companies } from './companies'

// ── UTENTI ──────────────────────────────────────────────────

export const users = mysqlTable('users', {
  id: varchar('id', { length: 100 }).primaryKey(),
  email: varchar('email', { length: 200 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  role: mysqlEnum('role', ['guest', 'registered', 'operator', 'admin']).default('registered').notNull(),
  phone: varchar('phone', { length: 50 }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  preferredLocale: varchar('preferred_locale', { length: 10 }).default('it'),
  isActive: tinyint('is_active').default(1).notNull(),
  emailVerified: tinyint('email_verified').default(0).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex('email').on(table.email),
  index('role').on(table.role),
])

// ── ASSOCIAZIONI OPERATORE → BORGO ─────────────────────────
// Un operatore può gestire uno o più borghi

export const userBoroughAssignments = mysqlTable('user_borough_assignments', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  boroughId: varchar('borough_id', { length: 100 }).notNull(),
  canEditContent: tinyint('can_edit_content').default(1).notNull(),
  canManageExperiences: tinyint('can_manage_experiences').default(1).notNull(),
  canManageCompanies: tinyint('can_manage_companies').default(0).notNull(),
  canViewAnalytics: tinyint('can_view_analytics').default(1).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
}, (table) => [
  index('user_id').on(table.userId),
  index('borough_id').on(table.boroughId),
])

// ── ASSOCIAZIONI OPERATORE → AZIENDA ───────────────────────
// Un operatore aziendale gestisce la propria azienda

export const userCompanyAssignments = mysqlTable('user_company_assignments', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  companyId: varchar('company_id', { length: 100 }).notNull(),
  canEditProfile: tinyint('can_edit_profile').default(1).notNull(),
  canManageProducts: tinyint('can_manage_products').default(1).notNull(),
  canManageOrders: tinyint('can_manage_orders').default(1).notNull(),
  canViewAnalytics: tinyint('can_view_analytics').default(1).notNull(),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
}, (table) => [
  index('user_id').on(table.userId),
  index('company_id').on(table.companyId),
])

// ── WISHLIST UTENTE REGISTRATO ──────────────────────────────

export const userWishlist = mysqlTable('user_wishlist', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  itemType: mysqlEnum('item_type', ['borough', 'experience', 'craft', 'food_product', 'accommodation', 'restaurant']).notNull(),
  itemId: varchar('item_id', { length: 100 }).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
}, (table) => [
  index('user_id').on(table.userId),
  index('item_type_id').on(table.itemType, table.itemId),
])

// ── PRENOTAZIONI ────────────────────────────────────────────

export const bookings = mysqlTable('bookings', {
  id: varchar('id', { length: 100 }).primaryKey(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  experienceId: varchar('experience_id', { length: 100 }),
  accommodationId: varchar('accommodation_id', { length: 100 }),
  status: mysqlEnum('status', ['pending', 'confirmed', 'cancelled', 'completed']).default('pending').notNull(),
  bookingDate: timestamp('booking_date').notNull(),
  guestsCount: int('guests_count').default(1).notNull(),
  totalPrice: int('total_price_cents'), // centesimi per evitare floating point
  notes: text('notes'),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index('user_id').on(table.userId),
  index('experience_id').on(table.experienceId),
  index('status').on(table.status),
])

// ── RELATIONS ───────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  boroughAssignments: many(userBoroughAssignments),
  companyAssignments: many(userCompanyAssignments),
  wishlist: many(userWishlist),
  bookings: many(bookings),
}))

export const userBoroughAssignmentsRelations = relations(userBoroughAssignments, ({ one }) => ({
  user: one(users, { fields: [userBoroughAssignments.userId], references: [users.id] }),
  borough: one(boroughs, { fields: [userBoroughAssignments.boroughId], references: [boroughs.id] }),
}))

export const userCompanyAssignmentsRelations = relations(userCompanyAssignments, ({ one }) => ({
  user: one(users, { fields: [userCompanyAssignments.userId], references: [users.id] }),
  company: one(companies, { fields: [userCompanyAssignments.companyId], references: [companies.id] }),
}))

export const userWishlistRelations = relations(userWishlist, ({ one }) => ({
  user: one(users, { fields: [userWishlist.userId], references: [users.id] }),
}))

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
}))
