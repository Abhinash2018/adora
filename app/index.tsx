import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const C = { bg: '#FAF8F3', ink: '#213C32', muted: '#66756D', line: '#E2E5DC', green: '#DFEACF', coral: '#FF7759', white: '#FFFFFF' };
const steps = [
  ['Welcome', 'Big ideas.\nMeet more\ncustomers.', 'Your business. Your budget. A little help getting noticed.'],
  ['Your business', 'What do you do?', 'A few details help us tell your story.'],
  ['Your goal', 'What would you\nlike more of?', 'Choose one goal. We’ll handle the setup.'],
  ['Choose channels', 'Where should\nyour ad appear?', 'Choose one or more places to promote.'],
  ['Link accounts', 'Let’s get\nconnected.', 'Your accounts stay yours. You’re in control.'],
  ['Photos and story', 'A picture.\nA few words.', 'We’ll turn them into your promotion.'],
  ['Your ad preview', 'Looking good,\nThe Palms.', 'Made from your photos and business details.'],
  ['Set your budget', 'A budget that\nworks for you.', 'Choose a total amount and how long to run.'],
  ['Review and approve', 'Ready when\nyou are.', 'Review your ad, accounts, and spending.'],
  ['Submitted for review', 'You’re on your way.', 'Your promotion has been submitted. We’ll let you know when it’s live.'],
  ['Results dashboard', 'A little momentum.', 'Your promotion is reaching people.'],
  ['Account hub', 'Your accounts', 'Connect once. Promote anytime.'],
] as const;

export default function Onboarding() {
  const router = useRouter();
  const step = Number(router.canGoBack() ? 0 : 0); // navigation state will be persisted in the next feature
  const [title, heading, subtitle] = steps[step];
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.page}>
    <View style={s.top}><View style={s.logo}><Text style={s.logoMark}>A</Text><Text style={s.wordmark}>adora</Text></View><Text style={s.step}>{title === 'Welcome' ? 'MADE SIMPLE' : '1 of 7'}</Text></View>
    {title !== 'Welcome' && <View style={s.progress}>{Array.from({ length: 7 }, (_, i) => <View key={i} style={[s.segment, i === 0 && s.segmentActive]} />)}</View>}
    <View style={s.content}><Text style={s.eyebrow}>{title === 'Welcome' ? 'YOUR NEXT AD' : 'START WITH YOU'}</Text><Text accessibilityRole="header" style={s.heading}>{heading}</Text><Text style={s.subtitle}>{subtitle}</Text>
      <View style={s.illustration}><Text style={s.tag}>YOUR NEXT AD</Text><Ionicons name="image-outline" size={56} color={C.ink} /><Text style={s.illustrationText}>A simple ad, made with your photos.</Text></View>
      <Text style={s.helper}>{title === 'Welcome' ? 'From “I need customers” to your first ad.' : 'Your progress is saved as you go.'}</Text>
    </View>
    <Pressable accessibilityRole="button" style={({ pressed }) => [s.button, pressed && s.pressed]} onPress={() => router.push('/business')}><Text style={s.buttonText}>{title === 'Welcome' ? 'Let’s grow your business' : 'Continue'}</Text><Ionicons name="arrow-forward" size={20} color={C.white} /></Pressable>
    {title === 'Welcome' && <Text style={s.signin}>Already have an account? Sign in</Text>}
  </ScrollView></SafeAreaView>;
}

const s = StyleSheet.create({ safe:{ flex:1,backgroundColor:C.bg },page:{ flexGrow:1,padding:24,justifyContent:'space-between' },top:{ flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:8 },logo:{ flexDirection:'row',alignItems:'center',gap:9 },logoMark:{ backgroundColor:C.coral,color:C.ink,width:36,height:36,borderRadius:11,textAlign:'center',textAlignVertical:'center',fontSize:20 },wordmark:{ color:C.ink,fontSize:28,fontWeight:'800',letterSpacing:-1 },step:{ color:C.ink,fontSize:11,fontWeight:'800',backgroundColor:'#EDF2E6',paddingHorizontal:11,paddingVertical:6,borderRadius:16 },progress:{ flexDirection:'row',gap:5,marginTop:22 },segment:{ height:4,flex:1,backgroundColor:C.line,borderRadius:2 },segmentActive:{ backgroundColor:C.ink },content:{ flex:1,justifyContent:'center',paddingVertical:35 },eyebrow:{ color:C.muted,fontSize:11,fontWeight:'800',marginBottom:10 },heading:{ color:C.ink,fontSize:40,lineHeight:46,fontWeight:'800',letterSpacing:-1.2 },subtitle:{ color:C.muted,fontSize:16,lineHeight:23,marginTop:16,maxWidth:285 },illustration:{ minHeight:225,marginTop:38,padding:18,alignItems:'center',justifyContent:'center',backgroundColor:C.green,borderRadius:24 },tag:{ position:'absolute',top:16,left:16,backgroundColor:C.white,borderRadius:14,paddingHorizontal:11,paddingVertical:6,color:C.ink,fontSize:10,fontWeight:'800' },illustrationText:{ color:C.ink,fontWeight:'700',marginTop:12 },helper:{ color:C.muted,fontSize:13,marginTop:24 },button:{ minHeight:56,borderRadius:16,backgroundColor:C.ink,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between' },pressed:{ opacity:.8 },buttonText:{ color:C.white,fontSize:16,fontWeight:'800' },signin:{ color:C.muted,textAlign:'center',fontSize:13,marginTop:14 } });
