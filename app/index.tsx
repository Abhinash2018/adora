import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '@/src/auth/AuthProvider';
import { Button, colors, Notice, Screen, ui } from '@/src/ui';

export default function Welcome() {
  const router = useRouter();
  const auth = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const demo = async () => { setBusy(true); try { await auth.startDemo(); router.push('/business'); } catch { setError('Could not save your demo session. Check device storage and try again.'); } finally { setBusy(false); } };
  return <Screen title={'Big ideas.\nMeet more customers.'} subtitle="Your business. Your budget. A little help getting noticed.">
    <View style={{ backgroundColor: colors.green, borderRadius: 24, padding: 26, minHeight: 200, justifyContent: 'center', gap: 18 }}>
      <Text style={ui.caption}>YOUR NEXT AD</Text><Text style={ui.title}>A picture.\nA few words.</Text><Text style={ui.body}>Create your first promotion, one simple step at a time.</Text>
    </View>
    <Text style={ui.body}>From “I need customers” to your first ad.</Text>
    {auth.session || auth.demo ? <Button title="Open my dashboard" onPress={() => router.push('/dashboard')} /> : <Button title="Let's grow your business" onPress={() => router.push('/sign-in')} />}
    {!auth.session && <><Button title="Sign in with Google" onPress={() => router.push('/sign-in')} secondary /><Button title="Explore demo — no account needed" onPress={demo} busy={busy} secondary /></>}
    {auth.session && <Button title="My account" onPress={() => router.push('/account')} secondary />}
    {!!(error || auth.error) && <Notice error>{error || auth.error}</Notice>}
  </Screen>;
}
