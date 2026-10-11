import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { z } from "zod";
import { Button, Card, C, Header, Label, Page } from "../src/ui";
import { useApp } from "../src/store";
const schema = z.object({
  flexion: z.coerce.number().min(30).max(180),
  impact: z.coerce.number().min(0.5).max(20),
  temperature: z.coerce.number().min(20).max(50),
});
export default function Settings() {
  const thresholds = useApp((s) => s.thresholds),
    save = useApp((s) => s.setThreshold);
  const [vals, setVals] = useState({
    flexion: String(thresholds.flexion),
    impact: String(thresholds.impact),
    temperature: String(thresholds.temperature),
  });
  const apply = () => {
    const parsed = schema.safeParse(vals);
    if (!parsed.success) {
      Alert.alert(
        "Valeur invalide",
        "Vérifiez les plages : flexion 30–180°, impact 0,5–20 g, température 20–50 °C.",
      );
      return;
    }
    Object.entries(parsed.data).forEach(([k, v]) =>
      save(k as keyof typeof thresholds, v),
    );
    Alert.alert(
      "Préférences enregistrées",
      "Les prochains dépassements utiliseront ces seuils.",
    );
  };
  return (
    <Page>
      <Text
        onPress={() => router.back()}
        style={{ color: C.blue, fontWeight: "800" }}
      >
        ‹ Profil
      </Text>
      <Header title="Paramètres" sub="Seuils de surveillance" />
      <Card>
        <Text style={{ color: C.muted, lineHeight: 21 }}>
          Ces paramètres personnalisables servent au suivi d'entraînement. Ils
          ne sont pas des limites médicales universelles.
        </Text>
      </Card>
      {(
        [
          ["flexion", "Flexion maximale", "°"],
          ["impact", "Seuil d’impact", "g"],
          ["temperature", "Seuil température", "°C"],
        ] as const
      ).map(([key, name, unit]) => (
        <Card key={key}>
          <Label>{name}</Label>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TextInput
              keyboardType="decimal-pad"
              value={vals[key]}
              onChangeText={(v) => setVals((x) => ({ ...x, [key]: v }))}
              style={{
                flex: 1,
                backgroundColor: "#F5F7FB",
                borderRadius: 10,
                padding: 12,
                fontSize: 17,
                fontWeight: "800",
                color: C.text,
              }}
            />
            <Text style={{ fontWeight: "800", color: C.muted }}>{unit}</Text>
          </View>
          <Text style={{ fontSize: 11, color: C.muted, marginTop: 7 }}>
            Valeur actuelle : {thresholds[key]} {unit}
          </Text>
        </Card>
      ))}
      <Card>
        <Text style={{ fontWeight: "800", color: C.text }}>Unités</Text>
        <Text style={{ color: C.muted, marginTop: 5 }}>
          Angles en degrés · impacts en g · température en degrés Celsius
        </Text>
      </Card>
      <Button title="Enregistrer les seuils" onPress={apply} />
      <Button
        title="Retour au profil"
        secondary
        onPress={() => router.back()}
      />
    </Page>
  );
}
