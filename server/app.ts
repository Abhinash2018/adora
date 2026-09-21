import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { bearer, config, decrypt, encrypt, PublicError, stateHash } from './security';
import { authorizationUrl, exchangeTokens, listAccounts, ProviderError, ProviderTokens, refreshGoogle } from './providers';

const providerSchema = z.enum(['google', 'meta']);
export function database() { return createClient(config('SUPABASE_URL'), config('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } }); }
export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: (origin, done) => done(null, !origin || (process.env.WEB_ORIGINS ?? '').split(',').includes(origin)) }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', liveSubmissionEnabled: false }));
const limits = new Map<string, { since: number; count: number }>();
app.use('/api', async (req, res, next) => {
  try {
    const token = bearer(req.headers.authorization);
    const { data, error } = await database().auth.getUser(token);
    if (error || !data.user) throw new PublicError('Your session expired. Please sign in again.', 401);
    res.locals.owner = data.user.id;
    const now = Date.now(); for (const [key, limit] of limits) if (now - limit.since > 60000) limits.delete(key);
    const limit = limits.get(data.user.id) ?? { since: now, count: 0 }; limit.count++; limits.set(data.user.id, limit);
    if (limit.count > 40) throw new PublicError('Too many requests. Please try again in a minute.', 429);
    next();
  } catch (e) { next(e); }
});
app.post('/api/providers/:provider/connect', async (req, res) => {
  const provider = providerSchema.parse(req.params.provider); const state = randomBytes(32).toString('base64url');
  const url = authorizationUrl(provider, state); encrypt('configuration check');
  const { error } = await database().from('oauth_states').insert({ hash: stateHash(state), owner_id: res.locals.owner, provider, expires_at: new Date(Date.now() + 600000).toISOString() });
  if (error) throw new PublicError('Could not start account connection.', 503);
  res.json({ url });
});
app.get('/oauth/:provider/callback', async (req, res) => {
  const provider = providerSchema.parse(req.params.provider);
  const state = z.string().min(30).max(200).parse(req.query.state);
  // Atomic consume prevents callback replay and never trusts a client-supplied owner.
  const { data, error } = await database().from('oauth_states').delete().eq('hash', stateHash(state)).eq('provider', provider).gt('expires_at', new Date().toISOString()).select('owner_id').maybeSingle();
  if (error || !data) throw new PublicError('This connection link expired. Return to Adora and reconnect.');
  if (req.query.error) { res.status(400).type('text').send('Connection cancelled. Return to Adora to try again.'); return; }
  const tokens = await exchangeTokens(provider, z.string().max(4096).parse(req.query.code));
  const { error: saveError } = await database().from('provider_connections').upsert({ owner_id: data.owner_id, provider, encrypted_tokens: encrypt(tokens), status: 'connected', account_id: null, account_name: null, asset_id: null, asset_name: null, instagram_id: null }, { onConflict: 'owner_id,provider' });
  if (saveError) throw new PublicError('Connection could not be saved. Please reconnect.', 503);
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Security-Policy', "default-src 'none'");
  res.type('text').send('Account authorization saved. Return to Adora, tap Refresh accounts, and select an advertising account. No campaign was created.');
});
app.get('/api/connections', async (_req, res) => {
  const { data, error } = await database().from('provider_connections').select('provider,status,account_id,account_name,asset_id,asset_name,instagram_id').eq('owner_id', res.locals.owner);
  if (error) throw new PublicError('Could not load connections.', 503);
  res.json({ connections: (data ?? []).map(c => ({ provider: c.provider, status: c.status, accountId: c.account_id, accountName: c.account_name, assetId: c.asset_id, assetName: c.asset_name, instagramId: c.instagram_id, demo: false })) });
});
async function ownedAccounts(owner: string, provider: 'google' | 'meta') {
  const db = database();
  const { data, error } = await db.from('provider_connections').select('encrypted_tokens').eq('owner_id', owner).eq('provider', provider).maybeSingle();
  if (error || !data) throw new PublicError('Connect this advertising provider first.', 409);
  try {
    let tokens = decrypt<ProviderTokens>(data.encrypted_tokens);
    if (provider === 'google') { tokens = await refreshGoogle(tokens); const result = await db.from('provider_connections').update({ encrypted_tokens: encrypt(tokens) }).eq('owner_id', owner).eq('provider', provider); if (result.error) throw result.error; }
    return await listAccounts(provider, tokens);
  } catch (e) {
    if (e instanceof ProviderError) await db.from('provider_connections').update({ status: e.connectionStatus }).eq('owner_id', owner).eq('provider', provider);
    throw e;
  }
}
app.get('/api/providers/:provider/accounts', async (req, res) => res.json({ accounts: await ownedAccounts(res.locals.owner, providerSchema.parse(req.params.provider)) }));
app.post('/api/providers/:provider/select', async (req, res) => {
  const provider = providerSchema.parse(req.params.provider); const { accountId, assetId } = z.object({ accountId: z.string(), assetId: z.string().optional() }).parse(req.body);
  const accounts = await ownedAccounts(res.locals.owner, provider); const account = accounts.find(a => a.id === accountId); const asset = account?.assets.find(a => a.id === assetId);
  if (!account || (provider === 'meta' && !asset)) throw new PublicError('Select an account and asset you have permission to manage.', 403);
  if (account.currency !== 'USD') throw new PublicError('This version supports USD advertising accounts only.');
  const { error } = await database().from('provider_connections').update({ status: 'connected', account_id: account.id, account_name: account.name, asset_id: asset?.id ?? null, asset_name: asset?.name ?? null, instagram_id: asset?.instagramId ?? null }).eq('owner_id', res.locals.owner).eq('provider', provider);
  if (error) throw new PublicError('Could not save account selection.', 503); res.json({ ok: true });
});
app.delete('/api/providers/:provider', async (req, res) => {
  const provider = providerSchema.parse(req.params.provider);
  const { error } = await database().from('provider_connections').delete().eq('owner_id', res.locals.owner).eq('provider', provider);
  if (error) throw new PublicError('Could not disconnect.', 503);
  res.json({ ok: true, note: 'Adora access removed. Existing campaigns are not stopped. You may also revoke app permission in the provider settings.' });
});
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof z.ZodError) { res.status(400).json({ error: 'Invalid request. Check the supplied fields.' }); return; }
  res.status(error instanceof PublicError ? error.status : 500).json({ error: error instanceof PublicError ? error.message : 'The server could not complete the request. Please try again.' });
}
