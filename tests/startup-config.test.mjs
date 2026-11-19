// Verifies the server refuses to start with missing secrets or without MongoDB in production.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const emptyEnvPath = path.join(os.tmpdir(), 'empty-eventsphere-test.env');
try {
  fs.writeFileSync(emptyEnvPath, '', 'utf8');
} catch {}

const goodEnv = {
  ...process.env,
  DOTENV_CONFIG_PATH: emptyEnvPath,
  PORT: '3198',
  JWT_SECRET: 'startup-test-jwt-secret-0123456789-abcdefghij',
  DATA_ENCRYPTION_KEY: 'startup-test-data-key-0123456789-abcdefghij',
  ORGANIZER_SETUP_CODE: 'STARTUP-TEST-ORG-CODE',
  MONGODB_URI: '',
  MONGO_URI: '',
};

function boot(envOverrides) {
  return spawnSync(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: { ...goodEnv, ...envOverrides },
    encoding: 'utf8',
    timeout: 20000,
  });
}

test('server refuses to start without JWT_SECRET', () => {
  const r = boot({ JWT_SECRET: '', DATA_ENCRYPTION_KEY: '' });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /FATAL/);
});

test('server refuses to start with a short ORGANIZER_SETUP_CODE', () => {
  const r = boot({ ORGANIZER_SETUP_CODE: 'short' });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /ORGANIZER_SETUP_CODE/);
});

test('production mode refuses to start without MongoDB unless explicitly disabled', () => {
  const r = boot({ NODE_ENV: 'production', EVENTSPHERE_DISABLE_MONGO: '' });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /MongoDB/);
});
