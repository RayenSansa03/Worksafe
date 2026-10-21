import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { BadgeMedal, Button, Card, Screen, Text, TrophyIllustration } from '@/components';
import { BADGES } from '@/gamification/badges';
import { sessionPraise } from '@/gamification/motivation';
import { useProgress } from '@/store/progress';
import { motion, spacing } from '@/theme';
import { fmt } from '@/utils/format';

function formatDuration(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

/** End-of-session summary with estimated calories and newly unlocked badges. */
export default function Summary() {
  const summary = useProgress((s) => s.lastSummary);
  const newIds = useProgress((s) => s.lastNewBadges);
  const newBadges = BADGES.filter((b) => newIds.includes(b.id));

  useEffect(() => {
    if (newIds.length > 0) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newIds.length]);

  if (!summary) {
    return (
      <Screen title="Résumé">
        <Card>
          <Text variant="callout" tone="secondary">
            Aucune séance à résumer.
          </Text>
        </Card>
        <Button label="Fermer" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.hero}>
        <TrophyIllustration size={170} />
        <Text variant="largeTitle" style={styles.center} accessibilityRole="header">
          Séance terminée
        </Text>
        <Text variant="callout" tone="secondary" style={styles.center}>
          {sessionPraise(summary.regularity, summary.durationS)}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(motion.base)}>
        <Card>
          <View style={styles.grid}>
            <Tile label="Durée" value={formatDuration(summary.durationS)} />
            <Tile label="Calories (estim.)" value={`${fmt(summary.kcal)} kcal`} />
            <Tile label="Foulées" value={fmt(summary.strides) ?? '0'} />
            <Tile label="Distance (estim.)" value={`${fmt(summary.distanceKm, 2)} km`} />
            <Tile label="Cadence moyenne" value={summary.cadenceAvg === null ? '—' : `${fmt(summary.cadenceAvg)} /min`} />
            <Tile label="Régularité de cadence" value={summary.regularity === null ? '—' : `${summary.regularity} %`} />
          </View>
          <Text variant="caption" tone="secondary" style={styles.note}>
            Calories et distance sont des estimations (poids, longueur de foulée). La régularité décrit la séance, ce n&apos;est pas un diagnostic.
          </Text>
        </Card>
      </Animated.View>

      {newBadges.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(300).duration(motion.base)}>
          <Card>
            <Text variant="headline" style={styles.badgeTitle}>
              {newBadges.length > 1 ? 'Nouveaux badges' : 'Nouveau badge'}
            </Text>
            <View style={styles.badges}>
              {newBadges.map((b, i) => (
                <Animated.View key={b.id} entering={ZoomIn.delay(450 + i * 150).springify().damping(12)} style={styles.badge}>
                  <BadgeMedal icon={b.icon} colors={b.colors} size={72} />
                  <Text variant="callout" style={styles.center}>
                    {b.title}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Card>
        </Animated.View>
      ) : null}

      <Button label="Terminer" onPress={() => router.back()} />
    </Screen>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label} : ${value}`}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <Text variant="headline">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm },
  center: { textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md },
  tile: { width: '50%', gap: 2 },
  note: { marginTop: spacing.md },
  badgeTitle: { marginBottom: spacing.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, justifyContent: 'center' },
  badge: { alignItems: 'center', gap: spacing.xs, width: 96 },
});
