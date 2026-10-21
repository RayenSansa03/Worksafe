import { StyleSheet, View } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';
import { Text } from './Text';

type PillProps = {
  label: string;
  /** Neutral (default) or accent. Semantic colours are for alerts only. */
  tone?: 'neutral' | 'accent';
};

/** Small status badge, e.g. "Mode 1 capteur". */
export function Pill({ label, tone = 'neutral' }: PillProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: tone === 'accent' ? colors.accentSoft : colors.surfaceRaised },
      ]}
    >
      <Text variant="caption" tone={tone === 'accent' ? 'accent' : 'secondary'}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
  },
});
