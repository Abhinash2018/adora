import * as SecureStore from 'expo-secure-store';
import type { BusinessProfile } from '@/src/domain/businessProfile';
import { prepareBusinessProfile } from '@/src/domain/businessProfile';
import { profileOwner, loadCloudProfile, saveCloudProfile } from './profileCloud';

const key = 'adora.business-profile.v1';

export async function loadBusinessProfile(): Promise<BusinessProfile | null> {
  const owner = await profileOwner(); if (owner) return loadCloudProfile(owner);
  const raw = await SecureStore.getItemAsync(key);
  return raw ? JSON.parse(raw) as BusinessProfile : null;
}

export async function saveBusinessProfile(profile: BusinessProfile): Promise<void> {
  const owner = await profileOwner(); if (owner) return saveCloudProfile(owner, profile);
  await SecureStore.setItemAsync(key, JSON.stringify(prepareBusinessProfile(profile)));
}
