import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newDraft } from '../src/domain/campaign';
import { requireLiveAdapter, snapshotHash } from './campaigns';
test('snapshot fingerprint changes with budget, destination and account', () => {
  const draft = newDraft('test', { name: 'Palms', location: 'Austin', description: 'Rooms', destination: 'https://example.com' });
  const hash = snapshotHash(draft, []); assert.notEqual(snapshotHash({ ...draft, budgetCents: 20000 }, []), hash); assert.notEqual(snapshotHash({ ...draft, destination: 'https://other.example' }, []), hash); assert.notEqual(snapshotHash(draft, [{ provider: 'google', status: 'connected', accountId: 'other', demo: false }]), hash);
});
test('live submission fails closed even if an arbitrary environment flag is enabled', () => {
  process.env.LIVE_CAMPAIGNS_ENABLED = 'true'; assert.throws(requireLiveAdapter, /No ad was submitted/); delete process.env.LIVE_CAMPAIGNS_ENABLED;
});
