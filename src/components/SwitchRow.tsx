import { StyleSheet, Switch, View } from 'react-native';

import { MIN_TOUCH, spacing, useTheme } from '@/theme';
import { Text } from './Text';

type SwitchRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

/** Settings row with a native switch; the whole row is the touch target. */
export function SwitchRow({ label, description, value, onValueChange }: SwitchRowProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessible accessibilityRole="switch" accessibilityState={{ checked: value }}
      accessibilityLabel={label} accessibilityHint={description} onAccessibilityTap={() => onValueChange(!value)}>
      <View style={styles.texts}>
        <Text variant="body">{label}</Text>
        {description ? (
          <Text variant="caption" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.accent, false: colors.surfaceRaised }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  texts: { flex: 1, gap: 2 },
});
