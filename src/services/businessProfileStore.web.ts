import { prepareBusinessProfile, type BusinessProfile } from '@/src/domain/businessProfile';

// Browser preview only. Native builds use SecureStore. No tokens belong here.
const key = 'adora.business-profile.v1';

export async function loadBusinessProfile(): Promise<BusinessProfile | null> {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) as BusinessProfile : null;
}

export async function saveBusinessProfile(profile: BusinessProfile): Promise<void> {
  localStorage.setItem(key, JSON.stringify(prepareBusinessProfile(profile)));
}
