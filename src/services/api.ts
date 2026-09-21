import { supabase } from '@/src/auth/client';

export async function api<T>(path: string, body?: unknown, method?: string): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base || !supabase) throw new Error('The Adora backend is not configured yet.');
  const endpoint = new URL(base);
  if (endpoint.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname)) throw new Error('Use an HTTPS backend URL to protect your session. Plain HTTP is allowed only for local development.');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Please sign in again.');
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), path.startsWith('/ai/') ? 65000 : 20000);
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}${path}`, { method: method ?? (body ? 'POST' : 'GET'), headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` }, body: body ? JSON.stringify(body) : undefined, signal: controller.signal });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'The request failed. Please try again.');
    return result as T;
  } catch (e) { if (e instanceof Error && e.name === 'AbortError') throw new Error('The request timed out. Check your connection and retry.'); throw e; }
  finally { clearTimeout(timeout); }
}
