// Unit tests for server/security.js (no server needed).
import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.JWT_SECRET = 'unit-test-jwt-secret-0123456789-abcdefghij';
process.env.DATA_ENCRYPTION_KEY = 'unit-test-data-key-0123456789-abcdefghij';

const sec = await import('../server/security.js');

test('validatePasswordStrength enforces length, upper, lower, digit and special character', () => {
  assert.equal(sec.validatePasswordStrength('').valid, false);
  assert.equal(sec.validatePasswordStrength('Ab1!').valid, false);
  assert.equal(sec.validatePasswordStrength('alllowercase1!').valid, false);
  assert.equal(sec.validatePasswordStrength('ALLUPPERCASE1!').valid, false);
  assert.equal(sec.validatePasswordStrength('NoDigitsHere!').valid, false);
  assert.equal(sec.validatePasswordStrength('NoSpecial1234').valid, false);
  assert.equal(sec.validatePasswordStrength('G00d!Passw0rd').valid, true);
});

test('encryptPii / decryptPii round-trip with AES-256-GCM and detect tampering', () => {
  const cipher = sec.encryptPii('+92 300 1234567');
  assert.ok(cipher.startsWith('enc:v1:'));
  assert.ok(!cipher.includes('1234567'), 'ciphertext must not contain plaintext');
  assert.equal(sec.decryptPii(cipher), '+92 300 1234567');

  // two encryptions of the same value differ (random IV)
  assert.notEqual(sec.encryptPii('same'), sec.encryptPii('same'));

  // flipping a byte of the ciphertext must fail authentication
  const parts = cipher.split(':');
  parts[4] = (parts[4][0] === 'a' ? 'b' : 'a') + parts[4].slice(1);
  assert.equal(sec.decryptPii(parts.join(':')), undefined);

  assert.equal(sec.encryptPii(''), undefined);
  assert.equal(sec.encryptPii('   '), undefined);
});

test('OTP generation and hashing', () => {
  for (let i = 0; i < 50; i += 1) {
    assert.match(sec.generateSixDigitOtp(), /^\d{6}$/);
  }
  const a = sec.hashOtp('User@Example.com', '123456');
  assert.equal(a, sec.hashOtp(' user@example.com ', '123456'), 'email is normalised');
  assert.notEqual(a, sec.hashOtp('user@example.com', '654321'));
  assert.notEqual(a, sec.hashOtp('other@example.com', '123456'));
  assert.ok(sec.verifyHashEqual(a, a));
  assert.ok(!sec.verifyHashEqual(a, sec.hashOtp('user@example.com', '000000')));
  assert.ok(!sec.verifyHashEqual(a, 'short'));
  assert.ok(!sec.verifyHashEqual(undefined, a));
});

test('rate limiter blocks after the configured maximum and sets Retry-After', () => {
  const limiter = sec.createRateLimiter({ windowMs: 60_000, max: 3, keyPrefix: 'unit' });
  const req = { ip: '10.0.0.1', socket: {} };
  let nextCalls = 0;
  const res = {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; },
  };
  for (let i = 0; i < 3; i += 1) limiter(req, res, () => { nextCalls += 1; });
  assert.equal(nextCalls, 3);
  limiter(req, res, () => { nextCalls += 1; });
  assert.equal(nextCalls, 3, 'fourth request must be blocked');
  assert.equal(res.statusCode, 429);
  assert.ok(Number(res.headers['Retry-After']) >= 1);

  // a different client is unaffected
  limiter({ ip: '10.0.0.2', socket: {} }, res, () => { nextCalls += 1; });
  assert.equal(nextCalls, 4);
});

test('security headers: HSTS only for HTTPS requests', () => {
  const run = (req) => {
    const headers = {};
    sec.securityHeadersMiddleware(req, { setHeader: (k, v) => { headers[k] = v; } }, () => {});
    return headers;
  };
  const http = run({ headers: {} });
  assert.equal(http['X-Content-Type-Options'], 'nosniff');
  assert.equal(http['Strict-Transport-Security'], undefined);
  const https = run({ headers: { 'x-forwarded-proto': 'https' } });
  assert.match(https['Strict-Transport-Security'], /max-age=/);
});
