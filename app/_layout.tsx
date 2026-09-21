import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '@/src/auth/AuthProvider';
import { colors } from '@/src/ui';

export { ErrorBoundary } from 'expo-router';

function Navigation() {
  const auth = useAuth(); const segments = useSegments(); const router = useRouter();
  useEffect(() => {
    const first = segments[0] as string | undefined;
    const publicRoute = !first || first === 'index' || first === 'sign-in' || first === 'auth';
    if (!auth.loading && !auth.session && !auth.demo && !publicRoute) router.replace('/sign-in');
  }, [auth.loading, auth.session, auth.demo, segments, router]);
  if (auth.loading) return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Restoring your session" color={colors.ink} /></View>;
  return <><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} /></>;
}

export default function RootLayout() {
  return <AuthProvider><Navigation /></AuthProvider>;
}
