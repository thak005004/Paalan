import { verifyConfirmToken } from '@/lib/confirm/token';
import {
  attachments,
  bills,
  db,
  householdMembers,
  households,
  type SelectAttachment,
  type SelectBill,
  type SelectHousehold,
  type SelectHouseholdMember
} from '@/lib/db';
import { eq } from 'drizzle-orm';
import { formatMoney, formatRelative, maskPhone } from '@/lib/format';
import { ConfirmCard } from './confirm-card';

export const dynamic = 'force-dynamic';

type Loaded = {
  bill: SelectBill;
  household: SelectHousehold;
  submitter: SelectHouseholdMember | null;
  confirmer: SelectHouseholdMember;
  attachment: SelectAttachment | null;
};

async function loadByToken(token: string): Promise<Loaded | null> {
  const payload = verifyConfirmToken(token);
  if (!payload) return null;

  const [bill] = await db
    .select()
    .from(bills)
    .where(eq(bills.id, payload.billId))
    .limit(1);
  if (!bill) return null;

  const [household] = await db
    .select()
    .from(households)
    .where(eq(households.id, bill.householdId))
    .limit(1);
  if (!household) return null;

  const [confirmer] = await db
    .select()
    .from(householdMembers)
    .where(eq(householdMembers.id, payload.memberId))
    .limit(1);
  if (!confirmer) return null;

  let submitter: SelectHouseholdMember | null = null;
  if (bill.submittedByMemberId) {
    const [m] = await db
      .select()
      .from(householdMembers)
      .where(eq(householdMembers.id, bill.submittedByMemberId))
      .limit(1);
    submitter = m ?? null;
  }

  const [attachment] = await db
    .select()
    .from(attachments)
    .where(eq(attachments.billId, bill.id))
    .limit(1);

  return {
    bill,
    household,
    submitter,
    confirmer,
    attachment: attachment ?? null
  };
}

export default async function ConfirmPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;
  const data = await loadByToken(token);

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f3ede0,#fbf7f0)] px-4 py-8">
      <div className="mx-auto max-w-sm">
        {!data ? (
          <ExpiredState />
        ) : (
          <Loaded data={data} token={token} />
        )}
      </div>
    </div>
  );
}

function ExpiredState() {
  return (
    <div className="rounded-2xl border border-paalan-cream-border bg-white p-6 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-paalan-rose/10 text-2xl text-paalan-rose">
        ⌛
      </div>
      <h1 className="text-base font-bold text-paalan-ink">Link expired</h1>
      <p className="mt-2 text-sm text-paalan-muted-2">
        Ask your family member to send a fresh confirmation link.
      </p>
    </div>
  );
}

function Loaded({ data, token }: { data: Loaded; token: string }) {
  const { bill, household, submitter, confirmer, attachment } = data;
  const amount = formatMoney(bill.amountMinor, bill.currency, household.locale);
  const submitterRole = submitter?.role;
  const submitterLine =
    submitter && submitterRole !== confirmer.role
      ? `Submitted by ${submitter.name}${submitterRole === 'helper' ? ' (helper)' : ''}`
      : `Submitted ${formatRelative(bill.submittedAt ?? bill.createdAt)}`;

  return (
    <div className="space-y-4">
      <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-[#dcece4] bg-paalan-green-tint-2 px-3 py-1.5 text-[11.5px] text-paalan-muted-2">
        <span>✉️</span>
        Sent via SMS to {confirmer.phone ? maskPhone(confirmer.phone) : 'your phone'}
      </div>

      <ConfirmCard
        token={token}
        amount={amount}
        title={bill.title}
        submitterLine={submitterLine}
        submittedAt={bill.submittedAt ?? bill.createdAt}
        attachmentUrl={attachment?.url ?? null}
        confirmerName={confirmer.name}
        alreadyConfirmed={bill.status === 'confirmed'}
      />

      <p className="text-center text-[11px] text-paalan-muted">
        No login. One tap. This link is single-purpose and expires after a
        week — Paalan never sees your bank or medical info.
      </p>
    </div>
  );
}
