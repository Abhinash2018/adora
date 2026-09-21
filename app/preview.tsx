import { WorkspaceScreen } from '@/src/state/WorkspaceScreen';
import { Notice } from '@/src/ui';
export default function Preview() { return <WorkspaceScreen title="Your first draft" step={5}><Notice>Ad creation is the next dependent feature.</Notice></WorkspaceScreen>; }
