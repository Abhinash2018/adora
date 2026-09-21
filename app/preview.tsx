import { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/auth/AuthProvider';
import { copyProblem, demoCopy } from '@/src/domain/adCopy';
import { AdCopy, Channel, channelName, editDraft } from '@/src/domain/campaign';
import { PhotoView } from '@/src/PhotoView';
import { api } from '@/src/services/api';
import { useWorkspace } from '@/src/state/WorkspaceProvider';
import { WorkspaceScreen } from '@/src/state/WorkspaceScreen';
import { Button, Card, Field, Notice, ui } from '@/src/ui';
export default function Preview() {
  const router = useRouter(); const { demo } = useAuth(); const workspace = useWorkspace(); const draft = workspace.data.draft;
  const [selected, setSelected] = useState<Channel | null>(null); const [localCopy, setLocalCopy] = useState<AdCopy[] | null>(null);
  const [request, setRequest] = useState(''); const [consent, setConsent] = useState(false); const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const lock = useRef(false);
  const copy = localCopy ?? draft?.copy ?? []; const channel = selected ?? draft?.channels[0]; const ad = copy.find(c => c.channel === channel);
  async function save(next: AdCopy[]) {
    if (!draft) return;
    await workspace.update(w => { if (!w.draft || w.draft.revision !== draft.revision) throw new Error('Your draft changed. Reload and try again.'); return { ...w, draft: editDraft(w.draft, { copy: next }) }; });
    setLocalCopy(null); setConfirmed(false);
  }
  async function generate(useAI: boolean) {
    if (!draft || lock.current) return; lock.current = true; setBusy(true); setError('');
    try { const next = useAI && !demo ? (await api<{ copy: AdCopy[] }>('/ai/copy', { draftId: draft.id, revision: draft.revision, request, consent })).copy : demoCopy(draft, request); await save(next); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not create copy. Please retry.'); } finally { lock.current = false; setBusy(false); }
  }
  function change(key: 'headline' | 'body', value: string) { setLocalCopy(copy.map(c => c.channel === channel ? { ...c, [key]: value } : c)); setConfirmed(false); }
  async function next() {
    if (!draft || lock.current) return; lock.current = true; setBusy(true); setError('');
    try { const problem = copyProblem(copy); if (problem) throw new Error(problem); if (!confirmed) throw new Error('Confirm that the copy accurately describes your business.');
      await workspace.update(w => { if (!w.draft || w.draft.revision !== draft.revision) throw new Error('Your draft changed. Please review again.'); return { ...w, draft: editDraft(w.draft, { copy, copyConfirmed: true }) }; }); setLocalCopy(null); router.push('/budget');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save. Please retry.'); } finally { lock.current = false; setBusy(false); }
  }
  return <WorkspaceScreen title={`Looking good, ${draft?.business.name ?? 'your business'}.`} step={5} back={() => router.back()}>
    <Notice>{demo ? 'Demo copy uses local templates, not an AI service. Try “shorter” or “warmer”, or edit the text yourself.' : 'AI arranges your confirmed details and uses your photos as context. It does not edit photos or add unverified offers. You can also write your own copy.'}</Notice>
    {error && <Notice error>{error}</Notice>}
    {!demo && <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: consent }} onPress={() => setConsent(!consent)} style={ui.card}><Text style={ui.body}>{consent ? '☑' : '☐'} Allow these business details and photos to be sent to the configured AI service for this request.</Text></Pressable>}
    <Field label="Ask for a change" value={request} onChangeText={setRequest} placeholder="Make it shorter and focus on the location" maxLength={1000} editable={!busy} />
    <Button title={demo ? 'Prepare demo copy' : 'Generate or revise with AI'} disabled={!draft?.photos.length || (!demo && !consent)} busy={busy} onPress={() => void generate(true)} />
    {!demo && <Button title="Start with my details (no AI)" secondary disabled={busy} onPress={() => void generate(false)} />}
    {draft?.channels.map(c => <Button key={c} title={channelName(c)} secondary={c !== channel} disabled={busy} onPress={() => setSelected(c)} />)}
    {ad && <Card><Text style={ui.caption}>{channelName(ad.channel)} · Approximate ad preview · Not published</Text>{draft?.photos[0] && <PhotoView photo={draft.photos[0]} />}<Text style={ui.label}>{draft?.business.name}</Text>
      <Field label={`Headline (${ad.channel === 'google' ? 30 : 80} characters max)`} value={ad.headline} onChangeText={value => change('headline', value)} maxLength={ad.channel === 'google' ? 30 : 80} editable={!busy} />
      <Field label={`Ad description (${ad.channel === 'google' ? 90 : 500} characters max)`} value={ad.body} onChangeText={value => change('body', value)} multiline maxLength={ad.channel === 'google' ? 90 : 500} editable={!busy} /><Text style={ui.label}>{ad.callToAction}</Text>
    </Card>}
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: confirmed }} onPress={() => setConfirmed(!confirmed)} style={ui.card}><Text style={ui.body}>{confirmed ? '☑' : '☐'} I reviewed every platform. The details, claims, and photos are accurate and I have permission to use them.</Text></Pressable>
    <Button title="Looks good. Set my budget" disabled={busy || !confirmed || !draft?.channels.every(c => copy.some(a => a.channel === c))} onPress={() => void next()} />
  </WorkspaceScreen>;
}
