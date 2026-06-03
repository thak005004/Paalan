import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  date,
  pgEnum,
  primaryKey
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

const uuid = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

// App access role (admin panel gate). Kept from the starter.
export const roleEnum = pgEnum('role', ['user', 'admin']);

// Who a person is within a household. Drives personalized copy and the three
// submitter sources (D6) + confirmer identity (D8).
export const memberRoleEnum = pgEnum('member_role', ['child', 'parent', 'helper']);

// Bill lifecycle state machine (D1): due -> submitted -> confirmed, or overdue.
export const billStatusEnum = pgEnum('bill_status', [
  'due',
  'submitted',
  'confirmed',
  'overdue'
]);

// Proof file type (D9).
export const attachmentKindEnum = pgEnum('attachment_kind', ['receipt', 'photo']);

// Recurrence template rule. Locked-in default: monthly | none.
export const recurrenceRuleEnum = pgEnum('recurrence_rule', ['none', 'monthly']);

// ---------------------------------------------------------------------------
// users — Auth.js identity (magic-link only). Adapter tables (accounts,
// sessions, verificationTokens) are added in the auth task.
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: uuid(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  role: roleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// Auth.js v5 Drizzle adapter tables. Property names (userId, providerAccountId,
// sessionToken, expires_at, ...) follow the official adapter schema exactly —
// @auth/drizzle-adapter reads columns by these names. Magic-link only uses
// users + sessions + verificationTokens; accounts is included for completeness
// and so the adapter wiring is whole. https://authjs.dev/getting-started/adapters/drizzle
// ---------------------------------------------------------------------------

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state')
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull()
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull()
  },
  (vt) => ({
    compositePk: primaryKey({ columns: [vt.identifier, vt.token] })
  })
);

// ---------------------------------------------------------------------------
// households — ownership & billing unit (D19). Country-agnostic primitives
// with India defaults (D18). parentName drives personalized copy (D10).
// ---------------------------------------------------------------------------

export const households = pgTable('households', {
  id: uuid(),
  displayName: text('display_name').notNull(),
  parentName: text('parent_name'),
  currency: text('currency').notNull().default('INR'),
  locale: text('locale').notNull().default('en-IN'),
  countryCode: text('country_code').notNull().default('+91'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// householdMembers — links people to a household with a role (D6). The paying
// child is an Auth.js user (userId set); a parent/helper may have no login
// (userId null) but still needs name + phone for the confirm-link flow (D12).
// ---------------------------------------------------------------------------

export const householdMembers = pgTable('household_members', {
  id: uuid(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  role: memberRoleEnum('role').notNull(),
  displayName: text('display_name'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// bills — the core record (D1). amount is in minor units (integer). Carries
// the recurrence template fields (locked-in default). selfReported flags a
// bill submitted in a solo-parent household with no second party to confirm.
// ---------------------------------------------------------------------------

export const bills = pgTable('bills', {
  id: uuid(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  dueDate: date('due_date'),
  status: billStatusEnum('status').notNull().default('due'),
  // Role of whoever submitted the proof (D6): child/parent/helper. Null until
  // the bill is submitted.
  submittedBy: memberRoleEnum('submitted_by'),
  // Solo-parent households: submitted but unconfirmable -> "self-reported".
  selfReported: boolean('self_reported').notNull().default(false),
  // Recurrence template (locked-in default).
  recurrenceRule: recurrenceRuleEnum('recurrence_rule').notNull().default('none'),
  recurrenceDayOfMonth: integer('recurrence_day_of_month'),
  nextDueDate: date('next_due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// attachments — proof files (D9). DB holds URL + metadata only; bytes live in
// object storage (Vercel Blob). Supports multiple files per bill.
// ---------------------------------------------------------------------------

export const attachments = pgTable('attachments', {
  id: uuid(),
  billId: text('bill_id')
    .notNull()
    .references(() => bills.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  kind: attachmentKindEnum('kind').notNull().default('receipt'),
  uploadedBy: memberRoleEnum('uploaded_by'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// confirmations — the auditable trust trail (D4, D8). A no-login second party
// vouches for a specific bill. Closed-trust-loop metric (D16) = bills reaching
// confirmed with >= 1 attachment, grouped by household/month.
// ---------------------------------------------------------------------------

export const confirmations = pgTable('confirmations', {
  id: uuid(),
  billId: text('bill_id')
    .notNull()
    .references(() => bills.id, { onDelete: 'cascade' }),
  // Identity of the confirmer (name/phone) — confirm screen is no-login.
  confirmedBy: text('confirmed_by'),
  role: memberRoleEnum('role').notNull(),
  at: timestamp('at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// paymentIntents — willingness-to-pay signal (D15). Logs "I'd pay" taps. No
// Stripe in v1. amount records the price shown at tap time (minor units).
// ---------------------------------------------------------------------------

export const paymentIntents = pgTable('payment_intents', {
  id: uuid(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  amount: integer('amount'),
  currency: text('currency').notNull().default('INR'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// disputes — "Something's wrong" notes. Surfaces in the child feed under
// "Needs your attention." Does NOT change bill status.
// ---------------------------------------------------------------------------

export const disputes = pgTable('disputes', {
  id: uuid(),
  billId: text('bill_id')
    .notNull()
    .references(() => bills.id, { onDelete: 'cascade' }),
  raisedBy: text('raised_by'),
  note: text('note').notNull(),
  at: timestamp('at').defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(householdMembers),
  paymentIntents: many(paymentIntents),
  accounts: many(accounts),
  sessions: many(sessions)
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));

export const householdsRelations = relations(households, ({ many }) => ({
  members: many(householdMembers),
  bills: many(bills),
  paymentIntents: many(paymentIntents)
}));

export const householdMembersRelations = relations(householdMembers, ({ one }) => ({
  household: one(households, {
    fields: [householdMembers.householdId],
    references: [households.id]
  }),
  user: one(users, {
    fields: [householdMembers.userId],
    references: [users.id]
  })
}));

export const billsRelations = relations(bills, ({ one, many }) => ({
  household: one(households, {
    fields: [bills.householdId],
    references: [households.id]
  }),
  attachments: many(attachments),
  confirmations: many(confirmations),
  disputes: many(disputes)
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  bill: one(bills, {
    fields: [attachments.billId],
    references: [bills.id]
  })
}));

export const confirmationsRelations = relations(confirmations, ({ one }) => ({
  bill: one(bills, {
    fields: [confirmations.billId],
    references: [bills.id]
  })
}));

export const paymentIntentsRelations = relations(paymentIntents, ({ one }) => ({
  household: one(households, {
    fields: [paymentIntents.householdId],
    references: [households.id]
  }),
  user: one(users, {
    fields: [paymentIntents.userId],
    references: [users.id]
  })
}));

export const disputesRelations = relations(disputes, ({ one }) => ({
  bill: one(bills, {
    fields: [disputes.billId],
    references: [bills.id]
  })
}));

// ---------------------------------------------------------------------------
// Select types
// ---------------------------------------------------------------------------

export type SelectUser = typeof users.$inferSelect;
export type SelectAccount = typeof accounts.$inferSelect;
export type SelectSession = typeof sessions.$inferSelect;
export type SelectVerificationToken = typeof verificationTokens.$inferSelect;
export type SelectHousehold = typeof households.$inferSelect;
export type SelectHouseholdMember = typeof householdMembers.$inferSelect;
export type SelectBill = typeof bills.$inferSelect;
export type SelectAttachment = typeof attachments.$inferSelect;
export type SelectConfirmation = typeof confirmations.$inferSelect;
export type SelectPaymentIntent = typeof paymentIntents.$inferSelect;
export type SelectDispute = typeof disputes.$inferSelect;

// ---------------------------------------------------------------------------
// Zod insert schemas
// ---------------------------------------------------------------------------

export const insertUserSchema = createInsertSchema(users);
export const insertHouseholdSchema = createInsertSchema(households);
export const insertHouseholdMemberSchema = createInsertSchema(householdMembers);

export const insertBillSchema = createInsertSchema(bills).extend({
  amount: z.number().int().nonnegative(),
  recurrenceDayOfMonth: z.number().int().min(1).max(31).nullable().optional()
});

export const insertAttachmentSchema = createInsertSchema(attachments).extend({
  url: z.string().url()
});

export const insertConfirmationSchema = createInsertSchema(confirmations);

export const insertPaymentIntentSchema = createInsertSchema(paymentIntents).extend({
  amount: z.number().int().nonnegative().nullable().optional()
});

export const insertDisputeSchema = createInsertSchema(disputes).extend({
  note: z.string().min(1)
});
