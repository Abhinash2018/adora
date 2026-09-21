import type { Draft, Provider } from './campaign';
export function allocation(draft: Pick<Draft, 'channels' | 'budgetCents'>): { provider: Provider; cents: number }[] {
  const providers = [...new Set(draft.channels.map(channel => channel === 'google' ? 'google' as const : 'meta' as const))]; const base = Math.floor(draft.budgetCents / providers.length);
  return providers.map((provider, i) => ({ provider, cents: base + (i < draft.budgetCents % providers.length ? 1 : 0) }));
}
export function normalizeDestination(value: string, goal: Draft['business']['goal']): string {
  const trimmed = value.trim(); if (goal === 'calls') return trimmed.replace(/^tel:/, '').replace(/[\s()-]/g, '');
  return trimmed && !trimmed.includes('://') ? `https://${trimmed}` : trimmed;
}
export function destinationProblem(value: string, goal: Draft['business']['goal']): string | null {
  if (goal === 'calls') return /^\+?[1-9]\d{6,14}$/.test(normalizeDestination(value, goal)) ? null : 'Enter a business phone number, including country code (for example +15125550100).';
  try { const url = new URL(normalizeDestination(value, goal)); if (url.protocol !== 'https:' || !url.hostname.includes('.') || url.username || url.password || /\s/.test(value)) throw new Error();
    if (goal === 'messages' && !['m.me', 'wa.me', 'www.messenger.com', 'messenger.com', 'ig.me'].includes(url.hostname.toLowerCase())) return 'Enter a supported messaging link (m.me, wa.me, messenger.com or ig.me).';
    return null;
  } catch { return goal === 'messages' ? 'Add your business messaging link. You do not need a website.' : 'Add a secure website or booking link, or choose Calls / Messages if you do not have one.'; }
}
