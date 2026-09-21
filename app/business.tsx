import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { emptyBusinessProfile, type BusinessProfile, type FieldErrors, validateBusinessProfile } from '@/src/domain/businessProfile';
import { loadBusinessProfile, saveBusinessProfile } from '@/src/services/businessProfileStore';

const C = { bg: '#FAF8F3', ink: '#213C32', muted: '#66756D', line: '#E2E5DC', white: '#FFFFFF', green: '#DFEACF' };

export default function Business() {
  const router = useRouter();
  const [profile, setProfile] = useState<BusinessProfile>(emptyBusinessProfile);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeError, setStoreError] = useState('');
  const saveInFlight = useRef(false);

  useEffect(() => {
    loadBusinessProfile()
      .then((saved) => { if (saved) setProfile(saved); })
      .catch(() => setStoreError('We could not load your saved progress. Please enter your details again.'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => {
    saveInFlight.current = false;
    setSaving(false);
  }, []));

  const update = (field: keyof BusinessProfile, value: string) => {
    setProfile((old) => ({ ...old, [field]: value }));
    setErrors((old) => ({ ...old, [field]: undefined }));
  };
  const save = async () => {
    if (saveInFlight.current) return;
    const next = validateBusinessProfile(profile);
    setErrors(next);
    if (Object.keys(next).length) return;
    saveInFlight.current = true;
    setSaving(true);
    setStoreError('');
    try {
      // Preserve a goal saved on the next screen when returning here to edit.
      const previous = await loadBusinessProfile();
      await saveBusinessProfile({ ...profile, goal: previous?.goal ?? profile.goal });
    } catch {
      setStoreError('Your progress could not be saved. Check device storage and try again.');
      saveInFlight.current = false;
      setSaving(false);
      return;
    }
    router.push('/goal');
  };

  if (loading) return <SafeAreaView style={[s.safe, s.center]}><ActivityIndicator color={C.ink} /><Text style={s.note}>Loading your saved progress…</Text></SafeAreaView>;
  return <SafeAreaView style={s.safe}>
    <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={25} color={C.ink} /></Pressable>
        <View style={s.progress}>{Array.from({ length: 7 }, (_, i) => <View key={i} style={[s.segment, i === 0 && s.active]} />)}</View>
        <Text style={s.eyebrow}>START WITH YOU</Text>
        <Text accessibilityRole="header" style={s.heading}>What do you do?</Text>
        <Text style={s.subtitle}>A few details help us tell your story.</Text>
        <View style={s.fields}>
          <Field label="Business name" value={profile.name} onChangeText={(v) => update('name', v)} error={errors.name} placeholder="The Palms Motel" editable={!saving} />
          <Field label="Business location" value={profile.location} onChangeText={(v) => update('location', v)} error={errors.location} placeholder="Austin, Texas" editable={!saving} />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!profile.noWebsite, disabled: saving }}
            accessibilityLabel="I don't have a website"
            disabled={saving}
            onPress={() => {
              setProfile((old) => ({ ...old, noWebsite: !old.noWebsite }));
              setErrors((old) => ({ ...old, destination: undefined }));
            }}
            style={[s.websiteChoice, profile.noWebsite && s.chosen]}
          >
            <Ionicons name={profile.noWebsite ? 'checkbox' : 'square-outline'} size={24} color={C.ink} />
            <Text style={s.choiceLabel}>I don&apos;t have a website</Text>
          </Pressable>
          {profile.noWebsite ? <Text style={s.note}>No problem. Continue now and choose your goal next. We&apos;ll need a suitable destination before any ad can be submitted.</Text>
            : <Field label="Website or booking link" value={profile.destination} onChangeText={(v) => update('destination', v)} error={errors.destination} placeholder="thepalms.example" url editable={!saving} />}
          <Field label="What should people know?" value={profile.description} onChangeText={(v) => update('description', v)} error={errors.description} placeholder="A friendly stay near downtown." editable={!saving} />
        </View>
        <Text style={s.note}>Signed-in progress is saved to your account. Demo progress stays on this {Platform.OS === 'web' ? 'browser' : 'device'}. We&apos;ll never publish an ad without your review.</Text>
        {storeError ? <Text accessibilityRole="alert" style={s.error}>{storeError}</Text> : null}
        <Pressable disabled={saving} accessibilityRole="button" accessibilityState={{ disabled: saving, busy: saving }} style={({ pressed }) => [s.button, (pressed || saving) && { opacity: .8 }]} onPress={save}>
          <Text style={s.buttonText}>{saving ? 'Saving…' : 'Save and continue'}</Text><Ionicons name="arrow-forward" size={20} color={C.white} />
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

function Field({ label, placeholder, value, onChangeText, error, url, editable }: {
  label: string; placeholder: string; value: string; onChangeText: (value: string) => void; error?: string; url?: boolean; editable: boolean;
}) {
  return <View><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} placeholder={placeholder} placeholderTextColor={C.muted} value={value} onChangeText={onChangeText} style={[s.input, error && s.inputError]} autoCapitalize={url ? 'none' : 'sentences'} autoCorrect={!url} keyboardType={url ? 'url' : 'default'} editable={editable} />{error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}</View>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg }, center: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  page: { flexGrow: 1, padding: 24, width: '100%', maxWidth: 560, alignSelf: 'center' }, back: { minHeight: 48, width: 48, justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: 5, marginVertical: 18 }, segment: { height: 4, flex: 1, backgroundColor: C.line, borderRadius: 2 }, active: { backgroundColor: C.ink },
  eyebrow: { color: C.muted, fontSize: 11, fontWeight: '800' }, heading: { color: C.ink, fontSize: 34, lineHeight: 40, fontWeight: '800', marginTop: 10 },
  subtitle: { color: C.muted, fontSize: 16, marginTop: 10 }, fields: { gap: 16, marginTop: 28 }, label: { color: C.muted, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 13, minHeight: 54, paddingHorizontal: 14, color: C.ink, fontSize: 15 },
  inputError: { borderColor: '#B42318' }, note: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 12 }, error: { color: '#B42318', fontSize: 13, marginTop: 5 },
  websiteChoice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, minHeight: 56, borderWidth: 1, borderColor: C.line, borderRadius: 13 },
  chosen: { backgroundColor: C.green, borderColor: C.ink }, choiceLabel: { color: C.ink, fontSize: 15, fontWeight: '600', flex: 1 },
  button: { marginTop: 28, minHeight: 56, borderRadius: 16, backgroundColor: C.ink, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  buttonText: { color: C.white, fontSize: 16, fontWeight: '800', flexShrink: 1 },
});
