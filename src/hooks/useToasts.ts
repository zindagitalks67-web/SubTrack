import { useCallback, useRef, useState } from 'react';
import type { Toast } from '@/types';
import { uid } from '@/utils/dateHelpers';

export interface ToastApi {
  toasts: Toast[];
  push: (type: Toast['type'], message: string) => void;
  dismiss: (id: string) => void;
}

export function useToasts(): ToastApi {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type: Toast['type'], message: string) => {
      const id = uid();
      setToasts((prev) => [...prev, { id, type, message }]);
      const timer = setTimeout(() => dismiss(id), 3800);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  return { toasts, push, dismiss };
}
