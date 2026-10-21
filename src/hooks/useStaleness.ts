import { useEffect, useState } from 'react';

import { STALE_AFTER_MS } from '@/constants/disclaimers';
import { useLive } from '@/store/live';

/**
 * Tracks how old the last frame is. `fresh` is false when there is no frame or
 * the last one is older than STALE_AFTER_MS: callers must then render "no data"
 * instead of the old value.
 */
export function useStaleness() {
  const lastAt = useLive((s) => s.latest?.receivedAt ?? null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const ageMs = lastAt === null ? null : Math.max(0, now - lastAt);
  const fresh = ageMs !== null && ageMs <= STALE_AFTER_MS;
  return { now, ageMs, fresh };
}
