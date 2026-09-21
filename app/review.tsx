import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/auth/AuthProvider';
import { allocation } from '@/src/domain/budget';
import { channelName, money, providerFor, reviewProblems } from '@/src/domain/campaign';
import { PhotoView } from '@/src/PhotoView';
import { useWorkspace } from '@/src/state/WorkspaceProvider';
import { WorkspaceScreen } from '@/src/state/WorkspaceScreen';
import { Button, Card, Notice, ui } from '@/src/ui';
export default function Review() {
  const router = useRouter(); const { demo } = useAuth(); const workspace = useWorkspace(); const draft = workspace.data.draft;
  const [approvedKey, setApprovedKey] = useState(''); const [notice, setNotice] = useState('');
  const key = JSON.stringify([draft?.id, draft?.revision, workspace.data.connections]); const approved = approvedKey === key;
  const problems = draft ? reviewProblems(draft, workspace.data.connections, demo) : [];
  return <WorkspaceScreen title="Ready when you are." step={7} back={() => router.back()}>
    {draft && <><Card><Text style={ui.label}>{draft.business.name} · {draft.business.goal}</Text><Text style={ui.body}>{draft.business.location}</Text><Text selectable style={ui.body}>Destination: {draft.destination}</Text><Text style={ui.body}>Duration: {draft.days} days after activation · No automatic renewal</Text><Text style={ui.caption}>Draft revision {draft.revision}. Platform targeting and final launch dates are not configured for live campaigns in this build.</Text></Card>
      {draft.photos[0] && <PhotoView photo={draft.photos[0]} />}<Text style={ui.caption}>The first photo is the primary creative. Remaining uploaded photos provide creation context.</Text>
      {draft.copy.map(ad => <Card key={ad.channel}><Text style={ui.label}>{channelName(ad.channel)} · {ad.headline}</Text><Text style={ui.body}>{ad.body}</Text><Text style={ui.label}>{ad.callToAction}</Text></Card>)}
      <Card>{allocation(draft).map(a => <Text key={a.provider} style={ui.body}>{a.provider === 'meta' ? 'Meta shared allocation' : 'Google allocation'}: {money(a.cents)}</Text>)}<Text style={ui.label}>Planned ad spend: {money(draft.budgetCents)}</Text><Text style={ui.body}>Adora service fee: {demo ? '$0.00 (demo)' : 'Not configured — live submission disabled'}</Text><Text style={ui.body}>{demo ? `Demo total: ${money(draft.budgetCents)} (no charge)` : 'Taxes, platform eligibility and live total must be confirmed before any paid submission.'}</Text></Card>
      {workspace.data.connections.filter(c => draft.channels.some(ch => providerFor(ch) === c.provider)).map(c => <Card key={c.provider}><Text style={ui.label}>{c.provider === 'google' ? 'Google Ads' : 'Meta'} · {c.status.replace('_', ' ')}</Text><Text selectable style={ui.body}>{c.accountName} ({c.accountId})</Text>{c.assetName && <Text style={ui.body}>{c.assetName} ({c.assetId})</Text>}{c.instagramId && <Text style={ui.body}>Instagram asset: {c.instagramId}</Text>}<Text style={ui.caption}>{c.demo ? 'Sample connection — billing is not real' : 'Manage billing securely in the advertising platform.'}</Text></Card>)}
    </>}
    {problems.map((problem, i) => <Notice key={i} error>{problem}</Notice>)}
    <Button title="Edit accounts" secondary onPress={() => router.push('/connections')} /><Button title="Edit ad copy" secondary onPress={() => router.push('/preview')} />
    <Notice>{demo ? 'Approval simulates submission for platform review. It never launches ads or charges money.' : 'Live paid submission is disabled until provider campaign adapters, exact targeting, billing, fees and spending controls are verified. You can still save and review your campaign.'}</Notice>
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: approved }} onPress={() => setApprovedKey(approved ? '' : key)} style={ui.card}><Text style={ui.body}>{approved ? '☑' : '☐'} I reviewed this exact campaign, destination, accounts, duration and budget.{demo ? ' I approve a demo submission only.' : ' No paid submission is authorized while live launch is unavailable.'}</Text></Pressable>
    {notice && <Notice>{notice}</Notice>}
    <Button title={demo ? 'Approve demo campaign' : 'Save review'} disabled={!approved || problems.length > 0} onPress={() => setNotice('Approval is recorded on this screen only. Submission persistence is the next dependent feature.')} />
  </WorkspaceScreen>;
}
