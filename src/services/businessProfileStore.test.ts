import * as SecureStore from 'expo-secure-store';
import { loadBusinessProfile, saveBusinessProfile } from './businessProfileStore';
import { sessionStorage } from '@/src/auth/sessionStorage';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('./profileCloud', () => ({ profileOwner: async () => null }));
jest.mock('@/src/auth/sessionStorage', () => ({ sessionStorage: { getItem: jest.fn(), setItem: jest.fn() } }));

const draft = { name: 'Motel', location: 'Austin', description: 'Rooms', noWebsite: true, destination: 'stale.example', goal: 'calls' as const };

beforeEach(() => jest.resetAllMocks());

it('persists the opt out and goal while removing a stale link', async () => {
  await saveBusinessProfile(draft);
  const raw = jest.mocked(sessionStorage.setItem).mock.calls[0][1];
  jest.mocked(sessionStorage.getItem).mockResolvedValue(raw);
  expect(await loadBusinessProfile()).toEqual({ ...draft, destination: '' });
});

it('surfaces storage failures to the form instead of reporting success', async () => {
  jest.mocked(sessionStorage.setItem).mockRejectedValue(new Error('Storage unavailable'));
  await expect(saveBusinessProfile(draft)).rejects.toThrow('Storage unavailable');
});
it('can read existing legacy profiles without losing saved progress', async () => {
  jest.mocked(sessionStorage.getItem).mockResolvedValue(null); jest.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify(draft));
  expect(await loadBusinessProfile()).toEqual(draft);
});
