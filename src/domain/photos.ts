export function validatePhoto(mime: string, size: number): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) return 'Choose a JPEG, PNG or WebP photo.';
  if (!Number.isFinite(size) || size <= 0 || size > 5 * 1024 * 1024) return 'Choose a photo smaller than 5 MB.';
  return null;
}
