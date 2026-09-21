import { useRouter } from 'expo-router';
import { WorkspaceScreen } from '@/src/state/WorkspaceScreen';
import { Notice } from '@/src/ui';
export default function Photos() { const router = useRouter(); return <WorkspaceScreen title="A picture. A few words." step={4} back={() => router.back()}><Notice>Photo selection is the next dependent feature.</Notice></WorkspaceScreen>; }
