import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, useTheme } from '@/theme';
import { AmbientBackground } from './AmbientBackground';
import { Text } from './Text';

type ScreenProps = {
  /** Large title shown at the top (HIG large-title style). */
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Extra bottom space, e.g. to clear a floating tab bar. */
  bottomInset?: number;
  /** Tint of the ambient glow (alert colour on the live screen). */
  tint?: string;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Scrollable screen with ambient glow, safe-area handling and a large title. */
export function Screen({ title, subtitle, children, bottomInset = 0, tint, contentStyle }: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AmbientBackground tint={tint} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + bottomInset + spacing.lg },
          contentStyle,
        ]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        {title ? (
          <View style={styles.header}>
            <Text variant="largeTitle" accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? (
              <Text variant="callout" tone="secondary">
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.md, gap: spacing.md },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
});
