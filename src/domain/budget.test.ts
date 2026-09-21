import { allocation, destinationProblem, normalizeDestination } from './budget';
it('allocates whole cents without multiplying budget across Meta placements', () => {
  const shares = allocation({ channels: ['google', 'facebook', 'instagram'], budgetCents: 10001 });
  expect(shares).toEqual([{ provider: 'google', cents: 5001 }, { provider: 'meta', cents: 5000 }]); expect(shares.reduce((sum, a) => sum + a.cents, 0)).toBe(10001);
});
it('supports a phone or messaging destination without a website', () => {
  expect(destinationProblem('+1 (512) 555-0100', 'calls')).toBeNull(); expect(normalizeDestination('+1 (512) 555-0100', 'calls')).toBe('+15125550100'); expect(destinationProblem('wa.me/15125550100', 'messages')).toBeNull(); expect(destinationProblem('', 'bookings')).toBeTruthy();
});
it('rejects unsafe destinations and arbitrary websites for messages', () => {
  expect(destinationProblem('javascript:alert(1)', 'bookings')).toBeTruthy(); expect(destinationProblem('https://user:password@example.com', 'bookings')).toBeTruthy(); expect(destinationProblem('example.com', 'messages')).toBeTruthy();
});
