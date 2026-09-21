import { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/auth/AuthProvider';
import { Button, Notice, Screen } from '@/src/ui';
import { useWorkspace } from './WorkspaceProvider';

export function WorkspaceScreen({ title, children, step, back, requireDraft = true }: { title: string; children: ReactNode; step?: number; back?: () => void; requireDraft?: boolean }) {
  const workspace = useWorkspace(); const auth = useAuth(); const router = useRouter();
  return <Screen title={title} step={step} back={back}>
    {auth.demo && <Notice>DEMO · No real accounts, ads, or charges.</Notice>}
    {workspace.loading ? <Notice>Loading your progress…</Notice> : workspace.error ? <><Notice error>{workspace.error}</Notice><Button title="Retry" onPress={workspace.retry} /></> : requireDraft && !workspace.data.draft ? <><Notice>Start with your business details.</Notice><Button title="Add business details" onPress={() => router.replace('/business')} /></> : children}
  </Screen>;
}
