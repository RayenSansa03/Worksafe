import { router } from "expo-router";
import {
  Bell,
  BatteryCharging,
  Footprints,
  Gauge as GaugeIcon,
  Thermometer,
  Waves,
} from "lucide-react-native";
import { Text, View } from "react-native";
import { Button, Card, C, Header, Label, Page, Pill } from "../../src/ui";
import { Gauge, FlexChart, ImpactChart } from "../../src/charts";
import { useApp } from "../../src/store";
export default function Home() {
  const connected = useApp((s) => s.connected);
  const alerts = useApp((s) => s.alerts);
  const sessions = useApp((s) => s.sessions);
  const elapsed = useApp((s) => s.elapsed);
  const phase = useApp((s) => s.phase);
  const metrics = [
    ["FLEXION ACTIVE", "42°", "Amplitude max.", "125°", Waves],
    ["TEMP. CAPTEUR", "32.4 °C", "Écart basal", "+0.3°C", Thermometer],
    ["DERNIER IMPACT", "2.1 g", "Pic récent", "2.8 g", GaugeIcon],
    ["FOULÉES", "2 450", "Aujourd’hui", "En cours", Footprints],
  ] as const;
  return (
    <Page>
      <Header
        title="Bonjour, Alex"
        sub="SURVEILLANCE BIO-MÉCANIQUE"
        right={
          <View style={{ alignItems: "flex-end", gap: 5 }}>
            <Text onPress={() => router.push("/(tabs)/alerts")}>
              <Bell color={C.navy} size={20} />
              {alerts.filter((a) => !a.read).length > 0 ? " 🔴" : ""}
            </Text>
            <Pill color={connected ? C.green : C.amber}>
              {connected ? "DÉMO ON" : "HORS LIGNE"}
            </Pill>
          </View>
        }
      />
      <Card style={{ paddingVertical: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "800", color: C.text }}>
            {connected
              ? "GENOUILLÈRE · DONNÉES DÉMO"
              : "AUCUN CAPTEUR CONNECTÉ"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <BatteryCharging size={13} color={C.muted} />
            <Text style={{ color: C.muted, fontSize: 11 }}>
              {connected ? "87%" : "—"}
            </Text>
          </View>
        </View>
      </Card>
      {connected ? (
        <Pill color={C.amber}>MODE DÉMONSTRATION · mesures simulées</Pill>
      ) : (
        <View style={{ gap: 6 }}>
          <Pill color={C.amber}>APERÇU D'EXEMPLE · AUCUNE MESURE CAPTEUR</Pill>
          <Text
            onPress={() => router.push("/connect")}
            style={{ color: C.blue, fontWeight: "800" }}
          >
            Connecter un capteur →
          </Text>
        </View>
      )}
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Label>Score biomécanique</Label>
            <Text style={{ fontSize: 19, fontWeight: "800", color: C.text }}>
              Indice de sollicitation
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: C.text }}>
              (ISG)
            </Text>
          </View>
          <Pill color={C.amber}>MODÉRÉE</Pill>
        </View>
        <View style={{ alignItems: "center", padding: 10 }}>
          <Gauge />
        </View>
        <View
          style={{
            height: 8,
            borderRadius: 8,
            backgroundColor: "#E9EDF4",
            overflow: "hidden",
          }}
        >
          <View style={{ height: 8, width: "72%", backgroundColor: C.green }} />
        </View>
        <Text
          style={{
            textAlign: "center",
            fontSize: 10,
            color: C.muted,
            marginTop: 10,
          }}
        >
          Indicateur illustratif de charge d'entraînement. Ne constitue pas un
          diagnostic médical.
        </Text>
      </Card>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {metrics.map(([name, value, sub, detail, Icon]) => (
          <Card
            key={name}
            style={{ width: "48%", minHeight: 130, flexGrow: 1 }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Icon color={C.blue} size={20} />
              <Pill color={C.green}>STABLE</Pill>
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "800",
                color: C.navy,
                marginTop: 12,
              }}
            >
              {name}
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: C.text,
                marginVertical: 3,
              }}
            >
              {value}
            </Text>
            <Text style={{ fontSize: 11, color: C.muted }}>
              {sub} · {detail}
            </Text>
          </Card>
        ))}
      </View>
      <Card>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "800", color: C.text }}>
            Courbe de flexion dynamique
          </Text>
          <Text style={{ fontSize: 10, color: C.muted }}>60 s · exemple</Text>
        </View>
        <View style={{ marginTop: 12 }}>
          <FlexChart />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <Text style={{ color: C.muted, fontSize: 10 }}>-60 s</Text>
          <Text style={{ color: C.blue, fontSize: 10, fontWeight: "700" }}>
            Maintenant
          </Text>
        </View>
      </Card>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "800", color: C.text }}>
            Pics d'accélération récents (g)
          </Text>
          <Text style={{ color: C.green, fontSize: 10, fontWeight: "700" }}>
            Max 3.2g
          </Text>
        </View>
        <ImpactChart />
      </Card>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Label>Objectif de rééducation</Label>
            <Text style={{ fontWeight: "800", color: C.text }}>
              Charge cumulée du jour
            </Text>
          </View>
          <Text style={{ fontSize: 23, fontWeight: "900", color: C.blue }}>
            72%
          </Text>
        </View>
        <View
          style={{
            height: 8,
            backgroundColor: "#E9EDF4",
            borderRadius: 9,
            marginTop: 12,
          }}
        >
          <View
            style={{
              height: 8,
              width: "72%",
              backgroundColor: C.blue,
              borderRadius: 9,
            }}
          />
        </View>
        <Text style={{ color: C.muted, marginTop: 10 }}>
          ⏱{" "}
          {phase === "running"
            ? "Séance active"
            : sessions.length
              ? "Dernière séance enregistrée"
              : "Aucune séance active"}{" "}
          · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
        </Text>
      </Card>
      <Button
        title={
          phase === "running" ? "Reprendre ma séance" : "Démarrer une séance"
        }
        onPress={() => router.push("/(tabs)/session")}
      />
      <Button
        title="Calibrer les capteurs"
        secondary
        onPress={() => router.push("/calibration")}
      />
      <Text
        onPress={() => router.push("/settings")}
        style={{ textAlign: "center", color: C.muted, paddingVertical: 7 }}
      >
        Réglages capteur · Paramètres
      </Text>
    </Page>
  );
}
