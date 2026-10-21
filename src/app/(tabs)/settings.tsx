import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Stepper, SwitchRow, Text } from '@/components';
import { useSettings, type Appearance } from '@/store/settings';
import { spacing } from '@/theme';

const APPEARANCES: { value: Appearance; label: string }[] = [
  { value: 'dark', label: 'Sombre' },
  { value: 'light', label: 'Clair' },
  { value: 'system', label: 'Système' },
];

/** Phase (a) subset: demo switch and appearance. The rest comes in phase (e). */
export default function Settings() {
  const demoMode = useSettings((s) => s.demoMode);
  const demoSingleSensor = useSettings((s) => s.demoSingleSensor);
  const appearance = useSettings((s) => s.appearance);
  const weightKg = useSettings((s) => s.weightKg);
  const strideLengthM = useSettings((s) => s.strideLengthM);
  const weeklyGoal = useSettings((s) => s.weeklyGoal);
  const set = useSettings.getState();

  return (
    <Screen title="Réglages" bottomInset={96}>
      <Card>
        <SwitchRow
          label="Mode démo"
          description={demoMode ? 'Appareil simulé, aucune genouillère nécessaire.' : 'Appareil réel (Bluetooth).'}
          value={demoMode}
          onValueChange={set.setDemoMode}
        />
        {demoMode ? (
          <SwitchRow
            label="Simuler l'absence du capteur cuisse"
            description="Affiche le badge « Mode 1 capteur »."
            value={demoSingleSensor}
            onValueChange={set.setDemoSingleSensor}
          />
        ) : null}
      </Card>

      <Card>
        <Text variant="headline">Profil et objectifs</Text>
        <Stepper
          label="Poids"
          display={`${weightKg} kg`}
          description="Sert à estimer les calories."
          onDecrement={() => set.setWeightKg(weightKg - 1)}
          onIncrement={() => set.setWeightKg(weightKg + 1)}
        />
        <Stepper
          label="Longueur de foulée"
          display={`${strideLengthM.toFixed(2).replace('.', ',')} m`}
          description="Un appui de la jambe équipée ≈ 2 pas (environ 2 m en course)."
          onDecrement={() => set.setStrideLengthM(strideLengthM - 0.05)}
          onIncrement={() => set.setStrideLengthM(strideLengthM + 0.05)}
        />
        <Stepper
          label="Objectif hebdomadaire"
          display={`${weeklyGoal} séance${weeklyGoal > 1 ? 's' : ''}`}
          onDecrement={() => set.setWeeklyGoal(weeklyGoal - 1)}
          onIncrement={() => set.setWeeklyGoal(weeklyGoal + 1)}
        />
        <Text variant="caption" tone="secondary">
          Les calories et la distance sont des estimations indicatives, pas des mesures.
        </Text>
      </Card>

      <Card>
        <Text variant="headline">Apparence</Text>
        <View style={styles.segment}>
          {APPEARANCES.map((a) => (
            <Button
              key={a.value}
              label={a.label}
              variant={appearance === a.value ? 'primary' : 'secondary'}
              onPress={() => set.setAppearance(a.value)}
              style={styles.segmentItem}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="headline">Aide</Text>
        <Button label="Guide d'installation des capteurs" variant="secondary" onPress={() => router.push('/guide')} style={styles.help} />
        <Button label="Mes badges" variant="secondary" onPress={() => router.push('/badges')} style={styles.help} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  help: { marginTop: spacing.sm },
  segment: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  segmentItem: { flex: 1, paddingHorizontal: spacing.sm },
});
