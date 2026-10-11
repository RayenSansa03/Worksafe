import { router, useLocalSearchParams } from "expo-router";
import { TriangleAlert } from "lucide-react-native";
import { Text } from "react-native";
import { Button, Card, C, Header, Page, Pill } from "../src/ui";
import { useApp } from "../src/store";
export default function AlertDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const alert = useApp((s) => s.alerts.find((a) => a.id === id));
  return (
    <Page>
      <Text
        onPress={() => router.back()}
        style={{ color: C.blue, fontWeight: "800" }}
      >
        ‹ Alertes
      </Text>
      <Header title="Détail de l’alerte" />
      <Card style={{ alignItems: "center", padding: 26 }}>
        <TriangleAlert color={C.amber} size={40} />
        <Text
          style={{
            fontSize: 20,
            fontWeight: "900",
            color: C.text,
            marginTop: 12,
            textAlign: "center",
          }}
        >
          {alert?.title ?? "Alerte introuvable"}
        </Text>
        <Pill color={C.amber}>{alert?.category.toUpperCase() ?? "—"}</Pill>
      </Card>
      <Card>
        <Text style={{ fontWeight: "800", color: C.text }}>
          Mesure observée
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "900",
            color: C.blue,
            marginTop: 5,
          }}
        >
          {alert?.value ?? "—"}
        </Text>
        <Text style={{ color: C.muted, marginTop: 8 }}>
          Paramètre configuré : {alert?.threshold ?? "—"}
        </Text>
        <Text style={{ color: C.muted, marginTop: 8 }}>
          {alert ? new Date(alert.timestamp).toLocaleString("fr-FR") : "—"}
        </Text>
      </Card>
      <Card>
        <Text style={{ color: C.muted, lineHeight: 21 }}>
          Cette alerte signale uniquement un dépassement de seuil de suivi. Elle
          ne confirme ni blessure ni problème médical.
        </Text>
      </Card>
      <Button
        title="Consulter mes seuils"
        onPress={() => router.push("/settings")}
      />
    </Page>
  );
}
