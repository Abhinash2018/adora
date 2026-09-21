import { emptyBusinessProfile, prepareBusinessProfile, validateBusinessProfile } from './businessProfile';

describe('validateBusinessProfile', () => {
  it('requires every business detail', () => expect(validateBusinessProfile(emptyBusinessProfile)).toEqual({ name: 'Enter your business name.', location: 'Enter your city or service area.', destination: 'Add a website or booking link.', description: 'Tell us a little about your business.' }));
  it('accepts a complete profile', () => expect(validateBusinessProfile({ name: 'The Palms', location: 'Austin, Texas', destination: 'https://thepalms.example', description: 'A friendly motel.' })).toEqual({}));
  const profile = { name: 'The Palms', location: 'Austin', description: 'A friendly motel.', destination: '' };
  it('allows no website only after an explicit opt out', () => {
    expect(validateBusinessProfile({ ...profile, noWebsite: true })).toEqual({});
    expect(validateBusinessProfile(profile).destination).toBeDefined();
    expect(validateBusinessProfile({ ...profile, noWebsite: false }).destination).toBeDefined();
  });
  it('still requires business details without a website', () => {
    expect(Object.keys(validateBusinessProfile({ ...emptyBusinessProfile, noWebsite: true }))).toEqual(['name', 'location', 'description']);
  });
  it.each(['not-a-link', 'https://', 'javascript://example.com', 'https://exa mple.com'])('rejects invalid website %s', (destination) => {
    expect(validateBusinessProfile({ ...profile, destination }).destination).toBeDefined();
  });
  it('removes stale links when opted out without mutating the form draft', () => {
    const draft = { ...profile, noWebsite: true, destination: 'invalid old link' };
    expect(prepareBusinessProfile(draft).destination).toBe('');
    expect(draft.destination).toBe('invalid old link');
    expect(validateBusinessProfile(draft)).toEqual({});
  });
  it('accepts a bare domain and retains a saved goal', () => {
    const draft = { ...profile, destination: ' thepalms.example ', goal: 'calls' as const };
    expect(validateBusinessProfile(draft)).toEqual({});
    expect(prepareBusinessProfile(draft)).toMatchObject({ destination: 'thepalms.example', goal: 'calls' });
  });
});
