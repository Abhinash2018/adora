import { controlDemo } from './campaignControls';
import { newDraft, submitDemo, Workspace } from './campaign';
it('completes the no-website demo lifecycle without invented conversions or duplicate records', () => {
  const draft = { ...newDraft('d', { name: 'Palms', location: 'Austin', description: 'Rooms', destination: '', noWebsite: true, goal: 'calls' }), destination: '+15125550100', channels: ['google' as const], photos: [{ id: 'p', uri: 'local', mimeType: 'image/jpeg' }], copy: [{ channel: 'google' as const, headline: 'Palms', body: 'Rooms', callToAction: 'Call now' }], copyConfirmed: true };
  let workspace: Workspace = { draft, campaigns: [], connections: [{ provider: 'google', status: 'connected', accountId: 'demo', demo: true }] };
  workspace = submitDemo(workspace, 1, true, 'c'); workspace = submitDemo(workspace, 1, true, 'duplicate'); expect(workspace.campaigns).toHaveLength(1);
  for (const next of ['under_review', 'active', 'paused', 'active', 'completed'] as const) { workspace = controlDemo(workspace, 'c', next); expect(workspace.campaigns[0].status).toBe(next); }
  expect(workspace.campaigns[0].conversions).toBeNull(); expect(workspace.campaigns[0].clicks).toBeNull(); expect(workspace.campaigns[0].spendCents).toBe(0);
  expect(() => controlDemo(workspace, 'c', 'active')).toThrow();
});
it('refuses local mutation of a non-demo campaign', () => {
  expect(() => controlDemo({ draft: null, connections: [], campaigns: [] }, 'missing', 'active')).toThrow();
});
