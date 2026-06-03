import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial,
  varchar,
  bigint
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const roleEnum = pgEnum('role', ['user', 'admin']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type SelectUser = typeof users.$inferSelect;

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
});

export type SelectProduct = typeof products.$inferSelect;
export const insertProductSchema = createInsertSchema(products);

// ---------- Paalan ----------

export const billStatusEnum = pgEnum('bill_status', [
  'due',
  'submitted',
  'confirmed',
  'overdue'
]);

export const memberRoleEnum = pgEnum('member_role', [
  'child',
  'parent',
  'helper'
]);

export const households = pgTable('households', {
  id: serial('id').primaryKey(),
  displayName: text('display_name').notNull(),
  parentName: text('parent_name').notNull(),
  parentRelationship: text('parent_relationship').default('Amma').notNull(),
  currency: varchar('currency', { length: 3 }).default('INR').notNull(),
  locale: varchar('locale', { length: 10 }).default('en-IN').notNull(),
  countryCode: varchar('country_code', { length: 6 }).default('+91').notNull(),
  ownerUserId: integer('owner_user_id').references(() => users.id, {
    onDelete: 'set null'
  }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type SelectHousehold = typeof households.$inferSelect;

export const householdMembers = pgTable('household_members', {
  id: serial('id').primaryKey(),
  householdId: integer('household_id')
    .references(() => households.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id').references(() => users.id, {
    onDelete: 'set null'
  }),
  name: text('name').notNull(),
  role: memberRoleEnum('role').notNull(),
  phone: varchar('phone', { length: 32 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type SelectHouseholdMember = typeof householdMembers.$inferSelect;

export const bills = pgTable('bills', {
  id: serial('id').primaryKey(),
  householdId: integer('household_id')
    .references(() => households.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  category: text('category').default('utility').notNull(),
  amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
  currency: varchar('currency', { length: 3 }).default('INR').notNull(),
  dueDate: timestamp('due_date').notNull(),
  status: billStatusEnum('status').default('due').notNull(),
  submittedByMemberId: integer('submitted_by_member_id').references(
    () => householdMembers.id,
    { onDelete: 'set null' }
  ),
  submittedAt: timestamp('submitted_at'),
  confirmedAt: timestamp('confirmed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type SelectBill = typeof bills.$inferSelect;

export const attachments = pgTable('attachments', {
  id: serial('id').primaryKey(),
  billId: integer('bill_id')
    .references(() => bills.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  kind: text('kind').default('image').notNull(),
  uploadedByMemberId: integer('uploaded_by_member_id').references(
    () => householdMembers.id,
    { onDelete: 'set null' }
  ),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type SelectAttachment = typeof attachments.$inferSelect;

export const confirmations = pgTable('confirmations', {
  id: serial('id').primaryKey(),
  billId: integer('bill_id')
    .references(() => bills.id, { onDelete: 'cascade' })
    .notNull(),
  confirmedByMemberId: integer('confirmed_by_member_id').references(
    () => householdMembers.id,
    { onDelete: 'set null' }
  ),
  role: memberRoleEnum('role').notNull(),
  at: timestamp('at').defaultNow().notNull()
});

export type SelectConfirmation = typeof confirmations.$inferSelect;

export const paymentIntents = pgTable('payment_intents', {
  id: serial('id').primaryKey(),
  householdId: integer('household_id').references(() => households.id, {
    onDelete: 'cascade'
  }),
  userId: integer('user_id').references(() => users.id, {
    onDelete: 'set null'
  }),
  source: text('source').default('plan_bar').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type SelectPaymentIntent = typeof paymentIntents.$inferSelect;
