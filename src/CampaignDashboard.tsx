import { useCallback, useRef, useState } from 'react';
import { Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from './auth/AuthProvider';
import { Campaign, CampaignStatus, channelName, money } from './domain/campaign';
import { controlDemo } from './domain/campaignControls';
import { api } from './services/api';
import { useWorkspace } from './state/WorkspaceProvider';
import { WorkspaceScreen } from './state/WorkspaceScreen';
import { PhotoView } from './PhotoView';
import { AppNav } from './AppNav';
import { Button, Card, Notice, ui } from './ui';
export function CampaignDashboard({ history = false }: { history?: boolean }) {
  const { demo } = useAuth(); const workspace = useWorkspace(); const router = useRouter();
  const [remote, setRemote] = useState<Campaign[]>([]); const [loading, setLoading] = useState(!demo); const [error, setError] = useState(''); const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false); const [stopId, setStopId] = useState(''); const [newDraftConfirm, setNewDraftConfirm] = useState(false); const lock = useRef(false);
  useFocusEffect(useCallback(() => { let active = true;
    if (!demo) void (async () => { await Promise.resolve(); if (!active) return; setLoading(true); setError(''); try { const result = await api<{ campaigns: Campaign[] }>('/campaigns'); if (active) setRemote(result.campaigns); } catch (e) { if (active) setError(e instanceof Error ? e.message : 'Could not load campaigns.'); } finally { if (active) setLoading(false); } })();
    return () => { active = false; };
  // The retry token deliberately restarts this focused-screen fetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, attempt]));
  const campaigns = demo ? workspace.data.campaigns : remote;
  const draft = workspace.data.draft;
  async function control(id: string, status: CampaignStatus) {
    if (lock.current) return; lock.current = true; setBusy(true); setError('');
    try { if (!demo) throw new Error('Live campaign controls are not enabled. No status was changed.'); await workspace.update(w => controlDemo(w, id, status)); setStopId(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save status. Retry.'); } finally { lock.current = false; setBusy(false); }
  }
  async function create() {
    if (draft && !newDraftConfirm) { setNewDraftConfirm(true); return; }
    if (lock.current) return; lock.current = true; setBusy(true); setError('');
    try { await workspace.update(w => ({ ...w, draft: null })); setNewDraftConfirm(false); router.push('/business'); }
    catch { setError('Could not start a new draft. Check your connection and retry.'); } finally { lock.current = false; setBusy(false); }
  }
  function resume() { router.push(!draft ? '/business' : !draft.channels.length ? '/channels' : !draft.photos.length ? '/photos' : !draft.copyConfirmed ? '/preview' : !draft.destination ? '/budget' : '/review'); }
  return <WorkspaceScreen title={history ? 'Your promotions.' : 'A little momentum.'} requireDraft={false}>
    {error && <Notice error>{error}</Notice>}{loading && <Notice>Loading campaigns…</Notice>}
    {!demo && <><Notice>Live submission and reporting are not enabled. Saved reviews are not running advertisements. Metrics are unavailable, not zero.</Notice><Button title="Refresh campaigns" secondary disabled={loading} onPress={() => setAttempt(n => n + 1)} /></>}
    {draft && <Card><Text style={ui.label}>Saved draft · {draft.business.name}</Text><Text style={ui.body}>Your progress is saved. Review changes before submitting.</Text><Button title="Continue my draft" secondary onPress={resume} /></Card>}
    {!campaigns.length && !loading && <Notice>No submitted campaigns yet. Create your first promotion to see it here.</Notice>}
    {campaigns.map(campaign => <Card key={campaign.id}>
      <Text accessibilityRole="header" style={ui.label}>{campaign.snapshot.business.name}</Text><Text style={ui.label}>{campaign.demo ? 'DEMO · ' : ''}{campaign.status.replace(/_/g, ' ').toUpperCase()}</Text>
      {campaign.snapshot.photos[0] && <PhotoView photo={campaign.snapshot.photos[0]} />}
      <Text style={ui.body}>{campaign.snapshot.channels.map(channelName).join(' + ')} · {money(campaign.snapshot.budgetCents)} planned · {campaign.snapshot.days} days</Text>
      <Text selectable style={ui.caption}>Destination: {campaign.snapshot.destination}</Text>
      <Text style={ui.body}>Ad spend: {campaign.spendCents === null ? 'Unavailable' : money(campaign.spendCents)}{campaign.demo ? ' (demo — no charge)' : ''}</Text>
      <Text style={ui.body}>Ad clicks: {campaign.clicks ?? 'Unavailable'}</Text><Text style={ui.body}>Confirmed conversions: {campaign.conversions ?? 'Not tracked'}</Text>
      <Notice>Clicks and visits are not confirmed bookings, calls, messages or sales. Conversion tracking has not been configured.</Notice>
      {campaign.message && <Text style={ui.caption}>{campaign.message}</Text>}
      {demo && campaign.status === 'submitted' && <Button title="Simulate platform review" disabled={busy} secondary onPress={() => void control(campaign.id, 'under_review')} />}
      {demo && campaign.status === 'under_review' && <><Button title="Simulate approval → active" disabled={busy} secondary onPress={() => void control(campaign.id, 'active')} /><Button title="Simulate rejection" disabled={busy} secondary onPress={() => void control(campaign.id, 'rejected')} /></>}
      {demo && campaign.status === 'active' && <Button title="Pause demo campaign" disabled={busy} onPress={() => void control(campaign.id, 'paused')} />}
      {demo && campaign.status === 'paused' && <Button title="Resume demo campaign" disabled={busy} onPress={() => void control(campaign.id, 'active')} />}
      {demo && ['submitted', 'under_review', 'active', 'paused'].includes(campaign.status) && (stopId === campaign.id ? <><Notice>Stop this demo campaign? The record will stay in your history and cannot be resumed.</Notice><Button title="Confirm stop" disabled={busy} onPress={() => void control(campaign.id, 'completed')} /><Button title="Keep campaign" secondary onPress={() => setStopId('')} /></> : <Button title="Stop demo campaign" secondary disabled={busy} onPress={() => setStopId(campaign.id)} />)}
    </Card>)}
    {newDraftConfirm && <Notice>Starting a new draft replaces your current unfinished draft. Submitted campaign history stays saved.</Notice>}
    <Button title={newDraftConfirm ? 'Confirm new draft' : 'Create an ad'} busy={busy} onPress={() => void create()} />{newDraftConfirm && <Button title="Keep current draft" secondary onPress={() => setNewDraftConfirm(false)} />}
    <AppNav current={history ? 'ads' : 'home'} />
  </WorkspaceScreen>;
}
