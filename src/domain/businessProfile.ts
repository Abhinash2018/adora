export type BusinessGoal = 'bookings' | 'calls' | 'messages';
export type BusinessProfile = {
  name: string; location: string; destination: string; description: string;
  // Optional so older drafts retain their original website requirement.
  noWebsite?: boolean;
  goal?: BusinessGoal;
};

export type FieldErrors = Partial<Record<keyof BusinessProfile, string>>;

export function validateBusinessProfile(profile: BusinessProfile): FieldErrors {
  const errors: FieldErrors = {};
  if (!profile.name.trim()) errors.name = 'Enter your business name.';
  if (!profile.location.trim()) errors.location = 'Enter your city or service area.';
  if (!profile.noWebsite) {
    if (!profile.destination.trim()) errors.destination = 'Add a website or booking link.';
    else if (!isWebsite(profile.destination.trim())) errors.destination = 'Enter a valid website or booking link.';
  }
  if (!profile.description.trim()) errors.description = 'Tell us a little about your business.';
  return errors;
}

function isWebsite(value: string): boolean {
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.') && !/\s/.test(value);
  } catch {
    return false;
  }
}

export function prepareBusinessProfile(profile: BusinessProfile): BusinessProfile {
  return { ...profile, destination: profile.noWebsite ? '' : profile.destination.trim() };
}

export const emptyBusinessProfile: BusinessProfile = { name: '', location: '', destination: '', description: '' };
