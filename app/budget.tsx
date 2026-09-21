import { useRef, useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { allocation, destinationProblem, normalizeDestination } from '@/src/domain/budget';
import { editDraft, money, parseDollars, validateBudget } from '@/src/domain/campaign';
import { useWorkspace } from '@/src/state/WorkspaceProvider';
import { WorkspaceScreen } from '@/src/state/WorkspaceScreen';
import { Button, Card, Field, Notice, ui } from '@/src/ui';
export default function Budget() {
  const router = useRouter(); const workspace = useWorkspace(); const draft = workspace.data.draft;
  const [amount, setAmount] = useState<string | null>(null); const [duration, setDuration] = useState<string | null>(null); const [destination, setDestination] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const lock = useRef(false);
  const value = amount ?? ((draft?.budgetCents ?? 10000) / 100).toFixed(2); const days = duration ?? String(draft?.days ?? 7); const target = destination ?? draft?.destination ?? '';
  const cents = parseDollars(value); const goal = draft?.business.goal;
  async function next() {
    if (lock.current || !draft) return; lock.current = true; setBusy(true); setError('');
    try { const problem = validateBudget(cents, Number(days)) || destinationProblem(target, goal); if (problem) throw new Error(problem);
      if (allocation({ ...draft, budgetCents: cents }).some(a => a.cents < 100)) throw new Error('Plan at least $1 for each advertising provider.');
      await workspace.update(w => { if (!w.draft) throw new Error('Draft is missing.'); return { ...w, draft: editDraft(w.draft, { budgetCents: cents, days: Number(days), destination: normalizeDestination(target, goal), copyConfirmed: w.draft.copyConfirmed }) }; }); router.push('/review');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save. Check your connection and retry.'); } finally { lock.current = false; setBusy(false); }
  }
  return <WorkspaceScreen title="A budget that works for you." step={6} back={() => router.back()}>
    {error && <Notice error>{error}</Notice>}<Field label="Planned advertising amount (USD)" value={value} onChangeText={setAmount} keyboardType="decimal-pad" editable={!busy} />
    {[50, 100, 200].map(n => <Button key={n} title={`$${n}`} secondary={cents !== n * 100} disabled={busy} onPress={() => setAmount(String(n))} />)}
    <Field label="Run for (days, 1–90)" value={days} onChangeText={setDuration} keyboardType="number-pad" editable={!busy} />
    <Field label={goal === 'calls' ? 'Business phone number (with country code)' : goal === 'messages' ? 'Business messaging link' : 'Website or booking link'} value={target} onChangeText={setDestination} autoCapitalize="none" keyboardType={goal === 'calls' ? 'phone-pad' : 'url'} editable={!busy} />
    {draft?.business.noWebsite && <Notice>No website is needed for calls or supported messaging destinations. Booking ads still need a booking link. You can change your goal below.</Notice>}
    <Button title="Change campaign goal" secondary disabled={busy} onPress={() => router.push('/goal')} />
    {draft && Number.isFinite(cents) && allocation({ ...draft, budgetCents: cents }).map(a => <Card key={a.provider}><Text style={ui.label}>{a.provider === 'meta' ? 'Meta (Facebook + Instagram share one allocation)' : 'Google Ads'} · {money(a.cents)}</Text><Text style={ui.body}>{a.provider === 'meta' ? 'Planned lifetime allocation; actual platform minimums and eligibility must be confirmed before a live launch.' : `Total planning allocation. ${Number(days) > 0 ? `${money(Math.floor(a.cents / Number(days)))} per day is an estimate only.` : ''} A daily-budget campaign does not guarantee this exact total cap.`}</Text></Card>)}
    <Notice>Nothing is charged here. Advertising spend and Adora fees are reviewed separately. Live launch requires supported platform spending controls and billing; reporting-based pausing is not a guaranteed cap.</Notice>
    <Button title="Review my promotion" busy={busy} onPress={() => void next()} />
  </WorkspaceScreen>;
}
