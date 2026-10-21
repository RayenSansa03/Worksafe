import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import { Card } from './Card';
import { Text } from './Text';

type MetricCardProps = {
  label: string;
  /** Pre-formatted value. `null` renders "—" (no data). */
  value: string | null;
  unit?: string;
  /** Secondary line, e.g. "Écart +1,2 °C". Hidden when stale. */
  detail?: string | null;
  /** True when the last frame is too old: value is replaced by "—". */
  stale?: boolean;
};

/** Compact live metric. Never shows an old value as current. */
export function MetricCard({ label, value, unit, detail, stale = false }: MetricCardProps) {
  const empty = stale || value === null;
  const spoken = empty ? `${label} : pas de donnée` : `${label} : ${value} ${unit ?? ''}`;

  return (
    <Card style={styles.card}>
      <View accessible accessibilityLabel={spoken} style={styles.inner}>
        <Text variant="caption" tone="secondary">
          {label}
        </Text>
        <View style={styles.valueRow}>
          <Text variant="metricSmall" tone={empty ? 'tertiary' : 'primary'}>
            {empty ? '—' : value}
          </Text>
          {unit && !empty ? (
            <Text variant="callout" tone="secondary">
              {unit}
            </Text>
          ) : null}
        </View>
        {detail && !empty ? (
          <Text variant="caption" tone="secondary">
            {detail}
          </Text>
        ) : (
          <Text variant="caption" tone="tertiary"> </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 140 },
  inner: { gap: spacing.xs },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
});
