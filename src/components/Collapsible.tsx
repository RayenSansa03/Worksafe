import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { MIN_TOUCH, motion, spacing, useTheme } from '@/theme';
import { Card } from './Card';
import { Text } from './Text';

type CollapsibleProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

/** Card with a tappable header that expands / collapses its content. */
export function Collapsible({ title, subtitle, children, defaultOpen = false }: CollapsibleProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Animated.View layout={LinearTransition.springify().damping(motion.spring.damping)}>
      <Card padded={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={title}
          onPress={() => setOpen((o) => !o)}
          style={styles.header}
        >
          <View style={styles.texts}>
            <Text variant="headline">{title}</Text>
            {subtitle ? (
              <Text variant="caption" tone="secondary">
                {subtitle}
              </Text>
            ) : null}
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </Pressable>
        {open ? (
          <Animated.View entering={FadeIn.duration(motion.base)} exiting={FadeOut.duration(motion.fast)} style={styles.body}>
            {children}
          </Animated.View>
        ) : null}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: MIN_TOUCH + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  texts: { flex: 1, gap: 2 },
  body: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
});
