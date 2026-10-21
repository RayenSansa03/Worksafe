import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

import type { AlertLevel } from '@/ble/types';
import { useLive } from '@/store/live';

/**
 * Plays a haptic when the alert level changes (not for the first frame).
 * Level 2 = error pattern, level 1 = warning, back to 0 = light success.
 */
export function useAlertHaptics() {
  const level = useLive((s) => s.latest?.alertLevel ?? null);
  const previous = useRef<AlertLevel | null>(null);

  useEffect(() => {
    const prev = previous.current;
    previous.current = level;
    if (level === null || prev === null || level === prev) return;

    if (level === 2) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (level === 1) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [level]);
}
