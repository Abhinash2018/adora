import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Channel, channelName, editDraft, newDraft, recommendChannels } from '@/src/domain/campaign';
import { loadBusinessProfile } from '@/src/services/businessProfileStore';
import { useWorkspace } from '@/src/state/WorkspaceProvider';
import { WorkspaceScreen } from '@/src/state/WorkspaceScreen';
import { Button, colors, Notice, ui } from '@/src/ui';

export default function Channels() {
  const router = useRouter(); const workspace = useWorkspace();
  const [selected, setSelected] = useState<Channel[] | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const channels = selected ?? workspace.data.draft?.channels ?? [];
  const choose = async () => { try { const business = await loadBusinessProfile(); if (!business) throw new Error('Save your business details first.'); setSelected(recommendChannels(business)); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } };
  const next = async () => {
    setBusy(true); setError('');
    try {
      if (!channels.length) throw new Error('Choose a platform or ask for a recommendation.');
      const business = await loadBusinessProfile(); if (!business?.goal) throw new Error('Save your business and choose a goal first.');
      await workspace.update(old => {
        const draft = old.draft ?? newDraft(Crypto.randomUUID(), business);
        const changed = JSON.stringify(draft.business) !== JSON.stringify(business) || JSON.stringify(draft.channels) !== JSON.stringify(channels);
        return { ...old, draft: changed ? editDraft(draft, { business, channels, copy: [], destination: business.noWebsite ? draft.destination : business.destination }) : draft };
      });
      router.push('/connections');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save your choice.'); } finally { setBusy(false); }
  };
  return <WorkspaceScreen title="Where should your ad appear?" step={3} back={() => router.replace('/goal')} requireDraft={false}>
    <Button title="Recommend a platform" secondary onPress={choose} />
    <Text style={ui.body}>Calls start with Google; bookings and messages start with Facebook and Instagram. You can change the suggestion.</Text>
    {(['google', 'facebook', 'instagram'] as Channel[]).map(channel => <Pressable key={channel} accessibilityRole="checkbox" accessibilityState={{ checked: channels.includes(channel) }} onPress={() => setSelected(channels.includes(channel) ? channels.filter(c => c !== channel) : [...channels, channel])} style={[ui.card, channels.includes(channel) && { borderColor: colors.ink, backgroundColor: colors.green }]}><Text style={ui.label}>{channelName(channel)}{channels.includes(channel) ? '  ✓' : ''}</Text></Pressable>)}
    {!!error && <Notice error>{error}</Notice>}<Button title="Connect my accounts" onPress={next} busy={busy} />
  </WorkspaceScreen>;
}
