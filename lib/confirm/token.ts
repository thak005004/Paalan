import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.AUTH_SECRET || 'paalan-dev-secret';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64url(input: string): Buffer {
  const pad = '='.repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(
    input.replace(/-/g, '+').replace(/_/g, '/') + pad,
    'base64'
  );
}

export interface ConfirmTokenPayload {
  billId: number;
  memberId: number;
  exp: number;
}

export function signConfirmToken(billId: number, memberId: number): string {
  const payload: ConfirmTokenPayload = {
    billId,
    memberId,
    exp: Date.now() + TOKEN_TTL_MS
  };
  const body = base64url(JSON.stringify(payload));
  const sig = base64url(
    createHmac('sha256', SECRET).update(body).digest()
  );
  return `${body}.${sig}`;
}

export function verifyConfirmToken(
  token: string
): ConfirmTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expected = createHmac('sha256', SECRET).update(body).digest();
  let provided: Buffer;
  try {
    provided = fromBase64url(sig);
  } catch {
    return null;
  }
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;

  let payload: ConfirmTokenPayload;
  try {
    payload = JSON.parse(fromBase64url(body).toString('utf8'));
  } catch {
    return null;
  }

  if (
    typeof payload.billId !== 'number' ||
    typeof payload.memberId !== 'number' ||
    typeof payload.exp !== 'number'
  ) {
    return null;
  }
  if (payload.exp < Date.now()) return null;

  return payload;
}
