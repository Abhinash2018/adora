import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { newDraft } from '../src/domain/campaign';
import { ownedDraft } from './drafts';
const owner = '00000000-0000-4000-8000-000000000001'; const draftId = '00000000-0000-4000-8000-000000000002';
const draft = { ...newDraft(draftId, { name: 'Palms', location: 'Austin', description: 'Rooms', noWebsite: true, destination: '', goal: 'calls' }), channels: ['google'], photos: [{ id: draftId, uri: '', path: `${owner}/${draftId}.jpg`, mimeType: 'image/jpeg' }] };
function db(value: unknown): SupabaseClient { return { from: (table: string) => { assert.equal(table, 'workspaces'); return { select: () => ({ eq: (field: string, id: string) => { assert.equal(field, 'owner_id'); assert.equal(id, owner); return { maybeSingle: async () => ({ data: { data: { draft: value } }, error: null }) }; } }) }; } } as unknown as SupabaseClient; }
test('draft lookup is scoped to authenticated owner', async () => { const result = await ownedDraft(db(draft), owner, draftId, 1); assert.equal(result.id, draftId); });
test('an owner cannot supply another user photo path to the server', async () => { await assert.rejects(() => ownedDraft(db({ ...draft, photos: [{ ...draft.photos[0], path: `different-owner/${draftId}.jpg` }] }), owner, draftId, 1), /does not belong/); });
test('stale draft revisions cannot be used for generation or review', async () => { await assert.rejects(() => ownedDraft(db(draft), owner, draftId, 2), /draft changed/); });
