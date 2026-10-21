import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { CHART_WINDOW_MS } from '@/constants/disclaimers';
import type { SeriesPoint } from '@/store/live';
import { radius, spacing, useTheme } from '@/theme';
import { Text } from './Text';

const ANGLE_MIN = -20;
const ANGLE_MAX = 150;
const SHOCK_MAX = 10; // g
/** Samples further apart than this break the line (data gap). */
const GAP_MS = 2500;

type LiveChartProps = {
  series: SeriesPoint[];
  /** Reference "now" (ms). The window ends here, so old data slides left. */
  now: number;
  height?: number;
  /** Window length; defaults to the last 60 s. */
  windowMs?: number;
};

/**
 * Real-time chart: knee angle as a line, tibial shocks as bars.
 * Rebuilt only when a frame arrives or the clock ticks (2 Hz), never per frame
 * of animation — cheap enough for a 60-sample window.
 */
export function LiveChart({ series, now, height = 168, windowMs = CHART_WINDOW_MS }: LiveChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.floor(e.nativeEvent.layout.width));

  const paths = useMemo(() => {
    const grid = Skia.PathBuilder.Make();
    const line = Skia.PathBuilder.Make();
    const bars = Skia.PathBuilder.Make();
    if (width === 0) return { grid: grid.build(), line: line.build(), bars: bars.build() };

    const top = 8;
    const bottom = height - 8;
    const plotH = bottom - top;
    const xOf = (t: number) => ((t - (now - windowMs)) / windowMs) * width;
    const yAngle = (a: number) =>
      bottom - ((Math.min(ANGLE_MAX, Math.max(ANGLE_MIN, a)) - ANGLE_MIN) / (ANGLE_MAX - ANGLE_MIN)) * plotH;
    const yShock = (g: number) => bottom - (Math.min(SHOCK_MAX, Math.max(0, g)) / SHOCK_MAX) * plotH;

    for (let i = 0; i <= 3; i++) {
      const y = top + (plotH / 3) * i;
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }

    let prevT: number | null = null;
    for (const p of series) {
      if (p.t < now - windowMs) continue;
      const x = xOf(p.t);
      if (p.angle !== null) {
        if (prevT !== null && p.t - prevT <= GAP_MS) line.lineTo(x, yAngle(p.angle));
        else line.moveTo(x, yAngle(p.angle));
        prevT = p.t;
      } else {
        prevT = null;
      }
      if (p.peak !== null) {
        bars.moveTo(x, bottom);
        bars.lineTo(x, yShock(p.peak));
      }
    }
    return { grid: grid.build(), line: line.build(), bars: bars.build() };
  }, [series, now, width, height, windowMs]);

  return (
    <View style={styles.wrap}>
      <View
        onLayout={onLayout}
        style={[styles.plot, { height, backgroundColor: colors.surfaceRaised }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel="Courbe de l'angle du genou et des chocs tibiaux sur les 60 dernières secondes"
      >
        {width > 0 ? (
          <Canvas style={StyleSheet.absoluteFill}>
            <Path path={paths.grid} style="stroke" strokeWidth={StyleSheet.hairlineWidth} color={colors.separator} />
            <Path path={paths.bars} style="stroke" strokeWidth={3} strokeCap="round" color={colors.textTertiary} />
            <Path path={paths.line} style="stroke" strokeWidth={2.5} strokeJoin="round" strokeCap="round" color={colors.accent} />
          </Canvas>
        ) : null}
      </View>
      <View style={styles.legend}>
        <Legend color={colors.accent} label="Angle (°)" />
        <Legend color={colors.textTertiary} label="Chocs (g)" />
        <View style={styles.flex} />
        <Text variant="caption" tone="tertiary">
          60 s
        </Text>
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  plot: { borderRadius: radius.md, overflow: 'hidden' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  flex: { flex: 1 },
});
