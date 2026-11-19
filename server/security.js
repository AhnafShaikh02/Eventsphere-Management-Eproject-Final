import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PII_PREFIX = 'enc:v1:';
const runtimeSecretCache = new Map();

function loadOrCreateRuntimeSecrets() {
  const dataDir = path.resolve(process.cwd(), process.env.EVENTSPHERE_DATA_DIR || '.data');
  const secretsFile = path.join(dataDir, '.runtime-secrets.json');
  try {
    if (fs.existsSync(secretsFile)) {
      const parsed = JSON.parse(fs.readFileSync(secretsFile, 'utf8'));
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // Ignore read errors and regenerate
  }

  const generated = {
    JWT_SECRET: crypto.randomBytes(32).toString('hex'),
    DATA_ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
    ORGANIZER_SETUP_CODE: `ORG-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
  };

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(secretsFile, JSON.stringify(generated, null, 2), { encoding: 'utf8', mode: 0o600 });
  } catch {
    // Ephemeral in-memory fallback if filesystem is read-only
  }
  return generated;
}

export function resolveRuntimeSecret(name, minLength = 12) {
  const envValue = String(process.env[name] || '').trim();
  if (envValue.length >= minLength) {
    return envValue;
  }
  if (runtimeSecretCache.has(name)) {
    return runtimeSecretCache.get(name);
  }
  const persisted = loadOrCreateRuntimeSecrets();
  let resolved = String(persisted[name] || '').trim();
  if (resolved.length < minLength) {
    resolved =
      name === 'ORGANIZER_SETUP_CODE'
        ? `ORG-${crypto.randomBytes(6).toString('hex').toUpperCase()}`
        : crypto.randomBytes(32).toString('hex');
  }
  runtimeSecretCache.set(name, resolved);
  console.warn(`[EventSphere] WARNING: ${name} is not set in environment — using auto-generated runtime secret.`);
  return resolved;
}

const RAW_SECRET =
  String(process.env.DATA_ENCRYPTION_KEY || '').trim().length >= 32
    ? String(process.env.DATA_ENCRYPTION_KEY).trim()
    : String(process.env.JWT_SECRET || '').trim().length >= 32
      ? String(process.env.JWT_SECRET).trim()
      : resolveRuntimeSecret('DATA_ENCRYPTION_KEY', 32);

const DERIVED_KEY = crypto.scryptSync(RAW_SECRET, 'eventsphere-pii-v1-salt', 32);

export function encryptPii(plaintext) {
  if (!plaintext || !plaintext.trim()) return undefined;
  const trimmed = plaintext.trim();
  if (trimmed.startsWith(PII_PREFIX)) return trimmed;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', DERIVED_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(trimmed, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PII_PREFIX}${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptPii(ciphertext) {
  if (!ciphertext) return undefined;
  if (!ciphertext.startsWith(PII_PREFIX)) return ciphertext;

  const rest = ciphertext.slice(PII_PREFIX.length);
  const parts = rest.split(':');
  if (parts.length !== 3) return undefined;

  try {
    const [ivHex, tagHex, dataHex] = parts;
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      DERIVED_KEY,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return undefined;
  }
}

export function generateSixDigitOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashOtp(email, otp) {
  const normalized = `${email.trim().toLowerCase()}:${otp.trim()}`;
  return crypto.createHmac('sha256', DERIVED_KEY).update(normalized).digest('hex');
}

export function hashResetSessionToken(rawToken) {
  return crypto.createHmac('sha256', DERIVED_KEY).update(`reset-session:${rawToken.trim()}`).digest('hex');
}

export function verifyHashEqual(expectedHex, actualHex) {
  if (!expectedHex || !actualHex || expectedHex.length !== actualHex.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(Buffer.from(expectedHex, 'hex'), Buffer.from(actualHex, 'hex'));
  } catch {
    return false;
  }
}

export function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must include at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must include at least one lowercase letter.' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must include at least one number.' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: 'Password must include at least one special character (e.g. !@#$%).' };
  }
  return { valid: true };
}

export function isSecureRequest(req) {
  return req.secure === true || String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

export function securityHeadersMiddleware(req, res, next) {
  // Encryption in transit: when the request arrived over HTTPS (directly or via a TLS-terminating
  // proxy such as Render/Railway/Nginx), tell browsers to only use HTTPS for the next 2 years.
  if (isSecureRequest(req)) {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  next();
}

export function createRateLimiter(options) {
  const buckets = new Map();

  // Periodic cleanup of expired buckets to keep memory bounded under high concurrency
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets.entries()) {
      if (v.resetAt <= now) buckets.delete(k);
    }
  }, Math.max(options.windowMs, 30_000));
  timer.unref();

  return (req, res, next) => {
    if (process.env.EVENTSPHERE_DISABLE_RATE_LIMIT === 'true') {
      next();
      return;
    }
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${options.keyPrefix}:${clientIp}`;
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    existing.count += 1;
    if (existing.count > options.max) {
      const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        error: `Too many requests. Please wait ${retryAfterSec}s before retrying.`,
      });
      return;
    }

    next();
  };
}
