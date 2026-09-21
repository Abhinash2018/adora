import { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = { bg: '#FAF8F3', ink: '#213C32', muted: '#66756D', line: '#E2E5DC', green: '#DFEACF', coral: '#FF7759', white: '#FFFFFF' };
export function Screen({ title, subtitle, children, back, step }: { title: string; subtitle?: string; children: ReactNode; back?: () => void; step?: number }) {
  return <SafeAreaView style={ui.safe}><KeyboardAvoidingView style={ui.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView contentContainerStyle={ui.page} keyboardShouldPersistTaps="handled">
    <View style={ui.row}>{back ? <Button title="‹ Back" onPress={back} secondary /> : <Text style={ui.brand}>adora</Text>}{step && <Text style={ui.caption}>{step} of 7</Text>}</View>
    {step && <View style={ui.row}>{Array.from({ length: 7 }, (_, i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? colors.ink : colors.line }} />)}</View>}
    <Text accessibilityRole="header" style={ui.title}>{title}</Text>{subtitle && <Text style={ui.body}>{subtitle}</Text>}{children}
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
export function Button({ title, onPress, secondary, disabled, busy }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; busy?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy }} disabled={disabled || busy} onPress={onPress} style={({ pressed }) => [ui.button, secondary && ui.secondary, (pressed || disabled || busy) && { opacity: .6 }]}>{busy ? <ActivityIndicator color={secondary ? colors.ink : colors.white} /> : <Text style={[ui.buttonText, secondary && { color: colors.ink }]}>{title}</Text>}</Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) { return <View style={{ gap: 8 }}><Text style={ui.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} {...props} style={[ui.input, props.multiline && { minHeight: 100, textAlignVertical: 'top' }, props.style]} /></View>; }
export function Notice({ children, error }: { children: ReactNode; error?: boolean }) { return <Text accessibilityRole={error ? 'alert' : undefined} accessibilityLiveRegion="polite" style={[ui.notice, error && { backgroundColor: '#FFE7DE', color: '#922B21' }]}>{children}</Text>; }
export function Card({ children }: { children: ReactNode }) { return <View style={ui.card}>{children}</View>; }
export const ui = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg }, page: { flexGrow: 1, width: '100%', maxWidth: 560, alignSelf: 'center', padding: 24, gap: 18 },
  brand: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -1 }, title: { fontSize: 32, fontWeight: '800', color: colors.ink, lineHeight: 38 }, body: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  caption: { color: colors.muted, fontSize: 12 }, label: { color: colors.ink, fontSize: 16, fontWeight: '700' }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  button: { backgroundColor: colors.ink, padding: 16, minHeight: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }, secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }, buttonText: { color: colors.white, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  input: { backgroundColor: colors.white, color: colors.ink, borderWidth: 1, borderColor: colors.line, borderRadius: 13, minHeight: 54, fontSize: 16, padding: 14 },
  notice: { backgroundColor: colors.green, color: colors.ink, padding: 16, borderRadius: 16, lineHeight: 21, fontSize: 14 }, card: { backgroundColor: colors.white, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.line, gap: 12 },
});
