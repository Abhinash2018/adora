import { composeCopy, confirmedFacts, demoCopy } from './adCopy';
import { newDraft } from './campaign';
const draft = { ...newDraft('d', { name: 'Palms', location: 'Austin', description: 'Rooms near downtown. Parking available.', destination: 'https://example.com', goal: 'bookings' }), channels: ['google' as const, 'instagram' as const] };
it('only composes supplied facts and respects conservative channel limits', () => {
  const copy = demoCopy(draft, 'friendly'); expect(copy[1].headline).toBe('Welcome to Palms'); expect(copy[0].body.length).toBeLessThanOrEqual(90);
  expect(copy[0].body).not.toMatch(/free|discount|guarantee/i); expect(confirmedFacts(draft)).toHaveLength(3);
});
it('rejects invented fact references and handles shorter edit requests', () => {
  expect(() => composeCopy(draft, [{ channel: 'google', factIndexes: [99], opening: 'none' }])).toThrow();
  expect(demoCopy(draft, 'shorter')[0].body).toBe('Austin');
});
