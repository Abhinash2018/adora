import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { emptyBusinessProfile, type BusinessProfile, validateBusinessProfile } from '@/src/domain/businessProfile';
import { loadBusinessProfile, saveBusinessProfile } from '@/src/services/businessProfileStore';

const C = { bg: '#FAF8F3', ink: '#213C32', muted: '#66756D', line: '#E2E5DC', white: '#FFFFFF' };

/** Native, keyboard-safe form shell. Persistence and validation are added with the business-profile feature. */
export default function Business() {
  const router = useRouter();
  const [profile, setProfile] = useState<BusinessProfile>(emptyBusinessProfile);
  const [errors, setErrors] = useState<Partial<Record<keyof BusinessProfile, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeError, setStoreError] = useState('');
  useEffect(() => { loadBusinessProfile().then((saved) => saved && setProfile(saved)).catch(() => setStoreError('We could not load your saved progress.')).finally(() => setLoading(false)); }, []);
  const update = (field: keyof BusinessProfile, value: string) => setProfile((old) => ({ ...old, [field]: value }));
  const save = async () => { const next = validateBusinessProfile(profile); setErrors(next); if (Object.keys(next).length) return; setSaving(true); setStoreError(''); try { await saveBusinessProfile(profile); } catch { setStoreError('Your progress could not be saved. Check device storage and try again.'); } finally { setSaving(false); } };
  if (loading) return <SafeAreaView style={[s.safe, s.center]}><ActivityIndicator color={C.ink} /><Text style={s.loading}>Loading your saved progress…</Text></SafeAreaView>;
  return <SafeAreaView style={s.safe}><View style={s.page}>
    <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={25} color={C.ink} /></Pressable>
    <View style={s.progress}>{Array.from({ length: 7 }, (_, i) => <View key={i} style={[s.segment, i < 2 && s.active]} />)}</View>
    <Text style={s.eyebrow}>START WITH YOU</Text><Text accessibilityRole="header" style={s.heading}>What do you do?</Text><Text style={s.subtitle}>A few details help us tell your story.</Text>
    <View style={s.fields}><Field label="Business name" value={profile.name} onChangeText={(v) => update('name', v)} error={errors.name} placeholder="The Palms Motel" /><Field label="Business location" value={profile.location} onChangeText={(v) => update('location', v)} error={errors.location} placeholder="Austin, Texas" /><Field label="Website or booking link" value={profile.destination} onChangeText={(v) => update('destination', v)} error={errors.destination} placeholder="thepalms.example" /><Field label="What should people know?" value={profile.description} onChangeText={(v) => update('description', v)} error={errors.description} placeholder="A friendly stay near downtown." /></View>
    <Text style={s.note}>Your details are saved securely on this device. We’ll never publish an ad without your review.</Text>{storeError ? <Text accessibilityRole="alert" style={s.error}>{storeError}</Text> : null}
    <Pressable disabled={saving} accessibilityRole="button" style={({ pressed }) => [s.button, (pressed || saving) && { opacity: .8 }]} onPress={save}><Text style={s.buttonText}>{saving ? 'Saving…' : 'Save and continue'}</Text><Ionicons name="arrow-forward" size={20} color={C.white} /></Pressable>
  </View></SafeAreaView>;
}

function Field({ label, placeholder, value, onChangeText, error }: { label: string; placeholder: string; value: string; onChangeText: (value: string) => void; error?: string }) { return <View><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} placeholder={placeholder} placeholderTextColor={C.muted} value={value} onChangeText={onChangeText} style={[s.input, error && s.inputError]} autoCapitalize="sentences" />{error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}</View>; }

const s = StyleSheet.create({ safe:{ flex:1,backgroundColor:C.bg },center:{ justifyContent:'center',alignItems:'center',gap:12 },loading:{ color:C.muted },page:{ flex:1,padding:24 },progress:{ flexDirection:'row',gap:5,marginVertical:23 },segment:{ height:4,flex:1,backgroundColor:C.line,borderRadius:2 },active:{ backgroundColor:C.ink },eyebrow:{ color:C.muted,fontSize:11,fontWeight:'800',marginTop:4 },heading:{ color:C.ink,fontSize:34,lineHeight:40,fontWeight:'800',letterSpacing:-1,marginTop:10 },subtitle:{ color:C.muted,fontSize:16,marginTop:10 },fields:{ gap:14,marginTop:28 },label:{ color:C.muted,fontSize:11,fontWeight:'800',marginBottom:8 },input:{ backgroundColor:C.white,borderWidth:1,borderColor:C.line,borderRadius:13,minHeight:54,paddingHorizontal:14,color:C.ink,fontSize:15 },inputError:{ borderColor:'#B42318' },note:{ color:C.muted,fontSize:13,lineHeight:19,marginTop:18 },error:{ color:'#B42318',fontSize:12,marginTop:5 },button:{ marginTop:'auto',minHeight:56,borderRadius:16,backgroundColor:C.ink,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between' },buttonText:{ color:C.white,fontSize:16,fontWeight:'800' } });
