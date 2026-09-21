import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export class PublicError extends Error { constructor(message: string, public status = 400) { super(message); } }
function encryptionKey(): Buffer {
  const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY ?? '', 'base64');
  if (key.length !== 32) throw new PublicError('Advertising connections are not configured.', 503);
  return key;
}
export function encrypt(value: unknown): string {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map(x => x.toString('base64url')).join('.');
}
export function decrypt<T>(value: string): T {
  const [iv, tag, ciphertext] = value.split('.').map(x => Buffer.from(x, 'base64url'));
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv); decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')) as T;
}
export const stateHash = (value: string) => createHash('sha256').update(value).digest('hex');
export function bearer(header?: string): string {
  const match = /^Bearer ([^\s]+)$/.exec(header ?? ''); if (!match) throw new PublicError('Sign in to continue.', 401); return match[1];
}
export function config(name: string): string { const value = process.env[name]; if (!value || value.startsWith('YOUR_')) throw new PublicError('This provider is not configured yet.', 503); return value; }
