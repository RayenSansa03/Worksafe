import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Button, Card, KneeIllustration, Screen, Text } from '@/components';
import { MIN_TOUCH, motion, radius, spacing, useTheme } from '@/theme';

const STEPS = [
  {
    title: 'Allumez la genouillère',
    body: 'Mettez le boîtier sous tension. La LED Bluetooth se met à clignoter quand il est prêt à se connecter.',
    angle: 10,
    sensors: false,
  },
  {
    title: 'Placez le capteur de cuisse',
    body: 'Fixez le module au-dessus du genou, sur la face avant de la cuisse, câble vers le haut. Le brassard doit être ajusté sans serrer.',
    angle: 10,
    sensors: true,
  },
  {
    title: 'Placez le capteur de tibia',
    body: 'Fixez le second module sous le genou, sur le tibia, dans le même sens que le premier. Les deux modules doivent rester alignés.',
    angle: 25,
    sensors: true,
  },
  {
    title: 'Calibrez, jambe tendue',
    body: "Tenez-vous debout, jambe tendue et immobile pendant environ 2 secondes, puis lancez la calibration depuis l'écran Séance.",
    angle: 0,
    sensors: true,
  },
] as const;

/** Illustrated sensor placement guide (modal route). */
export default function Guide() {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  return (
    <Screen title="Installer les capteurs" subtitle={`Étape ${index + 1} sur ${STEPS.length}`}>
      <Card style={styles.card}>
        <Animated.View key={index} entering={FadeIn.duration(motion.base)} exiting={FadeOut.duration(motion.fast)} style={styles.stage}>
          <KneeIllustration size={220} angle={step.angle} showSensors={step.sensors} />
          <Text variant="title" style={styles.center}>
            {step.title}
          </Text>
          <Text variant="body" tone="secondary" style={styles.center}>
            {step.body}
          </Text>
        </Animated.View>

        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i === index ? colors.accent : colors.surfaceRaised, width: i === index ? 24 : 8 }]}
            />
          ))}
        </View>
      </Card>

      <View style={styles.actions}>
        <Button label={last ? 'Terminer' : 'Étape suivante'} onPress={() => (last ? router.back() : setIndex(index + 1))} />
        {index > 0 ? <Button label="Étape précédente" variant="plain" onPress={() => setIndex(index - 1)} /> : null}
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => router.back()} style={styles.close}>
        <Ionicons name="close" size={22} color={colors.textSecondary} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: spacing.lg },
  stage: { alignItems: 'center', gap: spacing.md, minHeight: 400 },
  center: { textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
  dot: { height: 8, borderRadius: radius.pill },
  actions: { gap: spacing.sm },
  close: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.md,
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
