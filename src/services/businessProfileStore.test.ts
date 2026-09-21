import * as SecureStore from 'expo-secure-store';
import { loadBusinessProfile, saveBusinessProfile } from './businessProfileStore';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('./profileCloud', () => ({ profileOwner: async () => null }));

const draft = { name: 'Motel', location: 'Austin', description: 'Rooms', noWebsite: true, destination: 'stale.example', goal: 'calls' as const };

beforeEach(() => jest.resetAllMocks());

it('persists the opt out and goal while removing a stale link', async () => {
  await saveBusinessProfile(draft);
  const raw = jest.mocked(SecureStore.setItemAsync).mock.calls[0][1];
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(raw);
  expect(await loadBusinessProfile()).toEqual({ ...draft, destination: '' });
});

it('surfaces storage failures to the form instead of reporting success', async () => {
  jest.mocked(SecureStore.setItemAsync).mockRejectedValue(new Error('Storage unavailable'));
  await expect(saveBusinessProfile(draft)).rejects.toThrow('Storage unavailable');
});
