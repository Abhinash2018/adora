import { editDraft, newDraft, parseDollars, recommendChannels, submitDemo, transition, validateBudget, Workspace } from './campaign';

const business = { name: 'Palms', location: 'Austin', description: 'Rooms', destination: '', noWebsite: true, goal: 'calls' as const };
it('recommends platforms and invalidates copy approval when the draft changes', () => {
  expect(recommendChannels(business)).toEqual(['google']);
  const draft = { ...newDraft('a', business), copyConfirmed: true };
  expect(editDraft(draft, { days: 10 })).toMatchObject({ id: 'a', revision: 2, copyConfirmed: false });
});
it.each(['-1', '1.005', 'Infinity', '1e5', ''])('rejects malformed money %s', value => expect(Number.isNaN(parseDollars(value))).toBe(true));
it('requires positive whole cents and a bounded integer duration', () => {
  expect(parseDollars('10.25')).toBe(1025);
  expect(validateBudget(1025, 7)).toBeNull();
  expect(validateBudget(0, 7)).toBeTruthy(); expect(validateBudget(1000, 1.5)).toBeTruthy(); expect(validateBudget(NaN, 7)).toBeTruthy();
});
it('does not call submitted campaigns active and rejects invalid state transitions', () => {
  expect(transition('submitted', 'under_review')).toBe('under_review');
  expect(() => transition('submitted', 'active')).toThrow();
  expect(() => transition('completed', 'active')).toThrow();
});
it('requires explicit approval of the exact revision and deduplicates retries', () => {
  const draft = { ...newDraft('a', business), channels: ['google' as const], photos: [{ id: 'p', uri: 'local', mimeType: 'image/jpeg' }], copy: [{ channel: 'google' as const, headline: 'Palms', body: 'Rooms', callToAction: 'Call' }], copyConfirmed: true, destination: '+15125550100' };
  const workspace: Workspace = { draft, campaigns: [], connections: [{ provider: 'google', status: 'connected', accountId: 'demo', demo: true }] };
  expect(() => submitDemo(workspace, 1, false, 'c')).toThrow();
  expect(() => submitDemo(workspace, 2, true, 'c')).toThrow();
  const once = submitDemo(workspace, 1, true, 'c');
  expect(once.campaigns[0].status).toBe('submitted');
  expect(submitDemo(once, 1, true, 'other').campaigns).toHaveLength(1);
});
