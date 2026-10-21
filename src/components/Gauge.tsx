import { BlurMask, Canvas, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDerivedValue, useSharedValue, withSpring } from 'react-native-reanimated';

import { motion, spacing, useTheme } from '@/theme';
import { Text } from './Text';

/** Displayed range of the knee angle (deg). */
const MIN_DEG = -20;
const MAX_DEG = 150;
/** The arc spans 270 deg, opening at the bottom. */
const START_ANGLE = 135;
const SWEEP = 270;

type GaugeProps = {
  /** Current knee angle, or null when unknown. */
  value: number | null;
  /** True when data is stale: the arc greys out and the value is hidden. */
  stale?: boolean;
  size?: number;
  caption?: string;
};

/**
 * Large circular gauge of the knee angle: gradient arc with a soft glow,
 * spring-animated. Skia draws the arc, React Native draws the text so that
 * Dynamic Type and screen readers keep working.
 */
export function Gauge({ value, stale = false, size = 264, caption = 'Angle du genou' }: GaugeProps) {
  const { colors } = useTheme();
  const stroke = 22;
  const empty = stale || value === null;

  const progress = useSharedValue(0);
  useEffect(() => {
    const ratio = value === null ? 0 : (clamp(value, MIN_DEG, MAX_DEG) - MIN_DEG) / (MAX_DEG - MIN_DEG);
    progress.set(withSpring(empty ? 0 : ratio, motion.springSoft));
  }, [value, empty, progress]);
  const end = useDerivedValue(() => progress.get());

  const arc = useMemo(() => {
    const inset = stroke / 2 + 10;
    return Skia.PathBuilder.Make()
      .addArc(Skia.XYWHRect(inset, inset, size - inset * 2, size - inset * 2), START_ANGLE, SWEEP)
      .build();
  }, [size]);

  const spoken = empty
    ? `${caption} : pas de donnée`
    : `${caption} : ${Math.round(value as number)} degrés`;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={spoken}
      style={{ width: size, height: size, alignSelf: 'center' }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <Path path={arc} style="stroke" strokeWidth={stroke} strokeCap="round" color={colors.surfaceRaised} />
        {empty ? null : (
          <>
            {/* Glow under the arc */}
            <Path path={arc} style="stroke" strokeWidth={stroke} strokeCap="round" start={0} end={end} opacity={0.55}>
              <LinearGradient start={vec(0, size)} end={vec(size, 0)} colors={[colors.accent, colors.accentLight]} />
              <BlurMask blur={14} style="normal" />
            </Path>
            <Path path={arc} style="stroke" strokeWidth={stroke} strokeCap="round" start={0} end={end}>
              <LinearGradient start={vec(0, size)} end={vec(size, 0)} colors={[colors.accent, colors.accentLight]} />
            </Path>
          </>
        )}
      </Canvas>
      <View style={styles.center} pointerEvents="none">
        <Text variant="metric" style={styles.big} tone={empty ? 'tertiary' : 'primary'}>
          {empty ? '—' : `${Math.round(value as number)}°`}
        </Text>
        <Text variant="callout" tone="secondary">
          {caption}
        </Text>
      </View>
    </View>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  big: { fontSize: 64, lineHeight: 70, letterSpacing: -1 },
});
