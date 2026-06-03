import { describe, test, expect } from 'bun:test';
import {
  ALLOWED_TRANSITIONS,
  assertTransition,
  canTransition,
  InvalidTransitionError,
  isClosedLoop,
  nextStatusForOverdue,
  type BillStatus
} from '../lib/bills/lifecycle';

describe('bill lifecycle', () => {
  test('due → submitted is allowed', () => {
    expect(canTransition('due', 'submitted')).toBe(true);
  });

  test('submitted → confirmed is allowed', () => {
    expect(canTransition('submitted', 'confirmed')).toBe(true);
  });

  test('due → overdue is allowed', () => {
    expect(canTransition('due', 'overdue')).toBe(true);
  });

  test('overdue → submitted is allowed (parent finally paid)', () => {
    expect(canTransition('overdue', 'submitted')).toBe(true);
  });

  test('confirmed is terminal', () => {
    expect(ALLOWED_TRANSITIONS.confirmed).toEqual([]);
    expect(canTransition('confirmed', 'submitted')).toBe(false);
    expect(canTransition('confirmed', 'due')).toBe(false);
    expect(canTransition('confirmed', 'overdue')).toBe(false);
  });

  test('due → confirmed is blocked (proof must come first)', () => {
    expect(canTransition('due', 'confirmed')).toBe(false);
  });

  test('submitted → overdue is blocked', () => {
    expect(canTransition('submitted', 'overdue')).toBe(false);
  });

  test('assertTransition throws on invalid edge', () => {
    expect(() => assertTransition('confirmed', 'submitted')).toThrow(
      InvalidTransitionError
    );
  });

  test('assertTransition is silent on valid edge', () => {
    expect(() => assertTransition('submitted', 'confirmed')).not.toThrow();
  });
});

describe('nextStatusForOverdue', () => {
  test('flips due bills with past dueDate to overdue', () => {
    const past = new Date('2025-01-01T00:00:00Z');
    const now = new Date('2025-02-01T00:00:00Z');
    expect(nextStatusForOverdue('due', past, now)).toBe('overdue');
  });

  test('leaves due bills with future dueDate as due', () => {
    const future = new Date('2025-12-31T00:00:00Z');
    const now = new Date('2025-02-01T00:00:00Z');
    expect(nextStatusForOverdue('due', future, now)).toBe('due');
  });

  test('never overrides terminal/confirmed status', () => {
    const past = new Date('2025-01-01T00:00:00Z');
    const now = new Date('2025-02-01T00:00:00Z');
    expect(nextStatusForOverdue('confirmed', past, now)).toBe('confirmed');
    expect(nextStatusForOverdue('submitted', past, now)).toBe('submitted');
  });
});

describe('isClosedLoop', () => {
  test('confirmed + proof + confirmation = closed loop', () => {
    expect(isClosedLoop('confirmed', true, true)).toBe(true);
  });

  test('confirmed without proof is not a closed loop', () => {
    expect(isClosedLoop('confirmed', false, true)).toBe(false);
  });

  test('confirmed without confirmation row is not a closed loop', () => {
    expect(isClosedLoop('confirmed', true, false)).toBe(false);
  });

  test('non-confirmed statuses never count', () => {
    const statuses: BillStatus[] = ['due', 'submitted', 'overdue'];
    for (const s of statuses) {
      expect(isClosedLoop(s, true, true)).toBe(false);
    }
  });
});
