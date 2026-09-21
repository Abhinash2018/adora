import type { Express } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Campaign, Connection, Draft, reviewProblems } from '../src/domain/campaign';
import { ownedDraft } from './drafts';
import { PublicError } from './security';
export function snapshotHash(draft: Draft, connections: Connection[]) { return createHash('sha256').update(JSON.stringify({ draft, connections: [...connections].sort((a, b) => a.provider.localeCompare(b.provider)) })).digest('hex'); }
export function requireLiveAdapter(): never { throw new PublicError('Live campaign submission and management are not enabled. Provider campaign adapters, targeting, billing, fees and spending controls still require implementation and verification. No ad was submitted and no money was charged.', 503); }
type RecordRow = { id: string; owner_id: string; draft_id: string; revision: number; snapshot_hash: string; expires_at: string; campaign: Campaign };
export function registerCampaigns(app: Express, database: () => SupabaseClient) {
  app.post('/api/campaigns/review', async (req, res) => {
    const input = z.object({ draftId: z.string().uuid(), revision: z.number().int().positive(), reviewed: z.literal(true) }).parse(req.body);
    const db = database(); const owner = res.locals.owner as string; const draft = await ownedDraft(db, owner, input.draftId, input.revision);
    const { data, error } = await db.from('provider_connections').select('provider,status,account_id,account_name,asset_id,asset_name,instagram_id').eq('owner_id', owner);
    if (error) throw new PublicError('Could not verify your account selection.', 503);
    const connections: Connection[] = (data ?? []).map(c => ({ provider: c.provider, status: c.status, accountId: c.account_id, accountName: c.account_name, assetId: c.asset_id, assetName: c.asset_name, instagramId: c.instagram_id, demo: false }));
    const problems = reviewProblems(draft, connections, false); if (problems.length) throw new PublicError(problems[0]);
    const hash = snapshotHash(draft, connections); const id = randomUUID(); const now = Date.now();
    const campaign: Campaign = { id, draftId: draft.id, revision: draft.revision, status: 'awaiting_approval', demo: false, createdAt: new Date(now).toISOString(), snapshot: draft, selectedConnections: connections, spendCents: null, clicks: null, conversions: null, message: 'Review saved. Live submission is disabled; no provider campaign exists.' };
    // Atomic uniqueness prevents two taps/requests from making two records. Existing snapshots are never overwritten.
    const { error: insertError } = await db.from('campaign_records').upsert({ id, owner_id: owner, draft_id: draft.id, revision: draft.revision, snapshot_hash: hash, expires_at: new Date(now + 30 * 60000).toISOString(), campaign }, { onConflict: 'owner_id,draft_id,revision', ignoreDuplicates: true });
    if (insertError) throw new PublicError('Could not save the reviewed campaign.', 503);
    const { data: saved, error: readError } = await db.from('campaign_records').select('*').eq('owner_id', owner).eq('draft_id', draft.id).eq('revision', draft.revision).single();
    if (readError || !saved) throw new PublicError('Could not verify the saved review. Retry safely.', 503);
    if (saved.snapshot_hash !== hash) throw new PublicError('The selected accounts changed after this review. Return to budget and review a new draft revision.', 409);
    res.json({ campaign: saved.campaign, liveSubmissionEnabled: false });
  });
  app.get('/api/campaigns', async (_req, res) => {
    const { data, error } = await database().from('campaign_records').select('campaign').eq('owner_id', res.locals.owner).order('created_at', { ascending: false }).limit(100);
    if (error) throw new PublicError('Could not load campaigns. Please retry.', 503); res.json({ campaigns: (data ?? []).map(row => row.campaign), liveSubmissionEnabled: false });
  });
  app.post('/api/campaigns/:id/submit', async (req, res) => {
    const id = z.string().uuid().parse(req.params.id); const approval = z.object({ approved: z.literal(true), revision: z.number().int().positive() }).parse(req.body);
    const { data, error } = await database().from('campaign_records').select('*').eq('owner_id', res.locals.owner).eq('id', id).maybeSingle(); const row = data as RecordRow | null;
    if (error || !row) throw new PublicError('Campaign not found.', 404);
    if (row.revision !== approval.revision || Date.parse(row.expires_at) < Date.now()) throw new PublicError('Approval expired or the draft changed. Review it again.', 409);
    // There is intentionally no environment switch that can accidentally launch ads.
    requireLiveAdapter();
  });
  app.post('/api/campaigns/:id/control', async (req, res) => {
    const id = z.string().uuid().parse(req.params.id); z.object({ action: z.enum(['pause', 'resume', 'stop']) }).parse(req.body);
    const { data, error } = await database().from('campaign_records').select('id').eq('owner_id', res.locals.owner).eq('id', id).maybeSingle();
    if (error || !data) throw new PublicError('Campaign not found.', 404); requireLiveAdapter();
  });
}
