import { emptyBusinessProfile, validateBusinessProfile } from './businessProfile';

describe('validateBusinessProfile', () => {
  it('requires every business detail', () => expect(validateBusinessProfile(emptyBusinessProfile)).toEqual({ name: 'Enter your business name.', location: 'Enter your city or service area.', destination: 'Add a website or booking link.', description: 'Tell us a little about your business.' }));
  it('accepts a complete profile', () => expect(validateBusinessProfile({ name: 'The Palms', location: 'Austin, Texas', destination: 'https://thepalms.example', description: 'A friendly motel.' })).toEqual({}));
});
