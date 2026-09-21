import { prepareBusinessProfile, type BusinessProfile } from '@/src/domain/businessProfile';
import { profileOwner, loadCloudProfile, saveCloudProfile } from './profileCloud';

// Browser preview only. Native builds use SecureStore. No tokens belong here.
const key = 'adora.business-profile.v1';

export async function loadBusinessProfile(): Promise<BusinessProfile | null> {
  const owner = await profileOwner(); if (owner) return loadCloudProfile(owner);
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) as BusinessProfile : null;
}

export async function saveBusinessProfile(profile: BusinessProfile): Promise<void> {
  const owner = await profileOwner(); if (owner) return saveCloudProfile(owner, profile);
  localStorage.setItem(key, JSON.stringify(prepareBusinessProfile(profile)));
}
