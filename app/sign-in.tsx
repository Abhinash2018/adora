import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import { useAuth } from '@/src/auth/AuthProvider';
import { authConfigured } from '@/src/auth/client';
import { signInWithGoogle } from '@/src/auth/google';
import { Button, Notice, Screen, ui } from '@/src/ui';

export default function SignIn() {
  const router = useRouter();
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  useEffect(() => { if (auth.session) router.replace('/business'); }, [auth.session, router]);
  const login = async () => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try { await signInWithGoogle(); } catch (e) { setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.'); }
    finally { inFlight.current = false; setBusy(false); }
  };
  return <Screen title="Welcome to Adora" subtitle="Save your business and pick up where you left off." back={() => router.replace('/')}>
    {!authConfigured && <Notice>Google sign-in is not configured for this app yet. You can try every demo step without an account.</Notice>}
    <Button title="Continue with Google" onPress={login} busy={busy} disabled={!authConfigured} />
    <Text style={ui.body}>This signs you in to Adora. Connecting a Google Ads account is a separate step, with separate permission.</Text>
    {!!error && <Notice error>{error}</Notice>}
    <Button title="Explore demo" secondary onPress={async () => { try { await auth.startDemo(); router.replace('/business'); } catch { setError('Could not start the demo. Please try again.'); } }} />
  </Screen>;
}
