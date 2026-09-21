import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from './client';

type AuthState = { session: Session | null; demo: boolean; loading: boolean; error: string; startDemo: () => Promise<void>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    Promise.all([AsyncStorage.getItem('adora.demo'), supabase?.auth.getSession()]).then(([flag, result]) => {
      if (!mounted) return;
      if (result?.error) throw result.error;
      setSession(result?.data.session ?? null); setDemo(flag === 'true' && !result?.data.session);
    }).catch(() => { if (mounted) setError('Your session could not be restored. Please sign in again.'); }).finally(() => { if (mounted) setLoading(false); });
    const listener = supabase?.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) { setDemo(false); void AsyncStorage.removeItem('adora.demo'); }
    });
    const app = AppState.addEventListener('change', (state) => {
      if (Platform.OS !== 'web') { if (state === 'active') supabase?.auth.startAutoRefresh(); else supabase?.auth.stopAutoRefresh(); }
    });
    return () => { mounted = false; listener?.data.subscription.unsubscribe(); app.remove(); };
  }, []);
  const startDemo = async () => { await AsyncStorage.setItem('adora.demo', 'true'); setDemo(true); setError(''); };
  const signOut = async () => {
    if (session && supabase) { const result = await supabase.auth.signOut({ scope: 'local' }); if (result.error) throw new Error('Sign-out failed. Please try again.'); }
    await AsyncStorage.removeItem('adora.demo'); setSession(null); setDemo(false);
  };
  return <AuthContext.Provider value={{ session, demo, loading, error, startDemo, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider is required'); return value; }
