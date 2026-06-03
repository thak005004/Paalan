import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { and, count, countDistinct, eq } from 'drizzle-orm';
import {
  households,
  householdMembers,
  users,
  bills,
  attachments,
  confirmations
} from '../lib/schema';

// Demo household per SPEC D13: "Amma · Pune", so the home screen's try-it
// banner has live, proof-backed data. Idempotent — skips if it already exists.

const HOUSEHOLD_NAME = 'Pune household';

// ₹ amounts are stored in minor units (paise): ₹1,240 -> 124000.
const rupees = (n: number) => Math.round(n * 100);

const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000);
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const ymd = (d: Date) => d.toISOString().slice(0, 10);

// First day of next month, for a monthly recurrence template's next instance.
function firstOfNextMonth(): string {
  const now = new Date();
  return ymd(new Date(now.getFullYear(), now.getMonth() + 1, 1));
}

// A stable placeholder proof image (real uploads use Vercel Blob signed URLs).
const proof = (seed: string) => `https://picsum.photos/seed/${seed}/600/800`;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  // --- Idempotency: skip if the demo household already exists ---------------
  const [{ value: existing }] = await db
    .select({ value: count() })
    .from(households)
    .where(eq(households.displayName, HOUSEHOLD_NAME));

  if (existing > 0) {
    console.log(
      `Skipping seed: a household named "${HOUSEHOLD_NAME}" already exists.`
    );
    await client.end();
    return;
  }

  console.log('Seeding the "Amma · Pune" demo household...');

  // --- Household (D18: country-agnostic primitives, India defaults) ---------
  const [household] = await db
    .insert(households)
    .values({
      displayName: HOUSEHOLD_NAME,
      parentName: 'Amma',
      currency: 'INR',
      locale: 'en-IN',
      countryCode: '+91'
    })
    .returning();

  // --- The paying child (Auth.js user, magic-link — no password) ------------
  const [ravi] = await db
    .insert(users)
    .values({
      name: 'Ravi',
      email: 'ravi@example.com',
      role: 'user'
    })
    .returning();

  // --- Members (D6): child has a login; parent & helper do not, but carry a
  // phone so the SMS confirm link (D12) can reach them. -----------------------
  await db.insert(householdMembers).values([
    {
      householdId: household.id,
      userId: ravi.id,
      role: 'child',
      displayName: 'Ravi',
      phone: '+919811111111'
    },
    {
      householdId: household.id,
      role: 'parent',
      displayName: 'Amma',
      phone: '+919822222222'
    },
    {
      householdId: household.id,
      role: 'helper',
      displayName: 'Lakshmi',
      phone: '+919833333333'
    }
  ]);

  // --- Bills ----------------------------------------------------------------
  // Three confirmed, proof-backed bills (closed trust loops, D16) + one pending.

  // 1. Electricity ₹1,240 — Ravi paid remotely; Amma confirmed 2h ago.
  const [electricity] = await db
    .insert(bills)
    .values({
      householdId: household.id,
      title: 'Electricity',
      amount: rupees(1240),
      currency: 'INR',
      dueDate: ymd(daysAgo(5)),
      status: 'confirmed',
      submittedBy: 'child',
      createdAt: daysAgo(3)
    })
    .returning();

  // 2. Water ₹360 — Amma self-captured; helper Lakshmi confirmed yesterday.
  const [water] = await db
    .insert(bills)
    .values({
      householdId: household.id,
      title: 'Water',
      amount: rupees(360),
      currency: 'INR',
      dueDate: ymd(daysAgo(8)),
      status: 'confirmed',
      submittedBy: 'parent',
      createdAt: daysAgo(2)
    })
    .returning();

  // 3. House help salary ₹2,500 — recurring monthly; submitted by Lakshmi,
  //    confirmed by Amma. Demonstrates the recurrence template fields.
  const [salary] = await db
    .insert(bills)
    .values({
      householdId: household.id,
      title: 'House help salary',
      amount: rupees(2500),
      currency: 'INR',
      dueDate: ymd(daysAgo(4)),
      status: 'confirmed',
      submittedBy: 'helper',
      recurrenceRule: 'monthly',
      recurrenceDayOfMonth: 1,
      nextDueDate: firstOfNextMonth(),
      createdAt: daysAgo(4)
    })
    .returning();

  // 4. Broadband ₹799 — submitted by Lakshmi, awaiting confirm (no row yet).
  const [broadband] = await db
    .insert(bills)
    .values({
      householdId: household.id,
      title: 'Broadband',
      amount: rupees(799),
      currency: 'INR',
      dueDate: ymd(daysAgo(0)),
      status: 'submitted',
      submittedBy: 'helper',
      createdAt: hoursAgo(5)
    })
    .returning();

  // --- Attachments (proof, D9): every bill carries a receipt ---------------
  await db.insert(attachments).values([
    {
      billId: electricity.id,
      url: proof('electricity'),
      kind: 'receipt',
      uploadedBy: 'child'
    },
    {
      billId: water.id,
      url: proof('water'),
      kind: 'receipt',
      uploadedBy: 'parent'
    },
    {
      billId: salary.id,
      url: proof('salary'),
      kind: 'receipt',
      uploadedBy: 'helper'
    },
    {
      billId: broadband.id,
      url: proof('broadband'),
      kind: 'receipt',
      uploadedBy: 'helper'
    }
  ]);

  // --- Confirmations (the trust trail, D4/D8) for the three confirmed bills -
  await db.insert(confirmations).values([
    {
      billId: electricity.id,
      confirmedBy: 'Amma',
      role: 'parent',
      at: hoursAgo(2)
    },
    {
      billId: water.id,
      confirmedBy: 'Lakshmi',
      role: 'helper',
      at: daysAgo(1)
    },
    {
      billId: salary.id,
      confirmedBy: 'Amma',
      role: 'parent',
      at: daysAgo(4)
    }
  ]);

  // --- Report the north-star metric (D16): confirmed bills with >=1 proof ---
  const [{ value: closedLoops }] = await db
    .select({ value: countDistinct(bills.id) })
    .from(bills)
    .innerJoin(attachments, eq(attachments.billId, bills.id))
    .where(and(eq(bills.householdId, household.id), eq(bills.status, 'confirmed')));

  console.log('Seeded demo household "Amma · Pune":');
  console.log('  - 1 child (ravi@example.com), 1 parent (Amma), 1 helper (Lakshmi)');
  console.log('  - 4 bills (3 confirmed + proof, 1 awaiting confirm)');
  console.log(`  - Closed trust loops (D16): ${closedLoops}`);

  await client.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
