import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { getBleService } from '@/ble/manager';
import { isSingleSensor } from '@/ble/types';
import {
  AlertBanner,
  Button,
  Card,
  Collapsible,
  Gauge,
  KneeIllustration,
  LiveChart,
  MetricCard,
  Pill,
  Screen,
  Text,
  type BannerState,
} from '@/components';
import { finishLiveSession } from '@/gamification/finish';
import { estimateKcal, distanceKm } from '@/gamification/summary';
import { aiClassLabel, batteryPercent, decodeFlags } from '@/constants/flags';
import { useAlertHaptics } from '@/hooks/useAlertHaptics';
import { useStaleness } from '@/hooks/useStaleness';
import { useLive } from '@/store/live';
import { useSettings } from '@/store/settings';
import { motion, spacing, useTheme } from '@/theme';
import { fmt, fmtSigned } from '@/utils/format';

const FUSION_LABELS = ['Normal', 'Alerte avec type', 'Alerte sans type'] as const;

/** Staggered entrance, played once when the live view first appears. */
function Reveal({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(motion.base)}>{children}</Animated.View>
  );
}

/** Live session: the main screen. */
export default function LiveSession() {
  useAlertHaptics();

  const connection = useLive((s) => s.connection);
  const latest = useLive((s) => s.latest);
  const series = useLive((s) => s.series);
  const buzzerMuted = useLive((s) => s.buzzerMuted);
  const demoMode = useSettings((s) => s.demoMode);
  const weightKg = useSettings((s) => s.weightKg);
  const strideLengthM = useSettings((s) => s.strideLengthM);
  const alertEvents = useLive((s) => s.alertEvents);
  const startedAt = useLive((s) => s.startedAt);
  const peakMax = useLive((s) => s.peakMax);
  const cadenceAvg = useLive((s) => (s.cadenceCount > 0 ? s.cadenceSum / s.cadenceCount : null));
  const { colors } = useTheme();
  const { now, ageMs, fresh } = useStaleness();
  const [busy, setBusy] = useState<'connect' | 'buzzer' | null>(null);

  const connected = connection.status === 'connected';
  const connecting = connection.status === 'connecting' || busy === 'connect';
  const hasSession = connected || latest !== null;

  let banner: BannerState;
  if (!connected && latest === null) banner = { kind: 'disconnected' };
  else if (!fresh) banner = { kind: 'stale', seconds: ageMs === null ? null : Math.floor(ageMs / 1000) };
  else banner = { kind: 'level', level: latest?.alertLevel ?? 0 };

  const level = fresh ? latest?.alertLevel ?? 0 : 0;
  const singleSensor = fresh && isSingleSensor(latest);
  // The ambient glow follows the alert level (the one place colour means alert).
  const tint = !fresh ? undefined : [colors.alertOk, colors.alertWarn, colors.alertDanger][level];
  const elapsed = startedAt === null ? null : Math.max(0, Math.floor(((fresh ? now : latest?.receivedAt ?? now) - startedAt) / 1000));

  // Real device: scan screen. Demo: connect straight to the simulator.
  const start = async () => {
    if (!demoMode) {
      router.push('/connect');
      return;
    }
    setBusy('connect');
    useLive.getState().reset();
    try {
      await getBleService().connect('demo-0001');
    } catch (e) {
      Alert.alert('Connexion impossible', e instanceof Error ? e.message : 'Réessayez.');
    } finally {
      setBusy(null);
    }
  };

  const stop = async () => {
    // Build the summary from the live data first: disconnecting keeps it, but be explicit.
    const summary = finishLiveSession();
    await getBleService().disconnect();
    if (summary) router.push('/summary');
  };

  const flagLabels = fresh ? decodeFlags(latest?.flags ?? null) : [];
  const batteryPct = fresh ? batteryPercent(latest?.battery ?? null) : null;
  const aiAvailable = latest !== null && (latest.anomalyScore !== null || latest.fusionState !== null);
  const kcal = estimateKcal(weightKg, distanceKm(latest?.strides ?? 0, strideLengthM));

  // "M" TOGGLES the mute on the board, so the button acts as a toggle too.
  const toggleBuzzer = async () => {
    setBusy('buzzer');
    try {
      await getBleService().sendCommand('M');
      useLive.getState().setBuzzerMuted(!buzzerMuted);
    } catch (e) {
      Alert.alert('Commande non envoyée', e instanceof Error ? e.message : 'Réessayez.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen title="Séance" bottomInset={96} tint={tint}>
      <View style={styles.pills}>
        <Pill
          label={connected ? `Connecté · ${connection.device?.name ?? 'WorkSafe'}` : 'Non connecté'}
          tone={connected ? 'accent' : 'neutral'}
        />
        {demoMode ? <Pill label="Mode démo" /> : null}
        {batteryPct !== null ? <Pill label={`Batterie ${batteryPct} %`} /> : null}
      </View>
      {!connected && connection.message ? (
        <Text variant="callout" tone="secondary" accessibilityRole="alert">
          {connection.message}
        </Text>
      ) : null}

      <AlertBanner state={banner} />

      {!hasSession ? (
        <Card style={styles.empty}>
          <KneeIllustration size={176} />
          <Text variant="title" style={styles.center}>
            Prêt à suivre votre course
          </Text>
          <Text variant="callout" tone="secondary" style={styles.center}>
            {demoMode
              ? 'Le mode démo simule une genouillère : aucune connexion nécessaire.'
              : 'Allumez la genouillère puis lancez la connexion Bluetooth.'}
          </Text>
          <Button
            label={demoMode ? 'Lancer la démo' : 'Connecter la genouillère'}
            onPress={start}
            loading={connecting}
            style={styles.fullWidth}
          />
          <Button
            label="Guide d'installation des capteurs"
            variant="plain"
            onPress={() => router.push('/guide')}
            style={styles.fullWidth}
          />
        </Card>
      ) : (
        <>
          <Reveal index={0}>
            <Card>
              <Gauge value={latest?.kneeAngle ?? null} stale={!fresh} />
              {singleSensor ? (
                <View style={styles.badge}>
                  <Pill label="Mode 1 capteur" tone="accent" />
                  <Text variant="caption" tone="secondary" style={styles.center}>
                    Capteur cuisse absent : l&apos;angle affiché est l&apos;inclinaison du tibia, pas l&apos;angle du genou.
                  </Text>
                </View>
              ) : null}
            </Card>
          </Reveal>

          <Reveal index={1}>
            <View style={styles.row}>
              <MetricCard label="Cadence" value={fmt(latest?.cadence)} unit="foulées/min" stale={!fresh} />
              <MetricCard label="Foulées" value={fmt(latest?.strides)} stale={!fresh} />
            </View>
          </Reveal>
          <Reveal index={2}>
            <View style={styles.row}>
              <MetricCard label="Choc tibial" value={fmt(latest?.peakG, 1)} unit="g" stale={!fresh} />
              <MetricCard
                label="Température"
                value={fmt(latest?.temperature, 1)}
                unit="°C"
                detail={latest?.tempDelta != null ? `Écart ${fmtSigned(latest.tempDelta)} °C` : null}
                stale={!fresh}
              />
            </View>
          </Reveal>

          {flagLabels.length > 0 ? (
            <Reveal index={2}>
              <Card>
                <Text variant="headline" style={styles.chartTitle}>
                  Indicateurs déclenchés
                </Text>
                {flagLabels.map((l) => (
                  <Text key={l} variant="callout" tone="secondary">
                    • {l}
                  </Text>
                ))}
              </Card>
            </Reveal>
          ) : null}

          <Reveal index={3}>
            <Card>
              <View style={styles.stats}>
                <Stat label="Durée" value={elapsed === null ? null : formatDuration(elapsed)} />
                <Stat label="Calories (estim.)" value={fmt(kcal)} unit="kcal" />
              </View>
              <View style={[styles.stats, styles.statsSecond]}>
                <Stat label="Cadence moy." value={fmt(cadenceAvg)} unit="/min" />
                <Stat label="Choc max" value={fmt(peakMax, 1)} unit="g" />
              </View>
            </Card>
          </Reveal>

          <Reveal index={3}>
            <Card>
              <Text variant="headline" style={styles.chartTitle}>
                60 dernières secondes
              </Text>
              <LiveChart series={series} now={now} />
            </Card>
          </Reveal>

          <Reveal index={4}>
            <View style={styles.actions}>
              <Button
                label={buzzerMuted ? 'Réactiver le buzzer' : 'Couper le buzzer'}
                hint="Envoie la commande M à la genouillère, qui bascule le buzzer"
                variant={level === 2 && !buzzerMuted ? 'primary' : 'secondary'}
                disabled={!connected}
                loading={busy === 'buzzer'}
                onPress={toggleBuzzer}
              />
              <Button label="Calibrer" variant="secondary" disabled={!connected} onPress={() => router.push('/calibration')} />
              <Button
                label={connected ? 'Arrêter la séance' : 'Reprendre la connexion'}
                variant="plain"
                onPress={connected ? stop : start}
                loading={connecting}
              />
            </View>
          </Reveal>

          <Reveal index={5}>
            <Collapsible
              title="Journal d'alertes"
              subtitle={alertEvents.length === 0 ? 'Aucun changement de niveau' : `${alertEvents.length} changement(s) de niveau`}
            >
              {alertEvents.length === 0 ? (
                <Text variant="callout" tone="secondary">
                  Les changements de niveau apparaîtront ici avec leur heure.
                </Text>
              ) : (
                [...alertEvents].reverse().slice(0, 20).map((e) => (
                  <View key={e.t} style={styles.aiRow}>
                    <Text variant="callout" tone="secondary">
                      {new Date(e.t).toLocaleTimeString('fr-FR')}
                    </Text>
                    <Text variant="callout">
                      {e.from === null ? `Niveau ${e.to}` : `Niveau ${e.from} → ${e.to}`}
                    </Text>
                  </View>
                ))
              )}
            </Collapsible>
          </Reveal>

          <Reveal index={6}>
            <Collapsible title="IA expérimentale (observation)" subtitle="N'influence ni les alertes ni le buzzer">
              <Text variant="caption" tone="secondary">
                Ces valeurs sont expérimentales et non décisionnelles. Elles ne servent pas à déclencher d&apos;alerte.
              </Text>
              {!aiAvailable ? (
                <Text variant="callout" tone="secondary">
                  La carte n&apos;envoie pas les champs d&apos;IA par Bluetooth. Pour les voir, activez AI_PRINT_BLE dans le firmware (voir docs/firmware-patch.md).
                </Text>
              ) : null}
              <AiRow label="Score d'anomalie (A)" value={fresh ? fmt(latest?.anomalyScore, 2) : null} />
              <AiRow label="Type d'anomalie (Y)" value={fresh ? aiClassLabel(latest?.anomalyType ?? null) : null} />
              <AiRow
                label="État de fusion (Z)"
                value={fresh && latest?.fusionState != null ? FUSION_LABELS[latest.fusionState] : null}
              />
              <AiRow label="Temps d'inférence (I)" value={fresh && latest?.inferenceMs != null ? `${fmt(latest.inferenceMs, 1)} ms` : null} />
            </Collapsible>
          </Reveal>
        </>
      )}
    </Screen>
  );
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Stat({ label, value, unit }: { label: string; value: string | null; unit?: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label} : ${value === null ? 'pas de donnée' : `${value} ${unit ?? ''}`}`}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <Text variant="headline">
        {value ?? '—'}
        {value !== null && unit ? ` ${unit}` : ''}
      </Text>
    </View>
  );
}

function AiRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.aiRow} accessible accessibilityLabel={`${label} : ${value ?? 'pas de donnée'}`}>
      <Text variant="callout" tone="secondary">
        {label}
      </Text>
      <Text variant="callout" tone={value === null ? 'tertiary' : 'primary'}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: -spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  badge: { alignItems: 'center', marginTop: spacing.sm, gap: spacing.xs },
  chartTitle: { marginBottom: spacing.sm },
  actions: { gap: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  center: { textAlign: 'center' },
  fullWidth: { alignSelf: 'stretch' },
  stats: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  statsSecond: { marginTop: spacing.md },
  stat: { flex: 1, gap: 2 },
  aiRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.xs },
});
