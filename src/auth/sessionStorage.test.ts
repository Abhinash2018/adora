import * as SecureStore from 'expo-secure-store';
import { sessionStorage } from './sessionStorage';

const mockValues = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockValues.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => { mockValues.set(key, value); }),
  deleteItemAsync: jest.fn(async (key: string) => { mockValues.delete(key); }),
}));
jest.mock('expo-crypto', () => ({ randomUUID: () => 'aabbccdd-1234' }));
beforeEach(() => { mockValues.clear(); jest.clearAllMocks(); });
it('stores and restores a session larger than one SecureStore item', async () => {
  const value = 'x'.repeat(6000);
  await sessionStorage.setItem('session', value);
  expect(await sessionStorage.getItem('session')).toBe(value);
  await sessionStorage.removeItem('session');
  expect(mockValues.size).toBe(0);
});
it('rejects a failed write without publishing a partial session', async () => {
  jest.mocked(SecureStore.setItemAsync).mockRejectedValueOnce(new Error('Storage full'));
  await expect(sessionStorage.setItem('session', 'value')).rejects.toThrow();
  expect(await sessionStorage.getItem('session')).toBeNull();
});
it('keeps Unicode session metadata in small encrypted items', async () => {
  const value = 'A' + '🏨房间'.repeat(1000); await sessionStorage.setItem('session', value);
  expect(await sessionStorage.getItem('session')).toBe(value);
  for (const [, chunk] of mockValues) expect(new TextEncoder().encode(chunk).byteLength).toBeLessThan(2048);
});
