// Unit tests for the React app's API service helpers (src/services/api.js) - pure functions, no browser needed.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  executeRequest,
  getErrorMessage,
  isAuthError,
  isNetworkError,
  normalizeApiError,
  withAuthToken,
} from '../src/services/api.js';

test('withAuthToken builds a Bearer header only when a token exists', () => {
  assert.deepEqual(withAuthToken('abc'), { headers: { Authorization: 'Bearer abc' } });
  assert.deepEqual(withAuthToken(''), {});
  assert.deepEqual(withAuthToken(null), {});
});

test('getErrorMessage picks the most specific message available', () => {
  assert.equal(getErrorMessage(null, 'fallback'), 'fallback');
  assert.equal(getErrorMessage('plain'), 'plain');
  assert.equal(getErrorMessage({ response: { data: { error: 'Server says no' } } }), 'Server says no');
  assert.equal(getErrorMessage({ response: { data: { message: 'Msg' } } }), 'Msg');
  assert.equal(getErrorMessage(new Error('boom')), 'boom');
});

test('normalizeApiError maps HTTP, timeout, network and cancel failures', () => {
  const http = normalizeApiError({ response: { status: 409, data: { error: 'Booth already reserved' } } });
  assert.equal(http.status, 409);
  assert.equal(http.error, 'Booth already reserved');
  assert.equal(http.isNetworkError, false);

  const noBody = normalizeApiError({ response: { status: 500, data: {} } });
  assert.equal(noBody.error, 'Request failed (500)');

  const timeout = normalizeApiError({ request: {}, code: 'ECONNABORTED' });
  assert.match(timeout.error, /timed out/i);
  assert.equal(timeout.isNetworkError, true);

  const offline = normalizeApiError({ request: {} });
  assert.equal(offline.status, 0);
  assert.equal(offline.isNetworkError, true);

  assert.equal(normalizeApiError({ code: 'ERR_CANCELED' }).code, 'ERR_CANCELED');
});

test('isAuthError and isNetworkError classify results', () => {
  assert.equal(isAuthError({ status: 401 }), true);
  assert.equal(isAuthError({ response: { status: 403 } }), true);
  assert.equal(isAuthError({ status: 404 }), false);
  assert.equal(isNetworkError({ status: 0 }), true);
  assert.equal(isNetworkError({ status: 200 }), false);
  assert.equal(isNetworkError(null), false);
});

test('executeRequest returns {ok:true,data} on success and a normalised error on failure', async () => {
  const good = await executeRequest(Promise.resolve({ data: { hello: 'world' }, status: 200 }));
  assert.deepEqual(good, { ok: true, data: { hello: 'world' }, status: 200 });

  const bad = await executeRequest(Promise.reject({ response: { status: 403, data: { error: 'Forbidden' } } }));
  assert.equal(bad.ok, false);
  assert.equal(bad.status, 403);
  assert.equal(bad.error, 'Forbidden');
});
