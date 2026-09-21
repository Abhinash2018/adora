import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Auth sessions can exceed the size supported by a single SecureStore value.
// Write chunks under a fresh generation; switch the manifest only after all succeed.
const chunkSize = 1500;
type Manifest = { generation: string; count: number };
async function manifest(key: string): Promise<Manifest | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Manifest;
  if (!/^[a-f0-9-]+$/i.test(parsed.generation) || !Number.isInteger(parsed.count) || parsed.count < 1 || parsed.count > 100) throw new Error('Invalid session storage');
  return parsed;
}
async function removeChunks(key: string, m: Manifest | null) {
  if (m) await Promise.all(Array.from({ length: m.count }, (_, i) => SecureStore.deleteItemAsync(`${key}.${m.generation}.${i}`)));
}
export const sessionStorage = {
  async getItem(key: string) {
    const m = await manifest(key);
    if (!m) return null;
    const chunks = await Promise.all(Array.from({ length: m.count }, (_, i) => SecureStore.getItemAsync(`${key}.${m.generation}.${i}`)));
    return chunks.some((part) => part === null) ? null : chunks.join('');
  },
  async setItem(key: string, value: string) {
    const old = await manifest(key);
    const next = { generation: Crypto.randomUUID(), count: Math.max(1, Math.ceil(value.length / chunkSize)) };
    try {
      for (let i = 0; i < next.count; i++) await SecureStore.setItemAsync(`${key}.${next.generation}.${i}`, value.slice(i * chunkSize, (i + 1) * chunkSize));
      await SecureStore.setItemAsync(key, JSON.stringify(next));
    } catch (error) { await removeChunks(key, next).catch(() => {}); throw error; }
    await removeChunks(key, old).catch(() => {});
  },
  async removeItem(key: string) { const old = await manifest(key); await SecureStore.deleteItemAsync(key); await removeChunks(key, old); },
};
