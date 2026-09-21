import { completeGoogleSignIn, signInWithGoogle } from './google';
import { supabase } from './client';
import * as WebBrowser from 'expo-web-browser';

jest.mock('./client', () => ({ supabase: { auth: { exchangeCodeForSession: jest.fn(), signInWithOAuth: jest.fn() } } }));
jest.mock('expo-constants', () => ({ __esModule: true, default: { appOwnership: 'standalone' } }));
jest.mock('expo-web-browser', () => ({ maybeCompleteAuthSession: jest.fn(), openAuthSessionAsync: jest.fn() }));
beforeEach(() => jest.clearAllMocks());
it('exchanges a callback code only once when the browser and route both receive it', async () => {
  jest.mocked(supabase!.auth.exchangeCodeForSession).mockResolvedValue({ error: null } as never);
  await Promise.all([completeGoogleSignIn('test-code'), completeGoogleSignIn('test-code')]);
  expect(supabase!.auth.exchangeCodeForSession).toHaveBeenCalledTimes(1);
});
it('does not exchange a code when the user cancels', async () => {
  jest.mocked(supabase!.auth.signInWithOAuth).mockResolvedValue({ data: { url: 'https://example.com/oauth' }, error: null } as never);
  jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({ type: 'cancel' } as never);
  await expect(signInWithGoogle()).rejects.toThrow('cancelled');
  expect(supabase!.auth.exchangeCodeForSession).not.toHaveBeenCalled();
});
