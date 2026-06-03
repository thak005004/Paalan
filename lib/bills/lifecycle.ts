export type BillStatus = 'due' | 'submitted' | 'confirmed' | 'overdue';

export const ALLOWED_TRANSITIONS: Record<BillStatus, BillStatus[]> = {
  due: ['submitted', 'overdue'],
  submitted: ['confirmed', 'due'],
  confirmed: [],
  overdue: ['submitted']
};

export class InvalidTransitionError extends Error {
  constructor(from: BillStatus, to: BillStatus) {
    super(`Cannot transition bill from ${from} to ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

export function canTransition(from: BillStatus, to: BillStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: BillStatus, to: BillStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}

export function nextStatusForOverdue(
  current: BillStatus,
  dueDate: Date,
  now: Date = new Date()
): BillStatus {
  if (current === 'due' && dueDate.getTime() < now.getTime()) {
    return 'overdue';
  }
  return current;
}

export function isClosedLoop(
  status: BillStatus,
  hasAttachment: boolean,
  hasConfirmation: boolean
): boolean {
  return status === 'confirmed' && hasAttachment && hasConfirmation;
}
