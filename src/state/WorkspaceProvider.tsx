import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { supabase } from '@/src/auth/client';
import { emptyWorkspace, Workspace } from '@/src/domain/campaign';

type WorkspaceState = { data: Workspace; loading: boolean; error: string; retry: () => void; update: (change: (previous: Workspace) => Workspace) => Promise<Workspace> };
const Context = createContext<WorkspaceState | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const auth = useAuth(); const owner = auth.session?.user.id ?? (auth.demo ? 'demo' : null);
  return <WorkspaceSession key={owner ?? 'signed-out'} owner={owner}>{children}</WorkspaceSession>;
}
function WorkspaceSession({ children, owner }: { children: ReactNode; owner: string | null }) {
  const [data, setData] = useState<Workspace>(emptyWorkspace);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const current = useRef<Workspace>(emptyWorkspace); const queue = useRef<Promise<unknown>>(Promise.resolve());
  const activeOwner = useRef(owner);
  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true); setError('');
    try {
      let next = emptyWorkspace;
      if (owner === 'demo') { const raw = await AsyncStorage.getItem('adora.workspace.demo.v1'); if (raw) next = JSON.parse(raw); }
      else if (owner && supabase) {
        const { data: row, error: readError } = await supabase.from('workspaces').select('data').eq('owner_id', owner).maybeSingle();
        if (readError) throw readError; if (row) next = row.data as Workspace;
      }
      if (activeOwner.current === owner) { current.current = next; setData(next); }
    } catch { if (activeOwner.current === owner) { current.current = emptyWorkspace; setData(emptyWorkspace); setError('Could not load your saved workspace. Check your connection and try again.'); } }
    finally { if (activeOwner.current === owner) setLoading(false); }
  }, [owner]);
  // Loading is an external storage synchronization; the initial loading flag prevents stale content.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { activeOwner.current = owner; void load(); return () => { activeOwner.current = null; }; }, [load, owner]);
  const update = useCallback((change: (previous: Workspace) => Workspace): Promise<Workspace> => {
    const operation = queue.current.catch(() => {}).then(async () => {
      if (!owner || activeOwner.current !== owner) throw new Error('Your session changed. Please reopen the screen.');
      const next = change(current.current);
      if (owner === 'demo') await AsyncStorage.setItem('adora.workspace.demo.v1', JSON.stringify(next));
      else {
        if (!supabase) throw new Error('The backend is not configured.');
        const { error: writeError } = await supabase.from('workspaces').upsert({ owner_id: owner, data: next });
        if (writeError) throw new Error('Could not save your progress. Check your connection and retry.');
      }
      if (activeOwner.current !== owner) throw new Error('Your session changed. Please reopen the screen.');
      current.current = next; setData(next); return next;
    });
    queue.current = operation; return operation;
  }, [owner]);
  return <Context.Provider value={{ data, loading, error, retry: () => { void load(); }, update }}>{children}</Context.Provider>;
}
export function useWorkspace() { const ctx = useContext(Context); if (!ctx) throw new Error('WorkspaceProvider required'); return ctx; }
