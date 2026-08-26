import { useEffect, useState } from 'react';
import { useBills } from '@/context/BillsContext';
import { useSubscriptions } from '@/context/SubscriptionContext';

export function useNotifications() {
  const { bills } = useBills();
  const { subscriptions } = useSubscriptions();
  const [permission, setPermission] = useState<string>(Notification.permission);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, [permission]);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    bills.forEach(bill => {
      if (!bill.paid && new Date(bill.dueDate) <= tomorrow) {
        if (permission === 'granted') {
          new Notification("Bill Reminder", { body: `${bill.name} is due soon!` });
        }
      }
    });

    subscriptions.forEach(sub => {
      // ✅ FIX: Pehle null check karo, phir new Date() call karo
      if (sub.active && sub.nextRenewalDate && new Date(sub.nextRenewalDate) <= tomorrow) {
        if (permission === 'granted') {
          new Notification("Renewal Alert", { body: `${sub.name} is renewing tomorrow.` });
        }
      }
    });
  }, [bills, subscriptions, permission]);

  return permission;
}