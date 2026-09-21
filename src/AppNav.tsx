import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ui } from './ui';
export function AppNav({ current }: { current: 'home' | 'ads' | 'account' }) {
  const router = useRouter();
  return <View style={ui.row}><View style={{ flex: 1 }}><Button title="Home" secondary={current !== 'home'} onPress={() => router.replace('/dashboard')} /></View><View style={{ flex: 1 }}><Button title="My ads" secondary={current !== 'ads'} onPress={() => router.replace('/ads')} /></View><View style={{ flex: 1 }}><Button title="Account" secondary={current !== 'account'} onPress={() => router.replace('/account')} /></View></View>;
}
