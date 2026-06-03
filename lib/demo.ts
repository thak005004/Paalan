// Built-in "Amma · Pune" sample household (D13).
//
// This is the zero-config demo data: when DATABASE_URL is not set, the home
// page renders from this fixture so `clone → install → dev` shows a working
// prototype instantly. It mirrors db/seed.ts exactly, so the no-DB demo and the
// seeded database look identical. Keep the two in sync if you change either.

export type DemoBillStatus = 'due' | 'submitted' | 'confirmed' | 'overdue';
export type DemoRole = 'child' | 'parent' | 'helper';

export type DemoAttachment = {
  url: string;
  kind: string;
  uploadedBy: string | null;
};

export type DemoConfirmation = {
  confirmedBy: string | null;
  role: string;
  at: Date;
};

export type DemoBill = {
  id: string;
  title: string;
  amount: number; // minor units (paise)
  currency: string;
  dueDate: string | null;
  status: DemoBillStatus;
  submittedBy: string | null;
  selfReported: boolean;
  recurrenceRule: 'none' | 'monthly';
  recurrenceDayOfMonth: number | null;
  nextDueDate: string | null;
  createdAt: Date;
  attachments: DemoAttachment[];
  confirmations: DemoConfirmation[];
};

export type DemoMember = {
  role: string;
  displayName: string | null;
  phone: string | null;
};

export type DemoHousehold = {
  id: string;
  displayName: string;
  parentName: string | null;
  currency: string;
  locale: string;
  countryCode: string;
  members: DemoMember[];
  bills: DemoBill[];
};

const rupees = (n: number) => Math.round(n * 100);
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000);
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const proof = (seed: string) => `https://picsum.photos/seed/${seed}/600/800`;

function firstOfNextMonth(): string {
  const now = new Date();
  return ymd(new Date(now.getFullYear(), now.getMonth() + 1, 1));
}

/**
 * The demo household, with dates computed relative to "now" so the feed always
 * reads naturally ("2h ago", "yesterday"). Bills are ordered newest-first to
 * match the DB query's `orderBy desc(createdAt)`.
 */
export function getDemoHousehold(): DemoHousehold {
  return {
    id: 'demo-pune-household',
    displayName: 'Pune household',
    parentName: 'Amma',
    currency: 'INR',
    locale: 'en-IN',
    countryCode: '+91',
    members: [
      { role: 'child', displayName: 'Ravi', phone: '+919811111111' },
      { role: 'parent', displayName: 'Amma', phone: '+919822222222' },
      { role: 'helper', displayName: 'Lakshmi', phone: '+919833333333' }
    ],
    bills: [
      {
        id: 'demo-broadband',
        title: 'Broadband',
        amount: rupees(799),
        currency: 'INR',
        dueDate: ymd(daysAgo(0)),
        status: 'submitted',
        submittedBy: 'helper',
        selfReported: false,
        recurrenceRule: 'none',
        recurrenceDayOfMonth: null,
        nextDueDate: null,
        createdAt: hoursAgo(5),
        attachments: [{ url: proof('broadband'), kind: 'receipt', uploadedBy: 'helper' }],
        confirmations: []
      },
      {
        id: 'demo-water',
        title: 'Water',
        amount: rupees(360),
        currency: 'INR',
        dueDate: ymd(daysAgo(8)),
        status: 'confirmed',
        submittedBy: 'parent',
        selfReported: false,
        recurrenceRule: 'none',
        recurrenceDayOfMonth: null,
        nextDueDate: null,
        createdAt: daysAgo(2),
        attachments: [{ url: proof('water'), kind: 'receipt', uploadedBy: 'parent' }],
        confirmations: [{ confirmedBy: 'Lakshmi', role: 'helper', at: daysAgo(1) }]
      },
      {
        id: 'demo-electricity',
        title: 'Electricity',
        amount: rupees(1240),
        currency: 'INR',
        dueDate: ymd(daysAgo(5)),
        status: 'confirmed',
        submittedBy: 'child',
        selfReported: false,
        recurrenceRule: 'none',
        recurrenceDayOfMonth: null,
        nextDueDate: null,
        createdAt: daysAgo(3),
        attachments: [{ url: proof('electricity'), kind: 'receipt', uploadedBy: 'child' }],
        confirmations: [{ confirmedBy: 'Amma', role: 'parent', at: hoursAgo(2) }]
      },
      {
        id: 'demo-salary',
        title: 'House help salary',
        amount: rupees(2500),
        currency: 'INR',
        dueDate: ymd(daysAgo(4)),
        status: 'confirmed',
        submittedBy: 'helper',
        selfReported: false,
        recurrenceRule: 'monthly',
        recurrenceDayOfMonth: 1,
        nextDueDate: firstOfNextMonth(),
        createdAt: daysAgo(4),
        attachments: [{ url: proof('salary'), kind: 'receipt', uploadedBy: 'helper' }],
        confirmations: [{ confirmedBy: 'Amma', role: 'parent', at: daysAgo(4) }]
      }
    ]
  };
}
