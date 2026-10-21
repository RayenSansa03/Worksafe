import { Canvas, Rect, RadialGradient, vec } from '@shopify/react-native-skia';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { useTheme } from '@/theme';

type AmbientBackgroundProps = {
  /** Optional tint (e.g. the alert colour). Defaults to the accent. */
  tint?: string;
};

/**
 * Soft coloured glows behind the content, in the spirit of Apple Fitness.
 * Purely decorative: hidden from accessibility and ignores touches.
 */
export function AmbientBackground({ tint }: AmbientBackgroundProps) {
  const { colors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const main = tint ?? colors.accent;
  const strength = isDark ? '38' : '26'; // hex alpha

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Rect x={0} y={0} width={width} height={height}>
        <RadialGradient c={vec(width * 0.15, 0)} r={width * 1.1} colors={[withAlpha(main, strength), 'transparent']} />
      </Rect>
      <Rect x={0} y={0} width={width} height={height}>
        <RadialGradient
          c={vec(width, height * 0.55)}
          r={width * 0.9}
          colors={[withAlpha(colors.accentLight, isDark ? '1A' : '14'), 'transparent']}
        />
      </Rect>
    </Canvas>
  );
}

/** Appends a 2-digit hex alpha to a #RRGGBB colour. */
function withAlpha(hex: string, alpha: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? `${hex}${alpha}` : hex;
}
