import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Draft } from '../src/domain/campaign';
import { PublicError } from './security';
const draftSchema = z.object({ id: z.string().uuid(), revision: z.number().int().positive(), business: z.object({ name: z.string().min(1).max(100), location: z.string().min(1).max(200), description: z.string().min(1).max(3000), destination: z.string().max(2048), noWebsite: z.boolean().optional(), goal: z.enum(['bookings', 'calls', 'messages']) }), channels: z.array(z.enum(['google', 'facebook', 'instagram'])).min(1).max(3), photos: z.array(z.object({ id: z.string().uuid(), uri: z.string().max(2048), path: z.string().max(300), mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']) })).min(1).max(5), copy: z.array(z.object({ channel: z.enum(['google', 'facebook', 'instagram']), headline: z.string().max(80), body: z.string().max(500), callToAction: z.string().max(50) })).max(3), budgetCents: z.number().int(), days: z.number().int(), destination: z.string().max(2048), copyConfirmed: z.boolean() });
export async function ownedDraft(db: SupabaseClient, owner: string, id: string, revision: number): Promise<Draft> {
  const { data, error } = await db.from('workspaces').select('data').eq('owner_id', owner).maybeSingle();
  if (error || !data) throw new PublicError('Saved draft not found. Save your progress and retry.', 404);
  const parsed = draftSchema.safeParse(data.data.draft); if (!parsed.success) throw new PublicError('Complete your business details, platforms, and photos first.'); const draft = parsed.data;
  if (draft.id !== id || draft.revision !== revision) throw new PublicError('Your draft changed. Refresh and review it again.', 409);
  if (draft.photos.some(p => !new RegExp(`^${owner}/[0-9a-f-]+\\.(jpg|png|webp)$`, 'i').test(p.path))) throw new PublicError('A photo does not belong to this account.', 403);
  if (new Set(draft.channels).size !== draft.channels.length) throw new PublicError('Choose each platform only once.');
  return draft;
}
