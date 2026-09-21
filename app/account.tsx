import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { useAuth } from '@/src/auth/AuthProvider';
import { AppNav } from '@/src/AppNav';
import { Button, Card, Notice, Screen, ui } from '@/src/ui';

export default function Account() {
  const auth = useAuth(); const router = useRouter();
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  return <Screen title="Your account" back={() => router.replace('/')}>
    <Card><Text style={ui.label}>{auth.demo ? 'Demo workspace' : auth.session?.user.email}</Text><Text style={ui.body}>{auth.demo ? 'Sample actions do not connect accounts or spend money.' : 'Your Adora account is separate from your advertising accounts.'}</Text></Card>
    <Button title="Edit business details" onPress={() => router.push('/business')} secondary />
    <Button title="Advertising accounts and billing" onPress={() => router.push('/connections')} secondary />
    <Button title="My campaigns" onPress={() => router.replace('/dashboard')} secondary />
    <Button title={auth.demo ? 'Leave demo' : 'Sign out'} busy={busy} onPress={async () => { setBusy(true); try { await auth.signOut(); router.replace('/'); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { setBusy(false); } }} />
    {!!error && <Notice error>{error}</Notice>}
    <AppNav current="account" />
  </Screen>;
}
