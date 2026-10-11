import { router } from "expo-router";
import {
  Activity,
  Bluetooth,
  ShieldCheck,
  TrendingUp,
} from "lucide-react-native";
import { Text, View } from "react-native";
import { Button, Card, C, Page, Pill, s } from "../src/ui";
export default function Welcome() {
  return (
    <Page>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{ backgroundColor: C.navy, padding: 10, borderRadius: 13 }}
          >
            <ShieldCheck color="white" size={23} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: "900", color: C.text }}>
            WorkSafe
          </Text>
        </View>
        <Pill>BLE 5.2 · PRÊT</Pill>
      </View>
      <View style={{ alignItems: "center", paddingVertical: 16, gap: 10 }}>
        <Pill color={C.blue}>SURVEILLANCE INTELLIGENTE DU GENOU</Pill>
        <Text
          style={{
            fontSize: 32,
            lineHeight: 38,
            fontWeight: "900",
            textAlign: "center",
            color: C.text,
          }}
        >
          Comprenez votre genou. Entraînez-vous plus intelligemment.
        </Text>
        <Text
          style={{
            fontSize: 15,
            lineHeight: 23,
            textAlign: "center",
            color: C.muted,
          }}
        >
          Suivez la flexion articulaire, les impacts et la charge mécanique pour
          mieux comprendre vos séances.
        </Text>
      </View>
      <Card>
        <View
          style={{
            height: 190,
            backgroundColor: "#EEF3FA",
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 88,
              height: 155,
              backgroundColor: "#D6E4FF",
              borderRadius: 35,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: C.blue,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 55,
                height: 55,
                borderRadius: 30,
                backgroundColor: "white",
                borderWidth: 5,
                borderColor: C.blue,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Activity color={C.blue} />
            </View>
          </View>
          <Text
            style={{
              position: "absolute",
              right: 13,
              top: 23,
              color: C.green,
              fontWeight: "800",
            }}
          >
            ● CAPTEUR ACTIF
          </Text>
        </View>
        <Text style={{ textAlign: "center", marginTop: 12, color: C.muted }}>
          Illustration du capteur WorkSafe Knee
        </Text>
      </Card>
      {[
        [
          "Mesure biomécanique continue",
          "Flexion et impacts suivis pendant vos séances.",
          Activity,
        ],
        [
          "Détection des variations",
          "Repérez les changements de sollicitation.",
          Bluetooth,
        ],
        [
          "Recommandations d’entraînement",
          "Des repères généraux pour votre récupération.",
          TrendingUp,
        ],
      ].map(([h, d, I]: any) => (
        <Card key={h}>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <View
              style={{ backgroundColor: C.pale, padding: 12, borderRadius: 12 }}
            >
              <I color={C.blue} size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: C.text }}>
                {h}
              </Text>
              <Text style={{ color: C.muted, lineHeight: 19, marginTop: 3 }}>
                {d}
              </Text>
            </View>
          </View>
        </Card>
      ))}
      <Button title="Commencer  →" onPress={() => router.push("/connect")} />
      <Button
        title="J'ai déjà un compte"
        secondary
        onPress={() => router.replace("/(tabs)")}
      />
      <Text
        style={{
          textAlign: "center",
          fontSize: 12,
          color: C.muted,
          paddingHorizontal: 20,
        }}
      >
        Outil de suivi de performance, ne remplace pas un avis médical.
      </Text>
    </Page>
  );
}
