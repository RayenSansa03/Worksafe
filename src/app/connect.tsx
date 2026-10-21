import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { getBleService } from '@/ble/manager';
import type { BleDevice } from '@/ble/types';
import { Button, Card, Pill, Screen, Text } from '@/components';
import { useLive } from '@/store/live';
import { useSettings } from '@/store/settings';
import { MIN_TOUCH, radius, spacing, useTheme } from '@/theme';

/** One expanding ring of the radar animation. */
function Ring({ delay, active }: { delay: number; active: boolean }) {
  const { colors } = useTheme();
  const t = useSharedValue(0);

  useEffect(() => {
    if (active) {
      t.set(withDelay(delay, withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1)));
    } else {
      t.set(0);
    }
  }, [active, delay, t]);

  const style = useAnimatedStyle(() => ({
    opacity: active ? 0.55 * (1 - t.get()) : 0,
    transform: [{ scale: 0.3 + t.get() * 0.9 }],
  }));

  return <Animated.View style={[styles.ring, { borderColor: colors.accent }, style]} />;
}

function SignalBars({ rssi }: { rssi: number | null }) {
  const { colors } = useTheme();
  const level = rssi === null ? 0 : rssi > -60 ? 4 : rssi > -70 ? 3 : rssi > -80 ? 2 : 1;
  return (
    <View style={styles.bars} accessibilityLabel={rssi === null ? 'Signal inconnu' : `Signal ${level} sur 4`} accessible>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{ width: 4, height: 6 + i * 4, borderRadius: 2, backgroundColor: i <= level ? colors.accent : colors.surfaceRaised }}
        />
      ))}
    </View>
  );
}

/** Scan + connect screen (modal). Same flow for the demo and the real device. */
export default function Connect() {
  const { colors } = useTheme();
  const connection = useLive((s) => s.connection);
  const demoMode = useSettings((s) => s.demoMode);
  const lastDevice = useSettings((s) => s.lastDevice);
  const [devices, setDevices] = useState<BleDevice[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const scanning = connection.status === 'scanning';
  const failed = connection.status === 'error';

  const startScanning = useCallback(
    () =>
      getBleService().startScan((d) =>
        setDevices((prev) => (prev.some((p) => p.id === d.id) ? prev.map((p) => (p.id === d.id ? d : p)) : [...prev, d])),
      ),
    [],
  );

  const rescan = () => {
    setDevices([]);
    void startScanning();
  };

  useEffect(() => {
    void startScanning();
    return () => getBleService().stopScan();
  }, [startScanning]);

  const connect = async (device: BleDevice) => {
    setConnectingId(device.id);
    void Haptics.selectionAsync();
    try {
      // Fresh session: forget the previous one's data and the assumed mute state.
      useLive.getState().reset();
      await getBleService().connect(device.id);
      if (!demoMode) useSettings.getState().setLastDevice({ id: device.id, name: device.name });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      // The service already published the error in the connection state.
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setConnectingId(null);
    }
  };

  const blocked = failed && /bloquée/i.test(connection.message ?? '');

  return (
    <Screen title="Connexion" subtitle={demoMode ? 'Mode démo : appareils simulés' : 'Allumez la genouillère, puis choisissez-la'}>
      <View style={styles.radar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Ring delay={0} active={scanning} />
        <Ring delay={800} active={scanning} />
        <Ring delay={1600} active={scanning} />
        <View style={[styles.core, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="bluetooth" size={36} color={colors.accent} />
        </View>
      </View>

      <Text variant="callout" tone="secondary" style={styles.center} accessibilityLiveRegion="polite">
        {scanning
          ? 'Recherche en cours…'
          : connection.status === 'connecting'
            ? 'Connexion…'
            : devices.length === 0 && !failed
              ? 'Aucun appareil trouvé'
              : ' '}
      </Text>

      {failed ? (
        <Card>
          <Text variant="headline">Connexion impossible</Text>
          <Text variant="callout" tone="secondary" style={styles.errorText}>
            {connection.message}
          </Text>
          {blocked ? <Button label="Ouvrir les réglages" variant="secondary" onPress={() => void Linking.openSettings()} /> : null}
        </Card>
      ) : null}

      {devices.map((d) => (
        <Pressable
          key={d.id}
          accessibilityRole="button"
          accessibilityLabel={`Connecter ${d.name}`}
          disabled={connectingId !== null}
          onPress={() => void connect(d)}
        >
          <Card style={styles.device}>
            <Ionicons name="hardware-chip-outline" size={28} color={colors.accent} />
            <View style={styles.flex}>
              <Text variant="headline">{d.name}</Text>
              {lastDevice?.id === d.id ? <Pill label="Dernier appareil" /> : null}
            </View>
            <SignalBars rssi={d.rssi} />
            <Ionicons name={connectingId === d.id ? 'sync' : 'chevron-forward'} size={20} color={colors.textSecondary} />
          </Card>
        </Pressable>
      ))}

      {!scanning && devices.length === 0 && !failed ? (
        <Card>
          <Text variant="callout" tone="secondary">
            Vérifiez que la genouillère est allumée (LED Bluetooth clignotante) et proche du téléphone, puis relancez la recherche.
          </Text>
        </Card>
      ) : null}

      <Button label={scanning ? 'Recherche…' : 'Relancer la recherche'} variant="secondary" onPress={rescan} disabled={scanning || connectingId !== null} />
      <Button label="Fermer" variant="plain" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  radar: { height: 200, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 2 },
  core: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center', minHeight: 20 },
  errorText: { marginVertical: spacing.sm },
  device: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: MIN_TOUCH + 20, borderRadius: radius.lg },
  flex: { flex: 1, gap: spacing.xs },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
});
