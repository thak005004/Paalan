import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  attachments,
  bills,
  confirmations,
  householdMembers,
  households,
  users
} from '../lib/schema';
import { count, eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  // Admin user (admin@admin.com / password)
  const passwordHash = await hash('password', 12);
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@admin.com'))
    .limit(1);

  let adminId: number;
  if (existingAdmin) {
    await db
      .update(users)
      .set({ passwordHash, role: 'admin' })
      .where(eq(users.email, 'admin@admin.com'));
    adminId = existingAdmin.id;
    console.log('Updated admin user password.');
  } else {
    const [created] = await db
      .insert(users)
      .values({
        name: 'Admin',
        email: 'admin@admin.com',
        passwordHash,
        role: 'admin'
      })
      .returning();
    adminId = created.id;
    console.log('Seeded admin user (admin@admin.com / password).');
  }

  // Demo "Ravi" NRI user (ravi@paalan.demo / password)
  const [existingRavi] = await db
    .select()
    .from(users)
    .where(eq(users.email, 'ravi@paalan.demo'))
    .limit(1);

  let raviId: number;
  if (existingRavi) {
    raviId = existingRavi.id;
  } else {
    const [created] = await db
      .insert(users)
      .values({
        name: 'Ravi',
        email: 'ravi@paalan.demo',
        passwordHash,
        role: 'user'
      })
      .returning();
    raviId = created.id;
    console.log('Seeded demo NRI user (ravi@paalan.demo / password).');
  }

  // Skip if a household already exists (idempotent)
  const [{ value: hhCount }] = await db
    .select({ value: count() })
    .from(households);

  if (hhCount > 0) {
    console.log(
      `Skipping household seed: households table already has ${hhCount} rows.`
    );
    await client.end();
    return;
  }

  console.log('Seeding demo household...');

  const [household] = await db
    .insert(households)
    .values({
      displayName: 'Pune household',
      parentName: 'Amma',
      parentRelationship: 'Amma',
      currency: 'INR',
      locale: 'en-IN',
      countryCode: '+91',
      ownerUserId: raviId
    })
    .returning();

  const [ravi, amma, lakshmi] = await db
    .insert(householdMembers)
    .values([
      {
        householdId: household.id,
        userId: raviId,
        name: 'Ravi',
        role: 'child',
        phone: '+1 416 555 0188'
      },
      {
        householdId: household.id,
        name: 'Amma',
        role: 'parent',
        phone: '+91 98765 14021'
      },
      {
        householdId: household.id,
        name: 'Lakshmi',
        role: 'helper',
        phone: '+91 98112 33907'
      }
    ])
    .returning();

  const now = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };
  const daysAhead = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return d;
  };

  // 3 confirmed proof-backed bills + 1 pending (submitted, awaiting confirm)
  const seedBills = [
    {
      title: 'Electricity',
      category: 'utility',
      amountMinor: 124000,
      dueDate: daysAgo(1),
      status: 'confirmed' as const,
      submittedByMemberId: lakshmi.id,
      submittedAt: daysAgo(0),
      confirmedAt: daysAgo(0),
      confirmer: amma,
      attachmentUrl: '/proof/electricity.jpg'
    },
    {
      title: 'Water',
      category: 'utility',
      amountMinor: 36000,
      dueDate: daysAgo(3),
      status: 'confirmed' as const,
      submittedByMemberId: lakshmi.id,
      submittedAt: daysAgo(2),
      confirmedAt: daysAgo(1),
      confirmer: lakshmi,
      attachmentUrl: '/proof/water.jpg'
    },
    {
      title: 'Cooking gas',
      category: 'utility',
      amountMinor: 95000,
      dueDate: daysAgo(7),
      status: 'confirmed' as const,
      submittedByMemberId: amma.id,
      submittedAt: daysAgo(7),
      confirmedAt: daysAgo(7),
      confirmer: amma,
      attachmentUrl: '/proof/gas.jpg'
    },
    {
      title: 'Broadband',
      category: 'utility',
      amountMinor: 79900,
      dueDate: daysAhead(3),
      status: 'submitted' as const,
      submittedByMemberId: lakshmi.id,
      submittedAt: daysAgo(0),
      confirmedAt: null,
      confirmer: null,
      attachmentUrl: '/proof/broadband.jpg'
    }
  ];

  for (const b of seedBills) {
    const [bill] = await db
      .insert(bills)
      .values({
        householdId: household.id,
        title: b.title,
        category: b.category,
        amountMinor: b.amountMinor,
        currency: 'INR',
        dueDate: b.dueDate,
        status: b.status,
        submittedByMemberId: b.submittedByMemberId,
        submittedAt: b.submittedAt,
        confirmedAt: b.confirmedAt
      })
      .returning();

    await db.insert(attachments).values({
      billId: bill.id,
      url: b.attachmentUrl,
      kind: 'image',
      uploadedByMemberId: b.submittedByMemberId
    });

    if (b.confirmer && b.confirmedAt) {
      await db.insert(confirmations).values({
        billId: bill.id,
        confirmedByMemberId: b.confirmer.id,
        role: b.confirmer.role,
        at: b.confirmedAt
      });
    }
  }

  console.log(
    `Seeded household "${household.displayName}" with ${seedBills.length} bills.`
  );

  await client.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
