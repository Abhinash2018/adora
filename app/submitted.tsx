import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '@/src/auth/AuthProvider';
import { WorkspaceScreen } from '@/src/state/WorkspaceScreen';
import { Button, Card, Notice, ui } from '@/src/ui';
export default function Submitted() {
  const router = useRouter(); const { demo } = useAuth(); const { id } = useLocalSearchParams<{ id: string }>();
  return <WorkspaceScreen title={demo ? 'You’re on your way.' : 'Your review is saved.'} requireDraft={false}>
    <Notice>{demo ? 'DEMO submission saved. No real ad was created or charged.' : 'Awaiting approval. Live submission is unavailable; no campaign was sent to an advertising platform.'}</Notice>
    <Card><Text style={ui.label}>{demo ? 'Submitted (simulation)' : 'Review saved'}</Text><Text style={ui.body}>Submission is not the same as going live. Ads must pass platform review first.</Text><Text selectable style={ui.caption}>Reference: {id}</Text></Card>
    <Text style={ui.body}>No performance results are available. Your dashboard will distinguish visits and clicks from confirmed conversions.</Text>
    <Button title="Go to my dashboard" onPress={() => router.replace('/dashboard')} />
  </WorkspaceScreen>;
}
