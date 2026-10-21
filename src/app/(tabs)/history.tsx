import { Card, Screen, Text } from '@/components';

/** Placeholder until phase (d): SQLite history. */
export default function History() {
  return (
    <Screen title="Historique" bottomInset={96}>
      <Card>
        <Text variant="headline">Aucune séance enregistrée</Text>
        <Text variant="callout" tone="secondary">
          Les séances apparaîtront ici dès que l&apos;enregistrement sera disponible.
        </Text>
      </Card>
    </Screen>
  );
}
