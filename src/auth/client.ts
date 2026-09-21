import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { sessionStorage } from './sessionStorage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const authConfigured = !!url?.startsWith('https://') && !!key && !url.includes('YOUR_');
export const supabase = authConfigured ? createClient(url!, key!, {
  auth: { storage: sessionStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' },
}) : null;
