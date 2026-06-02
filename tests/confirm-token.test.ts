import { describe, test, expect, beforeAll } from 'bun:test';

beforeAll(() => {
  process.env.AUTH_SECRET = 'test-secret-paalan';
});

async function load() {
  const mod = await import('../lib/confirm/token');
  return mod;
}

describe('confirm token', () => {
  test('signs and verifies a valid token', async () => {
    const { signConfirmToken, verifyConfirmToken } = await load();
    const tok = signConfirmToken(42, 7);
    const out = verifyConfirmToken(tok);
    expect(out).not.toBeNull();
    expect(out!.billId).toBe(42);
    expect(out!.memberId).toBe(7);
  });

  test('rejects tampered token', async () => {
    const { signConfirmToken, verifyConfirmToken } = await load();
    const tok = signConfirmToken(1, 2);
    const [body, sig] = tok.split('.');
    const tampered = body.replace(/.$/, body.endsWith('A') ? 'B' : 'A') + '.' + sig;
    expect(verifyConfirmToken(tampered)).toBeNull();
  });

  test('rejects malformed token', async () => {
    const { verifyConfirmToken } = await load();
    expect(verifyConfirmToken('not-a-token')).toBeNull();
    expect(verifyConfirmToken('')).toBeNull();
    expect(verifyConfirmToken('a.b.c')).toBeNull();
  });

  test('rejects token with wrong signature', async () => {
    const { signConfirmToken, verifyConfirmToken } = await load();
    const tok = signConfirmToken(1, 2);
    const [body] = tok.split('.');
    const fakeSig = 'a'.repeat(43);
    expect(verifyConfirmToken(`${body}.${fakeSig}`)).toBeNull();
  });
});
