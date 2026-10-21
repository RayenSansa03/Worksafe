import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import type { AlertLevel } from '@/ble/types';
import { motion, radius, spacing, useTheme } from '@/theme';
import { Text } from './Text';

export type BannerState =
  | { kind: 'level'; level: AlertLevel }
  | { kind: 'stale'; seconds: number | null }
  | { kind: 'disconnected' };

const LABELS: Record<AlertLevel, { title: string; detail: string }> = {
  0: { title: 'Niveau 0', detail: 'Mesures dans les seuils configurés' },
  1: { title: 'Niveau 1 — Attention', detail: 'Un indicateur dépasse son seuil' },
  2: { title: 'Niveau 2 — Alerte', detail: 'Seuil de danger atteint, ou plusieurs indicateurs' },
};

/**
 * Alert level banner. Colour is never the only cue: each state has its own
 * icon and wording. Colour tween uses a spring on level change.
 */
export function AlertBanner({ state }: { state: BannerState }) {
  const { colors } = useTheme();
  // 0 ok, 1 warn, 2 danger, 3 neutral (stale / disconnected)
  const target = state.kind === 'level' ? state.level : 3;
  const progress = useSharedValue(target);

  useEffect(() => {
    progress.set(withSpring(target, motion.springSoft));
  }, [target, progress]);

  const animated = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.get(),
      [0, 1, 2, 3],
      [colors.alertOkSoft, colors.alertWarnSoft, colors.alertDangerSoft, colors.surfaceRaised],
    ),
  }));

  let title: string;
  let detail: string;
  let icon: keyof typeof Ionicons.glyphMap;
  let tint: string;

  if (state.kind === 'level') {
    ({ title, detail } = LABELS[state.level]);
    icon = state.level === 0 ? 'checkmark-circle' : state.level === 1 ? 'warning' : 'alert-circle';
    tint = [colors.alertOk, colors.alertWarn, colors.alertDanger][state.level];
  } else if (state.kind === 'stale') {
    title = 'Données périmées';
    detail =
      state.seconds === null
        ? 'Aucune trame reçue pour le moment'
        : `Aucune trame depuis ${state.seconds} s`;
    icon = 'time';
    tint = colors.stale;
  } else {
    title = 'Appareil non connecté';
    detail = 'Connectez la genouillère pour voir les mesures';
    icon = 'bluetooth';
    tint = colors.stale;
  }

  return (
    <Animated.View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${title}. ${detail}`}
      style={[styles.banner, animated]}
    >
      <Ionicons name={icon} size={28} color={tint} />
      <View style={styles.texts}>
        <Text variant="headline">{title}</Text>
        <Text variant="callout" tone="secondary">
          {detail}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 72,
  },
  texts: { flex: 1, gap: 2 },
});
