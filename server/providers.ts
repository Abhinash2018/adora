import { Provider } from '../src/domain/campaign';
import { config, PublicError } from './security';

export type ProviderTokens = { access_token: string; refresh_token?: string; expires_at?: number };
export type BusinessAsset = { id: string; name: string; instagramId?: string };
export type AdAccount = { id: string; name: string; currency: string; assets: BusinessAsset[] };
export class ProviderError extends PublicError { constructor(public connectionStatus: 'expired' | 'missing_permission') { super(connectionStatus === 'expired' ? 'Advertising authorization expired. Reconnect your account.' : 'Required advertising permission is missing. Reconnect and grant access.', 409); } }
async function json<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  if (response.status === 401) throw new ProviderError('expired');
  if (response.status === 403) throw new ProviderError('missing_permission');
  if (!response.ok) throw new PublicError('The advertising provider rejected this request. Check permissions, eligibility, and billing in the provider dashboard.', 502);
  return response.json() as Promise<T>;
}
function callback(provider: Provider) { return `${config('API_PUBLIC_URL').replace(/\/$/, '')}/oauth/${provider}/callback`; }
function graph() { const version = config('META_GRAPH_VERSION'); if (!/^v\d+\.\d+$/.test(version)) throw new PublicError('Meta API version is not configured.', 503); return `https://graph.facebook.com/${version}`; }
function googleVersion() { const v = config('GOOGLE_ADS_API_VERSION'); if (!/^v\d+$/.test(v)) throw new PublicError('Google Ads API version is not configured.', 503); return v; }
export function authorizationUrl(provider: Provider, state: string): string {
  const url = new URL(provider === 'google' ? 'https://accounts.google.com/o/oauth2/v2/auth' : `https://www.facebook.com/${config('META_GRAPH_VERSION')}/dialog/oauth`);
  url.search = new URLSearchParams({ client_id: config(provider === 'google' ? 'GOOGLE_ADS_CLIENT_ID' : 'META_APP_ID'), redirect_uri: callback(provider), response_type: 'code', state, scope: provider === 'google' ? 'https://www.googleapis.com/auth/adwords' : 'ads_management,ads_read,pages_show_list,pages_read_engagement,instagram_basic', ...(provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : {}) }).toString();
  return url.toString();
}
export async function exchangeTokens(provider: Provider, code: string): Promise<ProviderTokens> {
  if (provider === 'google') {
    const result = await json<{ access_token: string; refresh_token?: string; expires_in: number; scope?: string }>('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: config('GOOGLE_ADS_CLIENT_ID'), client_secret: config('GOOGLE_ADS_CLIENT_SECRET'), redirect_uri: callback(provider), grant_type: 'authorization_code' }) });
    if (!result.refresh_token || !result.scope?.split(' ').includes('https://www.googleapis.com/auth/adwords')) throw new ProviderError('missing_permission');
    return { access_token: result.access_token, refresh_token: result.refresh_token, expires_at: Date.now() + result.expires_in * 1000 };
  }
  const result = await json<{ access_token: string; expires_in?: number }>(`${graph()}/oauth/access_token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: config('META_APP_ID'), client_secret: config('META_APP_SECRET'), redirect_uri: callback(provider) }) });
  const long = await json<{ access_token: string; expires_in?: number }>(`${graph()}/oauth/access_token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'fb_exchange_token', client_id: config('META_APP_ID'), client_secret: config('META_APP_SECRET'), fb_exchange_token: result.access_token }) });
  const permissions = await json<{ data: { permission: string; status: string }[] }>(`${graph()}/me/permissions`, { headers: { Authorization: `Bearer ${long.access_token}` } });
  if (!['ads_management', 'ads_read', 'pages_show_list', 'pages_read_engagement'].every(scope => permissions.data.some(p => p.permission === scope && p.status === 'granted'))) throw new ProviderError('missing_permission');
  return { access_token: long.access_token, expires_at: Date.now() + (long.expires_in ?? 3600) * 1000 };
}
export async function refreshGoogle(tokens: ProviderTokens): Promise<ProviderTokens> {
  if ((tokens.expires_at ?? 0) > Date.now() + 60000) return tokens;
  if (!tokens.refresh_token) throw new ProviderError('expired');
  const result = await json<{ access_token: string; expires_in: number }>('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: tokens.refresh_token, client_id: config('GOOGLE_ADS_CLIENT_ID'), client_secret: config('GOOGLE_ADS_CLIENT_SECRET') }) });
  return { ...tokens, access_token: result.access_token, expires_at: Date.now() + result.expires_in * 1000 };
}
export async function listAccounts(provider: Provider, tokens: ProviderTokens): Promise<AdAccount[]> {
  if (provider === 'google') {
    const base = `https://googleads.googleapis.com/${googleVersion()}`;
    const headers = { Authorization: `Bearer ${tokens.access_token}`, 'developer-token': config('GOOGLE_ADS_DEVELOPER_TOKEN'), 'Content-Type': 'application/json' };
    const customers = await json<{ resourceNames?: string[] }>(`${base}/customers:listAccessibleCustomers`, { headers });
    const accounts: AdAccount[] = [];
    // Directly accessible non-manager accounts only. MCC traversal is intentionally not inferred.
    for (const name of customers.resourceNames ?? []) {
      const id = name.split('/').pop()!;
      const info = await json<{ results?: { customer: { id: string; descriptiveName?: string; manager?: boolean; currencyCode: string; status?: string } }[] }>(`${base}/customers/${id}/googleAds:search`, { method: 'POST', headers, body: JSON.stringify({ query: 'SELECT customer.id, customer.descriptive_name, customer.manager, customer.currency_code, customer.status FROM customer' }) });
      const customer = info.results?.[0]?.customer;
      if (customer && !customer.manager && customer.status === 'ENABLED') accounts.push({ id, name: customer.descriptiveName || id, currency: customer.currencyCode, assets: [] });
    }
    return accounts;
  }
  if ((tokens.expires_at ?? 0) < Date.now()) throw new ProviderError('expired');
  const headers = { Authorization: `Bearer ${tokens.access_token}` };
  const accounts = await json<{ data: { id: string; name: string; currency: string; account_status: number }[] }>(`${graph()}/me/adaccounts?fields=id,name,currency,account_status&limit=100`, { headers });
  const pages = await json<{ data: { id: string; name: string; instagram_business_account?: { id: string } }[] }>(`${graph()}/me/accounts?fields=id,name,instagram_business_account&limit=100`, { headers });
  return accounts.data.filter(a => a.account_status === 1).map(a => ({ id: a.id, name: a.name, currency: a.currency, assets: pages.data.map(p => ({ id: p.id, name: p.name, instagramId: p.instagram_business_account?.id })) }));
}
