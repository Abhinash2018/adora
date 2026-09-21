import { supabase } from '@/src/auth/client';
import { BusinessProfile, prepareBusinessProfile } from '@/src/domain/businessProfile';

export async function profileOwner(): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error('Your session expired. Please sign in again.');
  return data.session?.user.id ?? null;
}
export async function loadCloudProfile(owner: string): Promise<BusinessProfile | null> {
  const { data, error } = await supabase!.from('business_profiles').select('data').eq('owner_id', owner).maybeSingle();
  if (error) throw error; return data?.data ?? null;
}
export async function saveCloudProfile(owner: string, profile: BusinessProfile) {
  const { error } = await supabase!.from('business_profiles').upsert({ owner_id: owner, data: prepareBusinessProfile(profile) }); if (error) throw error;
}
