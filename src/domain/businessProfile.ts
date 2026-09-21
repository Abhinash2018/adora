export type BusinessProfile = { name: string; location: string; destination: string; description: string };

export type FieldErrors = Partial<Record<keyof BusinessProfile, string>>;

export function validateBusinessProfile(profile: BusinessProfile): FieldErrors {
  const errors: FieldErrors = {};
  if (!profile.name.trim()) errors.name = 'Enter your business name.';
  if (!profile.location.trim()) errors.location = 'Enter your city or service area.';
  if (!profile.destination.trim()) errors.destination = 'Add a website or booking link.';
  if (profile.destination.trim() && !/^(https?:\/\/)?[^\s.]+\.[^\s]+/i.test(profile.destination.trim())) errors.destination = 'Enter a valid website or booking link.';
  if (!profile.description.trim()) errors.description = 'Tell us a little about your business.';
  return errors;
}

export const emptyBusinessProfile: BusinessProfile = { name: '', location: '', destination: '', description: '' };
