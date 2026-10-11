import { router, useLocalSearchParams } from "expo-router";
import { Share2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Button, Card, C, Header, Label, Page, Pill } from "../src/ui";
import { useApp } from "../src/store";
export default function Summary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useApp(
    (s) => s.sessions.find((x) => x.id === id) ?? s.sessions[0],
  );
  const [exporting, setExporting] = useState(false);
  const exportCsv = async () => {
    if (!session) return;
    try {
      setExporting(true);
      const lines = [
        "timestamp,knee_angle_deg,temperature_c,impact_g,step_count",
        ...session.samples.map((m) =>
          [
            m.timestamp,
            m.kneeAngleDeg ?? "",
            m.temperatureCelsius ?? "",
            m.impactG ?? "",
            m.stepCount ?? "",
          ].join(","),
        ),
      ].join("\n");
      const path = `${FileSystem.cacheDirectory}worksafe-session-${session.id}.csv`;
      await FileSystem.writeAsStringAsync(path, lines);
      if (await Sharing.isAvailableAsync())
        await Sharing.shareAsync(path, {
          mimeType: "text/csv",
          dialogTitle: "Exporter les mesures",
        });
      else Alert.alert("Export prêt", `Fichier créé : ${path}`);
    } catch {
      Alert.alert(
        "Export impossible",
        "Une erreur est survenue pendant la création du CSV.",
      );
    } finally {
      setExporting(false);
    }
  };
  if (!session)
    return (
      <Page>
        <Header title="Résumé de séance" />
        <Card>
          <Text style={{ color: C.muted }}>Aucune séance à afficher.</Text>
        </Card>
        <Button
          title="Historique"
          onPress={() => router.replace("/(tabs)/history")}
        />
      </Page>
    );
  return (
    <Page>
      <Header
        title="Séance terminée"
        sub={new Date(session.startedAt).toLocaleString("fr-FR")}
      />
      <Card style={{ alignItems: "center" }}>
        <Pill color={C.green}>RÉSUMÉ ENREGISTRÉ</Pill>
        <Text
          style={{
            fontSize: 42,
            fontWeight: "900",
            color: C.text,
            marginTop: 9,
          }}
        >
          {Math.floor(session.durationSeconds / 60)} min
        </Text>
        <Text style={{ color: C.muted }}>Durée de la séance</Text>
      </Card>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[
          ["Foulées", String(session.steps)],
          ["Charge", String(session.load)],
        ].map(([a, b]) => (
          <Card key={a} style={{ flex: 1 }}>
            <Label>{a}</Label>
            <Text style={{ fontSize: 25, fontWeight: "900", color: C.text }}>
              {b}
            </Text>
          </Card>
        ))}
      </View>
      <Card>
        <Text style={{ fontWeight: "800", color: C.text }}>
          Mesures enregistrées
        </Text>
        <View style={{ gap: 9, marginTop: 12 }}>
          <Text style={{ color: C.muted }}>
            Flexion moyenne{" "}
            <Text style={{ color: C.text, fontWeight: "800" }}>
              {session.avgFlexion}°
            </Text>
          </Text>
          <Text style={{ color: C.muted }}>
            Flexion maximale{" "}
            <Text style={{ color: C.text, fontWeight: "800" }}>
              {session.maxFlexion}°
            </Text>
          </Text>
          <Text style={{ color: C.muted }}>
            Impact maximal{" "}
            <Text style={{ color: C.text, fontWeight: "800" }}>
              {session.maxImpact.toFixed(1)} g
            </Text>
          </Text>
          <Text style={{ color: C.muted }}>
            Échantillons{" "}
            <Text style={{ color: C.text, fontWeight: "800" }}>
              {session.samples.length}
            </Text>
          </Text>
        </View>
      </Card>
      <Button
        title={exporting ? "Préparation…" : "Exporter les données CSV"}
        onPress={() => void exportCsv()}
      />
      <Button
        title="Consulter l’historique"
        secondary
        onPress={() => router.replace("/(tabs)/history")}
      />
      <Text
        onPress={() => router.replace("/(tabs)")}
        style={{
          textAlign: "center",
          color: C.blue,
          fontWeight: "800",
          padding: 8,
        }}
      >
        Retour au tableau de bord
      </Text>
    </Page>
  );
}
