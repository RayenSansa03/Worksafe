import { useEffect } from "react";
import {
  Activity,
  Pause,
  Play,
  Square,
  Thermometer,
  Footprints,
  Waves,
} from "lucide-react-native";
import { Alert, Text, View } from "react-native";
import { Button, Card, C, Header, Label, Page, Pill } from "../../src/ui";
import { FlexChart, ImpactChart } from "../../src/charts";
import { useApp } from "../../src/store";
import { createDemoMeasurement } from "../../src/services/sensor";
import { router } from "expo-router";
export default function Session() {
  const connected = useApp((s) => s.connected),
    phase = useApp((s) => s.phase),
    elapsed = useApp((s) => s.elapsed),
    samples = useApp((s) => s.samples),
    start = useApp((s) => s.start),
    pause = useApp((s) => s.pause),
    resume = useApp((s) => s.resume),
    tick = useApp((s) => s.tick),
    addSample = useApp((s) => s.addSample),
    finish = useApp((s) => s.finish);
  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => tick(), 1000);
    return () => clearInterval(t);
  }, [phase, tick]);
  useEffect(() => {
    if (!connected || phase !== "running") return;
    const t = setInterval(() => {
      addSample(createDemoMeasurement());
    }, 2000);
    return () => clearInterval(t);
  }, [connected, phase, addSample]);
  const stop = async () => {
    const s = await finish();
    if (s) router.push({ pathname: "/summary", params: { id: s.id } });
  };
  const mins = Math.floor(elapsed / 60),
    secs = String(elapsed % 60).padStart(2, "0");
  const flex = samples
    .map((m) => m.kneeAngleDeg)
    .filter((x): x is number => x !== undefined);
  return (
    <Page>
      <Header
        title="Séance"
        sub="Suivi en temps réel"
        right={
          <Pill color={connected ? C.amber : C.muted}>
            {connected ? "DÉMO" : "HORS LIGNE"}
          </Pill>
        }
      />
      {connected ? (
        <Pill color={C.amber}>DÉMONSTRATION · données générées localement</Pill>
      ) : (
        <Card>
          <Text style={{ color: C.text, fontWeight: "700" }}>
            Aucun capteur actif
          </Text>
          <Text style={{ color: C.muted, marginTop: 4 }}>
            Connectez-vous en mode démo pour afficher des mesures animées.
          </Text>
          <Text
            onPress={() => router.push("/connect")}
            style={{ color: C.blue, fontWeight: "800", marginTop: 8 }}
          >
            Configurer le capteur →
          </Text>
        </Card>
      )}
      <Card style={{ alignItems: "center", paddingVertical: 25 }}>
        <Label>Durée de la séance</Label>
        <Text
          style={{
            fontSize: 52,
            fontWeight: "900",
            color: C.text,
            fontVariant: ["tabular-nums"],
          }}
        >
          {mins}:{secs}
        </Text>
        <Pill
          color={
            phase === "running"
              ? C.green
              : phase === "paused"
                ? C.amber
                : C.muted
          }
        >
          {phase === "running"
            ? "SURVEILLANCE ACTIVE"
            : phase === "paused"
              ? "EN PAUSE"
              : phase === "completed"
                ? "TERMINÉE"
                : "EN ATTENTE"}
        </Pill>
      </Card>
      <View style={{ flexDirection: "row", gap: 9 }}>
        <Button
          title={
            phase === "idle" || phase === "completed"
              ? "Démarrer"
              : phase === "paused"
                ? "Reprendre"
                : "Pause"
          }
          onPress={() =>
            phase === "running"
              ? pause()
              : phase === "paused"
                ? resume()
                : connected
                  ? start()
                  : router.push("/connect")
          }
        />
        {phase === "running" || phase === "paused" ? (
          <Button
            title="Terminer"
            secondary
            onPress={() =>
              Alert.alert(
                "Terminer la séance ?",
                "Un résumé sera enregistré dans votre historique.",
                [
                  { text: "Continuer", style: "cancel" },
                  { text: "Terminer", onPress: () => void stop() },
                ],
              )
            }
          />
        ) : null}
      </View>
      <Card>
        <Text style={{ fontWeight: "800", color: C.text, marginBottom: 10 }}>
          Flexion du genou
        </Text>
        <FlexChart values={flex.length > 1 ? flex.slice(-15) : undefined} />
        <Text style={{ color: C.muted, fontSize: 11, marginTop: 7 }}>
          Angle actuel ·{" "}
          {flex.length ? `${flex[flex.length - 1]}°` : "En attente de données"}
        </Text>
      </Card>
      <Card>
        <Text style={{ fontWeight: "800", color: C.text, marginBottom: 8 }}>
          Impacts enregistrés
        </Text>
        <ImpactChart
          values={samples
            .map((x) => x.impactG)
            .filter((x): x is number => x !== undefined)
            .slice(-7)}
        />
      </Card>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Card style={{ flex: 1 }}>
          <Waves color={C.blue} />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "900",
              color: C.text,
              marginTop: 8,
            }}
          >
            {samples.length ? `${flex.at(-1) ?? "—"}°` : "—"}
          </Text>
          <Text style={{ color: C.muted }}>Flexion actuelle</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Footprints color={C.blue} />
          <Text
            style={{
              fontSize: 24,
              fontWeight: "900",
              color: C.text,
              marginTop: 8,
            }}
          >
            {samples.reduce((a, x) => a + (x.stepCount ?? 0), 0)}
          </Text>
          <Text style={{ color: C.muted }}>Foulées démo</Text>
        </Card>
      </View>
      <Card>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Thermometer color={C.blue} />
          <Text style={{ color: C.text, fontWeight: "700" }}>
            Température capteur
          </Text>
          <Text
            style={{ marginLeft: "auto", fontWeight: "800", color: C.navy }}
          >
            {samples.at(-1)?.temperatureCelsius ?? "—"} °C
          </Text>
        </View>
      </Card>
    </Page>
  );
}
