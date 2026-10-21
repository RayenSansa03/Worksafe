import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BadgeMedal, Card, Screen, Text } from '@/components';
import { BADGES } from '@/gamification/badges';
import { useProgress } from '@/store/progress';
import { MIN_TOUCH, spacing, useTheme } from '@/theme';

/** All badges, unlocked and locked. */
export default function Badges() {
  const { colors } = useTheme();
  const unlocked = useProgress((s) => s.unlocked);
  const count = Object.keys(unlocked).length;

  return (
    <Screen title="Badges" subtitle={`${count} sur ${BADGES.length} débloqués`}>
      <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color={colors.accent} />
      </Pressable>
      <View style={styles.grid}>
        {BADGES.map((b) => {
          const done = b.id in unlocked;
          return (
            <Card key={b.id} style={styles.item}>
              <View accessible accessibilityLabel={`${b.title}. ${b.description} ${done ? 'Débloqué.' : 'Verrouillé.'}`} style={styles.inner}>
                <BadgeMedal icon={b.icon} colors={b.colors} locked={!done} size={72} />
                <Text variant="headline" style={styles.center}>
                  {b.title}
                </Text>
                <Text variant="caption" tone="secondary" style={styles.center}>
                  {done ? `Débloqué le ${new Date(unlocked[b.id]).toLocaleDateString('fr-FR')}` : b.description}
                </Text>
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { position: 'absolute', top: 56, right: spacing.md, width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  item: { width: '47.5%', flexGrow: 1 },
  inner: { alignItems: 'center', gap: spacing.sm },
  center: { textAlign: 'center' },
});
