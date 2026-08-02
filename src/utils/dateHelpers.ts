import type { BillingCycle } from '@/types';

export function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + n);
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return d;
}

export function addYears(date: Date, n: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + n);
  return d;
}

export function addWeeks(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n * 7);
  return d;
}

export function addCycle(date: Date, cycle: BillingCycle, count = 1): Date {
  switch (cycle) {
    case 'weekly':
      return addWeeks(date, count);
    case 'monthly':
      return addMonths(date, count);
    case 'yearly':
      return addYears(date, count);
  }
}

export function computeNextRenewal(startDate: string, cycle: BillingCycle, today: Date = new Date()): string {
  const start = new Date(startDate);
  let next = addCycle(start, cycle, 1);
  while (next.getTime() <= today.getTime()) {
    next = addCycle(next, cycle, 1);
  }
  return next.toISOString();
}

export function daysUntil(iso: string, today: Date = new Date()): number {
  const target = new Date(iso);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((targetDay.getTime() - t.getTime()) / 86_400_000);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelative(iso: string, today: Date = new Date()): string {
  const days = daysUntil(iso, today);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 7) return `in ${days} days`;
  if (days < 30) return `in ${Math.round(days / 7)} wk`;
  return `in ${Math.round(days / 30)} mo`;
}

export function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
