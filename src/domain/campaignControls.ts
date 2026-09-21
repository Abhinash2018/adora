import { CampaignStatus, Workspace, transition } from './campaign';
export function controlDemo(workspace: Workspace, id: string, status: CampaignStatus): Workspace {
  const current = workspace.campaigns.find(c => c.id === id); if (!current || !current.demo) throw new Error('Only a demo campaign can be simulated.');
  const next = transition(current.status, status);
  return { ...workspace, campaigns: workspace.campaigns.map(c => c.id === id ? { ...c, status: next, message: next === 'completed' ? 'Stopped by you (demo). No real campaign or charge.' : next === 'rejected' ? 'Simulated platform rejection. No real platform reviewed this ad.' : 'Simulated status — no real advertising activity.' } : c) };
}
