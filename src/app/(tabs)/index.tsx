import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BADGES } from '@/gamification/badges';
import { greeting, motivationFor, tipOfTheDay } from '@/gamification/motivation';
import {
  BadgeMedal,
  Button,
  Card,
  ProgressRing,
  RunnerIllustration,
  Screen,
  Text,
} from '@/components';
import { sessionsThisWeek, streakFrom, dayKey, useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';
import { motion, spacing, useTheme } from '@/theme';
import { fmt } from '@/utils/format';

function Reveal({ index, children }: { index: number; children: React.ReactNode }) {
  return <Animated.View entering={FadeInDown.delay(index * 70).duration(motion.base)}>{children}</Animated.View>;
}

/** Home: motivation, weekly goal, streak, totals and latest badges. */
export default function Home() {
  const { colors } = useTheme();
  const totals = useProgress((s) => s.totals);
  const sessionTimes = useProgress((s) => s.sessionTimes);
  const unlocked = useProgress((s) => s.unlocked);
  const weeklyGoal = useSettings((s) => s.weeklyGoal);

  const [now] = useState(() => Date.now());
  const week = sessionsThisWeek(sessionTimes, now);
  const streak = streakFrom(sessionTimes.map(dayKey), now);
  const message = motivationFor({
    hour: new Date(now).getHours(),
    streakDays: streak,
    sessionsThisWeek: week,
    weeklyGoal,
    totalSessions: totals.sessions,
  });
  const unlockedCount = Object.keys(unlocked).length;
  // Show unlocked first (newest first), then the next locked ones.
  const preview = [...BADGES]
    .sort((a, b) => (unlocked[b.id] ?? 0) - (unlocked[a.id] ?? 0))
    .slice(0, 5);

  return (
    <Screen title={greeting(new Date(now).getHours())} bottomInset={96}>
      <Reveal index={0}>
        <Card style={styles.hero}>
          <RunnerIllustration size={220} />
          <Text variant="title" style={styles.center}>
            {message.title}
          </Text>
          <Text variant="callout" tone="secondary" style={styles.center}>
            {message.body}
          </Text>
          <Button label="Démarrer une séance" onPress={() => router.navigate('/live')} style={styles.full} />
        </Card>
      </Reveal>

      <Reveal index={1}>
        <View style={styles.row}>
          <Card style={styles.flex}>
            <Text variant="headline">Objectif</Text>
            <View style={styles.ringWrap}>
              <ProgressRing
                progress={week / weeklyGoal}
                size={112}
                label={`${week}/${weeklyGoal}`}
                sublabel="séances"
                accessibilityLabel={`Objectif de la semaine : ${week} séances sur ${weeklyGoal}`}
              />
            </View>
          </Card>
          <Card style={styles.flex}>
            <Text variant="headline">Série</Text>
            <View style={styles.streak} accessible accessibilityLabel={`Série de ${streak} jour${streak > 1 ? 's' : ''}`}>
              <Ionicons name="flame" size={44} color={streak > 0 ? '#FF9F0A' : colors.textTertiary} />
              <Text variant="metricSmall">{streak}</Text>
              <Text variant="caption" tone="secondary">
                jour{streak > 1 ? 's' : ''} d&apos;affilée
              </Text>
            </View>
          </Card>
        </View>
      </Reveal>

      <Reveal index={2}>
        <Card>
          <Text variant="headline" style={styles.cardTitle}>
            Vos totaux
          </Text>
          <View style={styles.totals}>
            <Total label="Séances" value={String(totals.sessions)} />
            <Total label="Foulées" value={fmt(totals.strides) ?? '0'} />
            <Total label="Calories (estim.)" value={`${fmt(totals.kcal) ?? '0'}`} />
          </View>
        </Card>
      </Reveal>

      <Reveal index={3}>
        <Card>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Badges, ${unlockedCount} sur ${BADGES.length} débloqués`}
            onPress={() => router.push('/badges')}
            style={styles.badgeHeader}
          >
            <Text variant="headline">Badges</Text>
            <Text variant="callout" tone="accent">
              {unlockedCount}/{BADGES.length} · Tout voir
            </Text>
          </Pressable>
          <View style={styles.badgeRow}>
            {preview.map((b) => (
              <BadgeMedal key={b.id} icon={b.icon} colors={b.colors} locked={!(b.id in unlocked)} size={56} />
            ))}
          </View>
        </Card>
      </Reveal>

      <Reveal index={4}>
        <Card>
          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={24} color={colors.accent} />
            <View style={styles.flex}>
              <Text variant="headline">Le conseil du jour</Text>
              <Text variant="callout" tone="secondary">
                {tipOfTheDay()}
              </Text>
            </View>
          </View>
        </Card>
      </Reveal>
    </Screen>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.total} accessible accessibilityLabel={`${label} : ${value}`}>
      <Text variant="metricSmall">{value}</Text>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm },
  center: { textAlign: 'center' },
  full: { alignSelf: 'stretch', marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  ringWrap: { alignItems: 'center', marginTop: spacing.md },
  streak: { alignItems: 'center', marginTop: spacing.md, gap: 2 },
  cardTitle: { marginBottom: spacing.md },
  totals: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  total: { flex: 1, gap: 2 },
  badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  tip: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
});
