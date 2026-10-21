import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';
import { Text } from './Text';

type StepperProps = {
  label: string;
  /** Formatted current value, e.g. "70 kg". */
  display: string;
  onDecrement: () => void;
  onIncrement: () => void;
  description?: string;
};

/** Labelled -/+ control (44 pt targets). */
export function Stepper({ label, display, onDecrement, onIncrement, description }: StepperProps) {
  const { colors } = useTheme();
  const press = (fn: () => void) => () => {
    void Haptics.selectionAsync();
    fn();
  };

  return (
    <View style={styles.row} accessible accessibilityRole="adjustable" accessibilityLabel={`${label} : ${display}`}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => (e.nativeEvent.actionName === 'increment' ? onIncrement() : onDecrement())}>
      <View style={styles.texts}>
        <Text variant="body">{label}</Text>
        {description ? (
          <Text variant="caption" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.control, { backgroundColor: colors.surfaceRaised }]}>
        <Pressable accessibilityElementsHidden onPress={press(onDecrement)} style={styles.btn} hitSlop={4}>
          <Ionicons name="remove" size={20} color={colors.accent} />
        </Pressable>
        <Text variant="headline" style={styles.value}>
          {display}
        </Text>
        <Pressable accessibilityElementsHidden onPress={press(onIncrement)} style={styles.btn} hitSlop={4}>
          <Ionicons name="add" size={20} color={colors.accent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: MIN_TOUCH + 12, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  texts: { flex: 1, gap: 2 },
  control: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill },
  btn: { width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 64, textAlign: 'center' },
});
