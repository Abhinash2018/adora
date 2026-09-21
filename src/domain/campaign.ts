import { BusinessProfile } from './businessProfile';

export type Channel = 'google' | 'facebook' | 'instagram';
export type Provider = 'google' | 'meta';
export type CampaignStatus = 'draft' | 'awaiting_approval' | 'submitted' | 'under_review' | 'active' | 'paused' | 'rejected' | 'completed' | 'failed';
export type Connection = { provider: Provider; status: 'disconnected' | 'connected' | 'expired' | 'missing_permission'; accountId?: string; accountName?: string; assetId?: string; assetName?: string; instagramId?: string; demo: boolean };
export type Photo = { id: string; uri: string; path?: string; mimeType: string };
export type AdCopy = { channel: Channel; headline: string; body: string; callToAction: string };
export type Draft = {
  id: string; revision: number; business: BusinessProfile; channels: Channel[]; photos: Photo[]; copy: AdCopy[];
  budgetCents: number; days: number; destination: string; copyConfirmed: boolean;
};
export type Campaign = { id: string; draftId: string; revision: number; status: CampaignStatus; demo: boolean; createdAt: string; snapshot: Draft; spendCents: number | null; clicks: number | null; conversions: number | null; message?: string };
export type Workspace = { draft: Draft | null; connections: Connection[]; campaigns: Campaign[] };
export const emptyWorkspace: Workspace = { draft: null, connections: [], campaigns: [] };
export function newDraft(id: string, business: BusinessProfile): Draft {
  return { id, revision: 1, business, channels: [], photos: [], copy: [], budgetCents: 10000, days: 7, destination: business.destination, copyConfirmed: false };
}
export function editDraft(draft: Draft, changes: Partial<Draft>): Draft {
  return { ...draft, ...changes, id: draft.id, revision: draft.revision + 1, copyConfirmed: changes.copyConfirmed ?? false };
}
export function recommendChannels(business: BusinessProfile): Channel[] {
  return business.goal === 'calls' ? ['google'] : ['facebook', 'instagram'];
}
export const providerFor = (channel: Channel): Provider => channel === 'google' ? 'google' : 'meta';
export const channelName = (channel: Channel) => ({ google: 'Google', facebook: 'Facebook', instagram: 'Instagram' })[channel];
export function validateBudget(cents: number, days: number): string | null {
  if (!Number.isSafeInteger(cents) || cents < 100 || cents > 100000000) return 'Enter an amount between $1 and $1,000,000, with no more than two decimal places.';
  if (!Number.isInteger(days) || days < 1 || days > 90) return 'Choose a duration between 1 and 90 days.';
  return null;
}
export function parseDollars(value: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return NaN;
  return Math.round(Number(value) * 100);
}
export const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const transitions: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ['awaiting_approval'], awaiting_approval: ['draft', 'submitted'], submitted: ['under_review', 'failed'],
  under_review: ['active', 'rejected', 'paused', 'completed', 'failed'], active: ['paused', 'completed', 'failed'],
  paused: ['active', 'completed', 'failed'], rejected: [], completed: [], failed: [],
};
export function transition(current: CampaignStatus, next: CampaignStatus): CampaignStatus {
  if (!transitions[current].includes(next)) throw new Error(`Cannot change ${current} to ${next}.`);
  return next;
}
export function reviewProblems(draft: Draft, connections: Connection[], demo: boolean): string[] {
  const problems: string[] = [];
  const budget = validateBudget(draft.budgetCents, draft.days); if (budget) problems.push(budget);
  if (!draft.channels.length) problems.push('Choose at least one platform.');
  if (!draft.photos.length) problems.push('Add at least one photo.');
  if (!draft.copyConfirmed || draft.channels.some(c => !draft.copy.some(ad => ad.channel === c && ad.headline.trim() && ad.body.trim()))) problems.push('Review and confirm the ad copy for every platform.');
  for (const provider of new Set(draft.channels.map(providerFor))) {
    const connection = connections.find(c => c.provider === provider);
    if (!connection || connection.status !== 'connected' || !connection.accountId || connection.demo !== demo) problems.push(`Select a ${provider === 'meta' ? 'Meta' : 'Google Ads'} advertising account.`);
    if (provider === 'meta' && !connection?.assetId) problems.push('Select a Meta business asset.');
  }
  if (!draft.destination.trim()) problems.push('Add a destination for this ad. You can plan without a website, but submission needs a phone number, messaging destination, or website.');
  return problems;
}
export function submitDemo(workspace: Workspace, approvedRevision: number, approved: boolean, id: string): Workspace {
  const draft = workspace.draft;
  if (!draft || !approved || draft.revision !== approvedRevision) throw new Error('Review the current draft and explicitly approve it first.');
  const previous = workspace.campaigns.find(c => c.draftId === draft.id && c.revision === approvedRevision);
  if (previous) return workspace;
  const problems = reviewProblems(draft, workspace.connections, true); if (problems.length) throw new Error(problems[0]);
  return { ...workspace, campaigns: [{ id, draftId: draft.id, revision: approvedRevision, status: 'submitted', demo: true, createdAt: new Date().toISOString(), snapshot: JSON.parse(JSON.stringify(draft)), spendCents: 0, clicks: null, conversions: null }, ...workspace.campaigns] };
}
