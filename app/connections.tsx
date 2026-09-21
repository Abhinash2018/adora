import { useRouter } from 'expo-router';
import { Button, Notice } from '@/src/ui';
import { WorkspaceScreen } from '@/src/state/WorkspaceScreen';

export default function Connections() { const router = useRouter(); return <WorkspaceScreen title="Let's get connected" step={3} back={() => router.replace('/channels')}><Notice>Your platforms are saved. Account connection is being added in the next dependent feature.</Notice><Button title="Change platforms" onPress={() => router.replace('/channels')} secondary /></WorkspaceScreen>; }
