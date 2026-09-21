import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type BusinessGoal, type BusinessProfile } from '@/src/domain/businessProfile';
import { loadBusinessProfile, saveBusinessProfile } from '@/src/services/businessProfileStore';

const goals: { value: BusinessGoal; title: string; detail: string }[] = [
  { value: 'bookings', title: 'Bookings & sales', detail: 'Help people book or buy from your business.' },
  { value: 'calls', title: 'Phone calls', detail: 'Make it easy for people to reach you.' },
  { value: 'messages', title: 'Messages', detail: 'Start a conversation with customers.' },
];

export default function Goal() {
  const router = useRouter();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [goal, setGoal] = useState<BusinessGoal>('bookings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const savingRef = useRef(false);
  useEffect(() => {
    loadBusinessProfile().then((data) => {
      setProfile(data);
      if (data?.goal) setGoal(data.goal);
      if (!data) setError('Add your business details first.');
    }).catch(() => setError('We could not load your business details. Please return and try again.'))
      .finally(() => setLoading(false));
  }, []);
  const save = async () => {
    if (!profile || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      await saveBusinessProfile({ ...profile, goal });
      setSaved(true);
      router.push('/channels');
    } catch {
      setError('Your goal could not be saved. Please try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.page}>
    <Pressable accessibilityRole="button" style={s.back} onPress={() => router.replace('/business')}><Text style={s.backText}>‹  Business details</Text></Pressable>
    <Text style={s.eyebrow}>MAKE IT COUNT · 2 OF 7</Text>
    <Text accessibilityRole="header" style={s.heading}>What would you like more of?</Text>
    <Text style={s.body}>Choose one goal. You can change this before launch.</Text>
    {loading ? <ActivityIndicator accessibilityLabel="Loading business details" color="#213C32" /> : profile ? <>
      <View style={s.options}>
        {goals.map((option) => <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: goal === option.value, disabled: saving }} disabled={saving} onPress={() => { setGoal(option.value); setSaved(false); }} style={[s.option, goal === option.value && s.selected]}>
          <Text style={s.label}>{option.title}{goal === option.value ? '  ✓' : ''}</Text><Text style={s.body}>{option.detail}</Text>
        </Pressable>)}
      </View>
      {profile.noWebsite && <Text style={s.notice}>{goal === 'bookings' ? 'No website yet? You can plan your ad now. A supported booking or sales destination must be added before submission.' : 'You can plan this goal without a website. A phone number or supported messaging account will be needed before submission.'}</Text>}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving, busy: saving }} disabled={saving} onPress={save} style={s.button}><Text style={s.buttonText}>{saving ? 'Saving…' : 'Find my customers'}</Text></Pressable>
      {saved && <Text accessibilityLiveRegion="polite" style={s.notice}>Your goal is saved. Choose your advertising platforms next. No ad has been submitted.</Text>}
    </> : null}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
  </ScrollView></SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF8F3' }, page: { padding: 24, gap: 20, width: '100%', maxWidth: 560, alignSelf: 'center' },
  back: { minHeight: 48, justifyContent: 'center' }, backText: { color: '#213C32', fontSize: 16 }, eyebrow: { color: '#66756D', fontSize: 12, fontWeight: '700' },
  heading: { color: '#213C32', fontSize: 34, fontWeight: '800' }, body: { color: '#66756D', fontSize: 15, lineHeight: 22 },
  options: { gap: 14 }, option: { borderColor: '#E2E5DC', borderWidth: 1, borderRadius: 18, padding: 20, gap: 8, backgroundColor: '#FFFFFF' },
  selected: { borderColor: '#213C32', backgroundColor: '#EDF2E6' }, label: { color: '#213C32', fontSize: 17, fontWeight: '700' },
  notice: { color: '#213C32', backgroundColor: '#DFEACF', borderRadius: 16, padding: 18, fontSize: 14, lineHeight: 21 },
  button: { minHeight: 56, backgroundColor: '#213C32', borderRadius: 16, padding: 18, alignItems: 'center' }, buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  error: { color: '#B42318', fontSize: 14 },
});
