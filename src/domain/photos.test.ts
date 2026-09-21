import { validatePhoto } from './photos';
it('accepts supported small images and rejects invalid or oversized uploads', () => {
  expect(validatePhoto('image/jpeg', 4000)).toBeNull(); expect(validatePhoto('image/svg+xml', 400)).toBeTruthy(); expect(validatePhoto('image/png', 6 * 1024 * 1024)).toBeTruthy(); expect(validatePhoto('image/jpeg', 0)).toBeTruthy();
});
