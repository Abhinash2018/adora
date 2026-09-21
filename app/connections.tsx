import { useState } from 'react';
import { Linking, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/src/auth/AuthProvider';
import { Connection, Provider, providerFor } from '@/src/domain/campaign';
import { api } from '@/src/services/api';
import { useWorkspace } from '@/src/state/WorkspaceProvider';
import { WorkspaceScreen } from '@/src/state/WorkspaceScreen';
import { Button, Card, Notice, ui } from '@/src/ui';

type Account = { id: string; name: string; currency: string; assets: { id: string; name: string; instagramId?: string }[] };
export default function Connections() {
  const auth = useAuth(); const workspace = useWorkspace(); const router = useRouter();
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [accounts, setAccounts] = useState<Partial<Record<Provider, Account[]>>>({});
  const providers = [...new Set(workspace.data.draft?.channels.map(providerFor) ?? ['google', 'meta'] as Provider[])];
  async function act(action: () => Promise<void>) { setBusy(true); setError(''); setNotice(''); try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { setBusy(false); } }
  async function refresh() { const result = await api<{ connections: Connection[] }>('/connections'); await workspace.update(w => ({ ...w, connections: result.connections })); }
  async function connect(provider: Provider) {
    if (auth.demo) {
      await workspace.update(w => ({ ...w, connections: [...w.connections.filter(c => c.provider !== provider), { provider, status: 'connected', accountId: `demo-${provider}`, accountName: 'Sample advertising account (USD)', assetId: provider === 'meta' ? 'demo-page' : undefined, assetName: provider === 'meta' ? 'Sample business page' : undefined, instagramId: provider === 'meta' ? 'demo-instagram' : undefined, demo: true }] })); return;
    }
    const result = await api<{ url: string }>(`/providers/${provider}/connect`, {});
    await WebBrowser.openBrowserAsync(result.url); setNotice('After authorizing, return here and tap Refresh accounts. Google sign-in does not connect Google Ads.');
  }
  async function choose(provider: Provider, accountId: string, assetId?: string) { await api(`/providers/${provider}/select`, { accountId, assetId }); await refresh(); setAccounts(a => ({ ...a, [provider]: undefined })); }
  return <WorkspaceScreen title="Let’s get connected." back={() => router.back()} step={3} requireDraft={false}>
    <Text style={ui.body}>Your accounts stay yours. No passwords or card details are collected by Adora.</Text>
    {error && <Notice error>{error}</Notice>}{notice && <Notice>{notice}</Notice>}
    {providers.map(provider => {
      const connection = workspace.data.connections.find(c => c.provider === provider);
      return <Card key={provider}><Text style={ui.label}>{provider === 'google' ? 'Google Ads' : 'Facebook + Instagram (Meta)'}</Text>
        <Text style={ui.body}>{connection?.status?.replace('_', ' ') ?? 'Not connected'}{connection?.accountName ? ` · ${connection.accountName}` : ''}</Text>
        {connection?.assetName && <Text style={ui.caption}>{connection.assetName}{connection.instagramId ? ' · Instagram linked' : ' · No linked Instagram account'}</Text>}
        <Button title={auth.demo ? 'Select sample account (demo)' : connection ? 'Reconnect securely' : 'Connect securely'} busy={busy} onPress={() => void act(() => connect(provider))} />
        {!auth.demo && <Button title="Refresh accounts" secondary disabled={busy} onPress={() => void act(async () => { await refresh(); const result = await api<{ accounts: Account[] }>(`/providers/${provider}/accounts`); setAccounts(a => ({ ...a, [provider]: result.accounts })); })} />}
        {accounts[provider]?.length === 0 && <Notice>No eligible accounts found. Complete platform setup, check permissions, then refresh.</Notice>}
        {accounts[provider]?.map(account => <Card key={account.id}><Text style={ui.label}>{account.name} · {account.currency}</Text>
          {provider === 'google' ? <Button title="Use this account" disabled={busy || account.currency !== 'USD'} onPress={() => void act(() => choose(provider, account.id))} /> : account.assets.length ? account.assets.map(asset => <Button key={asset.id} title={`Use ${asset.name}${asset.instagramId ? ' + Instagram' : ''}`} disabled={busy || account.currency !== 'USD'} onPress={() => void act(() => choose(provider, account.id, asset.id))} />) : <Notice>No manageable business pages found.</Notice>}
        </Card>)}
        {connection && <Button title="Disconnect from Adora" secondary disabled={busy} onPress={() => void act(async () => { if (!auth.demo) await api(`/providers/${provider}`, undefined, 'DELETE'); await workspace.update(w => ({ ...w, connections: w.connections.filter(c => c.provider !== provider) })); setNotice('Disconnected. This does not stop existing campaigns. Revoke app permissions in the platform settings if needed.'); })} />}
        <Button title="Set up account or billing on platform" secondary disabled={busy} onPress={() => void act(async () => { await Linking.openURL(provider === 'google' ? 'https://ads.google.com/home/' : 'https://business.facebook.com/'); })} />
      </Card>;
    })}
    <Notice>You may keep planning before connecting. Approval requires the correct advertising account and business assets. Billing and eligibility must be completed with the platform.</Notice>
    {workspace.data.draft ? <Button title="Continue to my photos" disabled={busy} onPress={() => router.push('/photos')} /> : <Button title="Back to my account" onPress={() => router.replace('/account')} />}
  </WorkspaceScreen>;
}
