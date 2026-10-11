import { router } from "expo-router";
import { Bell, CheckCheck, TriangleAlert } from "lucide-react-native";
import { Text, View } from "react-native";
import { Card, C, Header, Page, Pill } from "../../src/ui";
import { useApp } from "../../src/store";
export default function Alerts() {
  const alerts = useApp((s) => s.alerts);
  const mark = useApp((s) => s.markRead);
  return (
    <Page>
      <Header
        title="Alertes"
        sub="Événements issus des mesures"
        right={
          <Pill
            color={C.blue}
          >{`${alerts.filter((a) => !a.read).length} NON LUES`}</Pill>
        }
      />
      <Card>
        <Text style={{ color: C.muted, lineHeight: 20 }}>
          Les alertes indiquent le dépassement d'un paramètre configuré. Elles
          ne constituent pas un diagnostic médical.
        </Text>
      </Card>
      {alerts.length ? (
        alerts.map((a) => (
          <Card
            key={a.id}
            onPress={() => {
              mark(a.id);
              router.push({ pathname: "/alert-detail", params: { id: a.id } });
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
            >
              <View
                style={{
                  padding: 10,
                  backgroundColor:
                    a.category === "impact" ? "#FFF4E3" : "#FFF0F0",
                  borderRadius: 12,
                }}
              >
                <TriangleAlert
                  color={a.category === "impact" ? C.amber : C.red}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "800", color: C.text }}>
                  {a.title}
                </Text>
                <Text style={{ color: C.muted, marginTop: 3 }}>
                  {new Date(a.timestamp).toLocaleString("fr-FR")} · {a.value} /
                  seuil {a.threshold}
                </Text>
              </View>
              {!a.read ? (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: C.blue,
                    borderRadius: 5,
                  }}
                />
              ) : (
                <CheckCheck color={C.green} size={18} />
              )}
            </View>
          </Card>
        ))
      ) : (
        <Card style={{ alignItems: "center", padding: 30 }}>
          <Bell color={C.blue} size={36} />
          <Text
            style={{
              fontWeight: "800",
              fontSize: 18,
              color: C.text,
              marginTop: 10,
            }}
          >
            Tout est calme
          </Text>
          <Text style={{ color: C.muted, textAlign: "center", marginTop: 5 }}>
            Les alertes de seuil s'afficheront ici pendant une séance de
            démonstration.
          </Text>
          <Text
            onPress={() => router.push("/(tabs)/session")}
            style={{ color: C.blue, fontWeight: "800", marginTop: 15 }}
          >
            Démarrer une séance →
          </Text>
        </Card>
      )}
    </Page>
  );
}
