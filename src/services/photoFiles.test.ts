import { keepPhoto } from './photoFiles';
const mockCopy = jest.fn();
jest.mock('expo-file-system', () => ({ Paths: { document: 'document' }, Directory: class { create() {} }, File: class { uri: string; constructor(_source: unknown, name?: string) { this.uri = `file:///${name}`; } copy() { return mockCopy(); } } }));
it('does not publish a durable photo URI until native copying finishes', async () => {
  let finish!: () => void; mockCopy.mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
  let settled = false; const copying = keepPhoto('image', 'source').then(uri => { settled = true; return uri; });
  await Promise.resolve(); expect(settled).toBe(false); finish(); expect(await copying).toBe('file:///image.jpg');
});
