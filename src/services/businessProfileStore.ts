import * as SecureStore from 'expo-secure-store';
import type { BusinessProfile } from '@/src/domain/businessProfile';
import { prepareBusinessProfile } from '@/src/domain/businessProfile';

const key = 'adora.business-profile.v1';

export async function loadBusinessProfile(): Promise<BusinessProfile | null> {
  const raw = await SecureStore.getItemAsync(key);
  return raw ? JSON.parse(raw) as BusinessProfile : null;
}

export async function saveBusinessProfile(profile: BusinessProfile): Promise<void> {
  await SecureStore.setItemAsync(key, JSON.stringify(prepareBusinessProfile(profile)));
}
