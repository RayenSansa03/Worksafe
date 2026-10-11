import { router } from "expo-router";
import { CalendarDays, ChevronRight } from "lucide-react-native";
import { Text, View } from "react-native";
import { Card, C, Header, Label, Page } from "../../src/ui";
import { useApp } from "../../src/store";
export default function History() {
  const sessions = useApp((s) => s.sessions);
  return (
    <Page>
      <Header title="Historique" sub="Vos séances enregistrées" />
      <Card>
        <Label>Charge d'entraînement · 7 derniers jours</Label>
        <View
          style={{
            height: 75,
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-around",
          }}
        >
          {[28, 45, 37, 63, 52, 75, 32].map((v, i) => (
            <View key={i} style={{ alignItems: "center", gap: 5 }}>
              <View
                style={{
                  height: v,
                  width: 22,
                  borderRadius: 5,
                  backgroundColor: i === 6 ? C.blue : "#C9DAFF",
                }}
              />
              <Text style={{ fontSize: 9, color: C.muted }}>
                {["L", "M", "M", "J", "V", "S", "D"][i]}
              </Text>
            </View>
          ))}
        </View>
      </Card>
      {sessions.length ? (
        sessions.map((s) => (
          <Card
            key={s.id}
            onPress={() =>
              router.push({ pathname: "/summary", params: { id: s.id } })
            }
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  padding: 10,
                  backgroundColor: C.pale,
                  borderRadius: 12,
                }}
              >
                <CalendarDays color={C.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontWeight: "800", fontSize: 15, color: C.text }}
                >
                  Séance de suivi
                </Text>
                <Text style={{ color: C.muted, marginTop: 3 }}>
                  {new Date(s.startedAt).toLocaleDateString("fr-FR")} ·{" "}
                  {Math.floor(s.durationSeconds / 60)} min · {s.steps} foulées
                </Text>
              </View>
              <ChevronRight color={C.muted} />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              <Text style={{ color: C.muted }}>
                Flexion max.{" "}
                <Text style={{ color: C.text, fontWeight: "700" }}>
                  {s.maxFlexion}°
                </Text>
              </Text>
              <Text style={{ color: C.muted }}>
                Impact max.{" "}
                <Text style={{ color: C.text, fontWeight: "700" }}>
                  {s.maxImpact.toFixed(1)} g
                </Text>
              </Text>
              <Text style={{ color: C.blue, fontWeight: "800" }}>
                Charge {s.load}
              </Text>
            </View>
          </Card>
        ))
      ) : (
        <Card style={{ alignItems: "center", paddingVertical: 30 }}>
          <CalendarDays color={C.blue} size={34} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: C.text,
              marginTop: 12,
            }}
          >
            Aucune séance pour le moment
          </Text>
          <Text style={{ color: C.muted, textAlign: "center", marginTop: 6 }}>
            Vos séances terminées apparaîtront ici. Lancez une séance de
            démonstration pour commencer.
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
