import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { bearer, decrypt, encrypt, stateHash } from './security';
import { app, errorHandler } from './app';
test('tokens are authenticated encrypted and tampering is rejected', () => {
  process.env.TOKEN_ENCRYPTION_KEY = randomBytes(32).toString('base64');
  const value = { access_token: 'test-secret' }; const ciphertext = encrypt(value);
  assert.ok(!ciphertext.includes('test-secret')); assert.deepEqual(decrypt(ciphertext), value);
  const parts = ciphertext.split('.'); parts[1] = Buffer.alloc(16).toString('base64url'); assert.throws(() => decrypt(parts.join('.')));
});
test('bearer requires a single token and state is hashed', () => {
  assert.throws(() => bearer(undefined)); assert.throws(() => bearer('Bearer a b')); assert.equal(bearer('Bearer abc'), 'abc'); assert.equal(stateHash('value').length, 64);
});
test('API rejects unauthenticated requests before accessing credentials or data', async () => {
  app.use(errorHandler); const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening', resolve));
  try { const addr = server.address(); assert.ok(addr && typeof addr !== 'string'); const response = await fetch(`http://127.0.0.1:${addr.port}/api/connections`); assert.equal(response.status, 401); }
  finally { await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())); }
});
