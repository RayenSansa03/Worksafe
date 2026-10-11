import { router } from "expo-router";
import {
  Activity,
  HeartPulse,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";
import { Text, View } from "react-native";
import { Card, C, Header, Page, Pill } from "../src/ui";
import { useApp } from "../src/store";

type Recommendation = {
  title: string;
  body: string;
  basis: string;
  icon: LucideIcon;
};
export default function Recommendations() {
  const sessions = useApp((s) => s.sessions),
    alerts = useApp((s) => s.alerts);
  const items: Recommendation[] = [
    sessions.length > 1
      ? {
          title: "Charge des séances",
          body: "Comparez la charge de la dernière séance à votre historique récent.",
          basis:
            "Votre charge est calculée à partir de la durée et des impacts.",
          icon: Activity,
        }
      : {
          title: "Construisez une référence",
          body: "Enregistrez plusieurs séances pour faire apparaître des tendances personnelles.",
          basis: "Pas assez de séances enregistrées pour une comparaison.",
          icon: TrendingUp,
        },
    alerts.some((a) => a.category === "impact")
      ? {
          title: "Impacts enregistrés",
          body: "Plusieurs impacts ont dépassé le seuil configuré.",
          basis:
            "Adaptez votre entraînement selon vos sensations et vos objectifs.",
          icon: HeartPulse,
        }
      : {
          title: "Récupération",
          body: "Prévoyez des temps de récupération adaptés à votre pratique.",
          basis: "Suggestion générale de bien-être sportif.",
          icon: HeartPulse,
        },
  ];
  return (
    <Page>
      <Header
        title="Recommandations"
        sub="Observations basées sur vos données"
      />
      <Pill color={C.blue}>CONSEILS GÉNÉRAUX · PAS UN AVIS MÉDICAL</Pill>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Icon color={C.blue} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontWeight: "800", fontSize: 16, color: C.text }}
                >
                  {item.title}
                </Text>
                <Text style={{ color: C.text, lineHeight: 21, marginTop: 5 }}>
                  {item.body}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: C.muted,
                    lineHeight: 18,
                    marginTop: 8,
                  }}
                >
                  {item.basis}
                </Text>
              </View>
            </View>
          </Card>
        );
      })}
      <Card onPress={() => router.push("/(tabs)/history")}>
        <Text style={{ color: C.blue, fontWeight: "800" }}>
          Voir mes séances →
        </Text>
      </Card>
    </Page>
  );
}
