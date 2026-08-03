import type { BillingCycle } from '@/types';

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getNextRenewalDate(currentDateStr: string, cycle: BillingCycle): string {
  const date = new Date(currentDateStr);
  if (isNaN(date.getTime())) return currentDateStr;

  if (cycle === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  } else if (cycle === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else {
    date.setMonth(date.getMonth() + 1);
  }

  return date.toISOString().slice(0, 10);
}