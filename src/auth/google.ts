import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './client';

WebBrowser.maybeCompleteAuthSession();
let exchange: { code: string; promise: Promise<void> } | undefined;
export function completeGoogleSignIn(code: string): Promise<void> {
  if (exchange?.code === code) return exchange.promise;
  const promise = (async () => {
    if (!supabase) throw new Error('Google sign-in is not configured.');
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error('This sign-in link expired or could not be verified. Please sign in again.');
  })();
  exchange = { code, promise };
  return promise;
}
export async function signInWithGoogle() {
  if (!supabase) throw new Error('Google sign-in needs the Adora Supabase project configuration. You can explore the demo meanwhile.');
  if (Platform.OS !== 'web' && Constants.appOwnership === 'expo') throw new Error('Google sign-in needs an Adora development build. Expo Go can still run the demo.');
  const redirectTo = Platform.OS === 'web' ? `${window.location.origin}/auth/callback` : 'adora://auth/callback';
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true, scopes: 'openid email profile' } });
  if (error || !data.url) throw new Error('Could not start Google sign-in. Check your connection and try again.');
  if (Platform.OS === 'web') { window.location.assign(data.url); return; }
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') throw new Error('Sign-in cancelled. You can try again.');
  const callback = new URL(result.url);
  if (callback.searchParams.has('error')) throw new Error('Google sign-in was declined. Please try again.');
  const code = callback.searchParams.get('code');
  if (!code) throw new Error('No sign-in code was returned. Please try again.');
  await completeGoogleSignIn(code);
}
