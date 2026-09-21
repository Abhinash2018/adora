import { WorkspaceScreen } from '@/src/state/WorkspaceScreen';
import { Notice } from '@/src/ui';
export default function Dashboard() { return <WorkspaceScreen title="Your campaigns" requireDraft={false}><Notice>Your submission is saved. Results and campaign controls are the next dependent feature.</Notice></WorkspaceScreen>; }
