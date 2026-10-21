import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, shadows, spacing, useTheme } from '@/theme';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Frosted-glass surface (blur). Falls back to a solid surface on Android. */
  glass?: boolean;
  padded?: boolean;
};

/** Rounded surface with a light, tinted shadow. */
export function Card({ children, style, glass = false, padded = true }: CardProps) {
  const { colors, isDark } = useTheme();
  const base: ViewStyle = {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    ...shadows.card,
    // Shadows are barely visible on dark; a hairline keeps the card edge.
    borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
    borderColor: colors.separator,
  };

  if (glass && Platform.OS === 'ios') {
    return (
      <View style={[base, { backgroundColor: 'transparent', overflow: 'hidden' }, style]}>
        <BlurView intensity={50} tint={colors.blurTint} style={StyleSheet.absoluteFill} />
        <View style={padded ? styles.padded : undefined}>{children}</View>
      </View>
    );
  }
  return <View style={[base, padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  padded: { padding: spacing.md },
});
