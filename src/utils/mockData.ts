import type { Subscription, FamilyMember, UserProfile } from '@/types';
import { uid } from './dateHelpers';

export function createMockFamily(): FamilyMember[] {
  const now = Date.now();
  return [
    {
      id: 'fam-alex',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      relationship: 'Partner',
      avatarColor: '#3b82f6',
      createdAt: new Date(now - 86400000 * 90).toISOString(),
    },
    {
      id: 'fam-jamie',
      name: 'Jamie Rivera',
      email: 'jamie.rivera@example.com',
      relationship: 'Child',
      avatarColor: '#22d3ee',
      createdAt: new Date(now - 86400000 * 60).toISOString(),
    },
    {
      id: 'fam-sam',
      name: 'Sam Rivera',
      email: 'sam.rivera@example.com',
      relationship: 'Child',
      avatarColor: '#22c55e',
      createdAt: new Date(now - 86400000 * 30).toISOString(),
    },
  ];
}

export function createMockSubscriptions(): Subscription[] {
  const now = Date.now();
  const isoDaysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

  return [
    {
      id: 'sub-netflix',
      name: 'Netflix Premium',
      category: 'Entertainment',
      cost: 22.99,
      billingCycle: 'monthly',
      startDate: isoDaysAgo(420),
      nextRenewalDate: new Date(now + 3 * 86400000).toISOString(),
      active: true,
      shared: true,
      familyMemberIds: ['fam-alex', 'fam-jamie'],
      priceHistory: [
        {
          id: uid(),
          oldPrice: 19.99,
          newPrice: 22.99,
          changedAt: isoDaysAgo(45),
        },
      ],
      notes: '4K UHD plan shared with family.',
      createdAt: isoDaysAgo(420),
    },
    {
      id: 'sub-spotify',
      name: 'Spotify Family',
      category: 'Music',
      cost: 16.99,
      billingCycle: 'monthly',
      startDate: isoDaysAgo(300),
      nextRenewalDate: new Date(now + 6 * 86400000).toISOString(),
      active: true,
      shared: true,
      familyMemberIds: ['fam-alex', 'fam-jamie', 'fam-sam'],
      priceHistory: [],
      notes: 'Family plan — up to 6 accounts.',
      createdAt: isoDaysAgo(300),
    },
    {
      id: 'sub-icloud',
      name: 'iCloud+ 200GB',
      category: 'Storage',
      cost: 2.99,
      billingCycle: 'monthly',
      startDate: isoDaysAgo(540),
      nextRenewalDate: new Date(now + 1 * 86400000).toISOString(),
      active: true,
      shared: false,
      familyMemberIds: [],
      priceHistory: [],
      notes: 'Photos + device backups.',
      createdAt: isoDaysAgo(540),
    },
    {
      id: 'sub-adobe',
      name: 'Adobe Creative Cloud',
      category: 'Productivity',
      cost: 59.99,
      billingCycle: 'monthly',
      startDate: isoDaysAgo(200),
      nextRenewalDate: new Date(now + 14 * 86400000).toISOString(),
      active: true,
      shared: false,
      familyMemberIds: [],
      priceHistory: [
        {
          id: uid(),
          oldPrice: 54.99,
          newPrice: 59.99,
          changedAt: isoDaysAgo(20),
        },
      ],
      notes: 'All apps plan.',
      createdAt: isoDaysAgo(200),
    },
    {
      id: 'sub-amazon',
      name: 'Amazon Prime',
      category: 'Shopping',
      cost: 139.0,
      billingCycle: 'yearly',
      startDate: isoDaysAgo(360),
      nextRenewalDate: new Date(now + 320 * 86400000).toISOString(),
      active: true,
      shared: true,
      familyMemberIds: ['fam-alex'],
      priceHistory: [],
      notes: 'Annual membership with shipping + video.',
      createdAt: isoDaysAgo(360),
    },
  ];
}

export function createMockProfile(): UserProfile {
  return {
    id: 'user-local',
    name: 'Jordan Rivera',
    email: 'jordan.rivera@example.com',
    tier: 'free',
    reminderDays: 1,
    currency: 'USD',
  };
}
