import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { getBleService } from '@/ble/manager';
import { Button, Card, KneeIllustration, ProgressRing, Screen, Text } from '@/components';
import { useLive } from '@/store/live';
import { spacing } from '@/theme';
import { fmt } from '@/utils/format';

/** Seconds to get in position before "C" is sent. */
const PREPARE_S = 3;
/** The board is busy for ~2.2 s after "C"; hold still a little longer. */
const HOLD_S = 3;

type Phase = 'intro' | 'prepare' | 'hold' | 'done' | 'failed';

/**
 * Calibration: straight leg, standing still. After the countdown the app
 * sends "C"; the board measures for ~2 s and resets strides / level, then
 * frames resume. We confirm when a fresh frame arrives.
 */
export default function Calibration() {
  const connected = useLive((s) => s.connection.status === 'connected');
  const [phase, setPhase] = useState<Phase>('intro');
  const [count, setCount] = useState(PREPARE_S);
  const [error, setError] = useState<string | null>(null);
  const [angle, setAngle] = useState<number | null>(null);
  const sentAt = useRef(0);

  // Countdown driver.
  useEffect(() => {
    if (phase !== 'prepare' && phase !== 'hold') return;
    const id = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Transitions when the counter reaches zero.
  useEffect(() => {
    if (count > 0) return;
    if (phase === 'prepare') {
      void (async () => {
        try {
          await getBleService().sendCommand('C');
          sentAt.current = Date.now();
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setCount(HOLD_S);
          setPhase('hold');
        } catch (e) {
          setError(e instanceof Error ? e.message : "La commande n'a pas pu être envoyée.");
          setPhase('failed');
        }
      })();
    } else if (phase === 'hold') {
      const latest = useLive.getState().latest;
      if (latest && latest.receivedAt >= sentAt.current + 1500) {
        // A frame after the calibration window: the board is back, with the new reference.
        useLive.getState().resetStats();
        setAngle(latest.kneeAngle);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhase('done');
      } else {
        setError('Aucune mesure reçue après la calibration. Vérifiez la connexion et réessayez.');
        setPhase('failed');
      }
    }
  }, [count, phase]);

  const begin = () => {
    setError(null);
    setCount(PREPARE_S);
    setPhase('prepare');
    void Haptics.selectionAsync();
  };

  return (
    <Screen title="Calibration" subtitle="À faire avant chaque séance">
      <Card style={styles.card}>
        <KneeIllustration size={200} angle={0} />

        {phase === 'intro' || phase === 'failed' ? (
          <>
            <Text variant="title" style={styles.center}>
              Jambe tendue, ne bougez pas
            </Text>
            <Text variant="callout" tone="secondary" style={styles.center}>
              Tenez-vous debout, jambe tendue et immobile pendant environ 2 secondes. La genouillère enregistre alors sa position de référence.
            </Text>
            {phase === 'failed' ? (
              <Text variant="callout" style={styles.center} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}
          </>
        ) : null}

        {phase === 'prepare' || phase === 'hold' ? (
          <View style={styles.ring}>
            <ProgressRing
              progress={phase === 'prepare' ? 1 - count / PREPARE_S : 1 - count / HOLD_S}
              size={140}
              label={String(Math.max(count, 0))}
              sublabel={phase === 'prepare' ? 'Mettez-vous en position' : 'Ne bougez pas'}
              accessibilityLabel={phase === 'prepare' ? `Mettez-vous en position, ${count}` : `Ne bougez pas, ${count}`}
            />
          </View>
        ) : null}

        {phase === 'done' ? (
          <>
            <Text variant="title" style={styles.center}>
              Calibration terminée
            </Text>
            <Text variant="callout" tone="secondary" style={styles.center}>
              Position de référence enregistrée.{angle !== null ? ` Angle mesuré : ${fmt(angle, 1)}°.` : ''} Les foulées et le niveau d&apos;alerte repartent de zéro.
            </Text>
          </>
        ) : null}
      </Card>

      {!connected && phase !== 'done' ? (
        <Card>
          <Text variant="callout" tone="secondary">
            Connectez d&apos;abord la genouillère pour lancer la calibration.
          </Text>
        </Card>
      ) : null}

      {phase === 'intro' || phase === 'failed' ? (
        <Button label={phase === 'failed' ? 'Réessayer' : 'Lancer la calibration'} onPress={begin} disabled={!connected} hint="Compte à rebours de 3 secondes avant l'envoi" />
      ) : null}
      <Button label={phase === 'done' ? 'Terminer' : 'Fermer'} variant={phase === 'done' ? 'primary' : 'plain'} onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  center: { textAlign: 'center' },
  ring: { marginVertical: spacing.md },
});
