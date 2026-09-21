import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { completeGoogleSignIn } from '@/src/auth/google';
import { Button, Notice, Screen } from '@/src/ui';

export default function AuthCallback() {
  const params = useLocalSearchParams<{ code?: string; error?: string }>();
  const router = useRouter();
  const [exchangeError, setError] = useState('');
  const error = params.error || !params.code || typeof params.code !== 'string' ? 'Sign-in was cancelled or the link is incomplete. Please try again.' : exchangeError;
  useEffect(() => {
    if (params.error || !params.code || typeof params.code !== 'string') return;
    completeGoogleSignIn(params.code).then(() => router.replace('/business')).catch((e) => setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.'));
  }, [params.code, params.error, router]);
  return <Screen title={error ? 'Let’s try again' : 'Finishing sign-in…'}>{error ? <><Notice error>{error}</Notice><Button title="Back to sign-in" onPress={() => router.replace('/sign-in')} /></> : <Notice>Verifying your Google sign-in.</Notice>}</Screen>;
}
