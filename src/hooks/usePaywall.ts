import { useCallback, useState } from 'react';
import type { SubscriptionTier } from '@/types';
import { FREE_TIER_LIMIT } from '@/utils/constants';

export type PaywallTrigger = 'limit' | 'family' | 'feature' | 'manual';

export interface PaywallState {
  open: boolean;
  trigger: PaywallTrigger | null;
}

export function usePaywall(tier: SubscriptionTier) {
  const [state, setState] = useState<PaywallState>({ open: false, trigger: null });

  const isPaid = tier !== 'free';

  const open = useCallback((trigger: PaywallTrigger = 'manual') => {
    setState({ open: true, trigger });
  }, []);

  const close = useCallback(() => {
    setState({ open: false, trigger: null });
  }, []);

  const guardAdd = useCallback(
    (activeCount: number) => {
      if (!isPaid && activeCount >= FREE_TIER_LIMIT) {
        open('limit');
        return false;
      }
      return true;
    },
    [isPaid, open],
  );

  const guardFamily = useCallback(() => {
    if (!isPaid) {
      open('family');
      return false;
    }
    return true;
  }, [isPaid, open]);

  const guardFeature = useCallback(() => {
    if (!isPaid) {
      open('feature');
      return false;
    }
    return true;
  }, [isPaid, open]);

  return { state, isPaid, open, close, guardAdd, guardFamily, guardFeature };
}
