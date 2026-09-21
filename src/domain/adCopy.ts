import { AdCopy, Channel, Draft } from './campaign';
export type CopyPlan = { channel: Channel; factIndexes: number[]; opening: 'none' | 'discover' | 'welcome' };
export function confirmedFacts(draft: Draft): string[] { return [draft.business.location.trim(), ...draft.business.description.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean)].slice(0, 30); }
export function composeCopy(draft: Draft, plans: CopyPlan[]): AdCopy[] {
  const facts = confirmedFacts(draft);
  return draft.channels.map(channel => {
    const plan = plans.find(p => p.channel === channel); if (!plan) throw new Error('The draft is missing a selected platform.');
    if (plan.factIndexes.some(i => !Number.isInteger(i) || !facts[i])) throw new Error('The draft refers to an unconfirmed fact.');
    const limit = channel === 'google' ? 90 : 500; let body = '';
    for (const i of [...new Set(plan.factIndexes)]) { const candidate = [body, facts[i]].filter(Boolean).join(' '); if (candidate.length <= limit) body = candidate; }
    if (!body) body = draft.business.location.slice(0, limit);
    const prefix = channel === 'google' || plan.opening === 'none' ? '' : plan.opening === 'welcome' ? 'Welcome to ' : 'Discover ';
    return { channel, headline: `${prefix}${draft.business.name}`.slice(0, channel === 'google' ? 30 : 80), body, callToAction: draft.business.goal === 'calls' ? 'Call now' : draft.business.goal === 'messages' ? 'Send a message' : 'Learn more' };
  });
}
export function demoCopy(draft: Draft, request: string): AdCopy[] {
  return composeCopy(draft, draft.channels.map(channel => ({ channel, factIndexes: /short|brief/i.test(request) ? [0] : confirmedFacts(draft).map((_, i) => i), opening: /warm|friendly/i.test(request) ? 'welcome' : /discover/i.test(request) ? 'discover' : 'none' })));
}
export function copyProblem(copy: AdCopy[]): string | null {
  for (const ad of copy) { if (!ad.headline.trim() || !ad.body.trim()) return 'Add a headline and description for every platform.'; if (ad.headline.length > (ad.channel === 'google' ? 30 : 80) || ad.body.length > (ad.channel === 'google' ? 90 : 500)) return `Shorten the ${ad.channel} copy to the displayed limits.`; }
  return null;
}
