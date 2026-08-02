import { useCallback, useEffect, useState } from 'react';

const PREFIX = 'subtrack.';

export function useLocalStorage<T>(key: string, initial: T | (() => T)) {
  const fullKey = PREFIX + key;
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initial instanceof Function ? initial() : initial;
    }
    try {
      const raw = window.localStorage.getItem(fullKey);
      if (raw !== null) {
        return JSON.parse(raw) as T;
      }
    } catch {
      // storage unavailable or corrupt — fall back to initial
    }
    return initial instanceof Function ? initial() : initial;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(fullKey, JSON.stringify(value));
    } catch {
      // quota or private mode — best-effort, no-op
    }
  }, [fullKey, value]);

  const reset = useCallback(() => {
    const next = initial instanceof Function ? initial() : initial;
    setValue(next);
  }, [initial]);

  return [value, setValue, reset] as const;
}
