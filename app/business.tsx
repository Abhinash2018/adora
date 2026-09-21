import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

const C = { bg: '#FAF8F3', ink: '#213C32', muted: '#66756D', line: '#E2E5DC', white: '#FFFFFF' };

/** Native, keyboard-safe form shell. Persistence and validation are added with the business-profile feature. */
export default function Business() {
  const router = useRouter();
  return <SafeAreaView style={s.safe}><View style={s.page}>
    <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={25} color={C.ink} /></Pressable>
    <View style={s.progress}>{Array.from({ length: 7 }, (_, i) => <View key={i} style={[s.segment, i < 2 && s.active]} />)}</View>
    <Text style={s.eyebrow}>START WITH YOU</Text><Text accessibilityRole="header" style={s.heading}>What do you do?</Text><Text style={s.subtitle}>A few details help us tell your story.</Text>
    <View style={s.fields}><Field label="Business name" placeholder="The Palms Motel" /><Field label="Business location" placeholder="Austin, Texas" /><Field label="Website or booking link" placeholder="thepalms.example" /></View>
    <Text style={s.note}>Your details are saved on this device in the next feature. We’ll never publish an ad without your review.</Text>
    <Pressable accessibilityRole="button" style={({ pressed }) => [s.button, pressed && { opacity: .8 }]} onPress={() => {}}><Text style={s.buttonText}>Continue</Text><Ionicons name="arrow-forward" size={20} color={C.white} /></Pressable>
  </View></SafeAreaView>;
}

function Field({ label, placeholder }: { label: string; placeholder: string }) { return <View><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} placeholder={placeholder} placeholderTextColor={C.muted} style={s.input} autoCapitalize="sentences" /></View>; }

const s = StyleSheet.create({ safe:{ flex:1,backgroundColor:C.bg },page:{ flex:1,padding:24 },progress:{ flexDirection:'row',gap:5,marginVertical:23 },segment:{ height:4,flex:1,backgroundColor:C.line,borderRadius:2 },active:{ backgroundColor:C.ink },eyebrow:{ color:C.muted,fontSize:11,fontWeight:'800',marginTop:4 },heading:{ color:C.ink,fontSize:34,lineHeight:40,fontWeight:'800',letterSpacing:-1,marginTop:10 },subtitle:{ color:C.muted,fontSize:16,marginTop:10 },fields:{ gap:18,marginTop:36 },label:{ color:C.muted,fontSize:11,fontWeight:'800',marginBottom:8 },input:{ backgroundColor:C.white,borderWidth:1,borderColor:C.line,borderRadius:13,minHeight:54,paddingHorizontal:14,color:C.ink,fontSize:15 },note:{ color:C.muted,fontSize:13,lineHeight:19,marginTop:24 },button:{ marginTop:'auto',minHeight:56,borderRadius:16,backgroundColor:C.ink,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between' },buttonText:{ color:C.white,fontSize:16,fontWeight:'800' } });
