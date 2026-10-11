import { router } from "expo-router";
import { CheckCircle2, Circle, Radio, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Button, Card, C, Header, Page, Pill } from "../src/ui";
import { useApp } from "../src/store";
const steps = [
  "Installez correctement la genouillère",
  "Tendez le genou et restez immobile",
  "Vérifiez la connexion des capteurs",
  "Lancez la calibration",
];
export default function Calibration() {
  const connected = useApp((s) => s.connected);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const next = () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (!connected) {
      Alert.alert(
        "Mode démonstration",
        "Calibration simulée. Aucune commande C n’est envoyée à un capteur physique.",
      );
      setDone(true);
      return;
    }
    Alert.alert(
      "Protocole non configuré",
      "Le firmware ESP32 doit fournir une confirmation de calibration avant que cette étape puisse être validée.",
    );
  };
  return (
    <Page>
      <Text
        onPress={() => router.back()}
        style={{ color: C.blue, fontWeight: "800" }}
      >
        ‹ Retour
      </Text>
      <Header
        title="Calibration capteur"
        sub="Guidage pas à pas"
        right={
          <Pill color={connected ? C.amber : C.muted}>
            {connected ? "DÉMO" : "HORS LIGNE"}
          </Pill>
        }
      />
      <Card>
        <View style={{ alignItems: "center", padding: 15 }}>
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 25,
              backgroundColor: C.pale,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Radio color={C.blue} size={36} />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "900",
              color: C.text,
              marginTop: 14,
              textAlign: "center",
            }}
          >
            {done ? "Étape terminée" : steps[step]}
          </Text>
          <Text
            style={{
              color: C.muted,
              textAlign: "center",
              lineHeight: 21,
              marginTop: 7,
            }}
          >
            {done
              ? "La calibration de démonstration a été simulée."
              : "Suivez la consigne, puis passez à l’étape suivante."}
          </Text>
        </View>
      </Card>
      <View
        style={{
          height: 7,
          backgroundColor: "#E8EDF4",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 7,
            width: `${done ? 100 : (step + 1) * 25}%`,
            backgroundColor: C.blue,
          }}
        />
      </View>
      {steps.map((x, i) => (
        <Card key={x}>
          <View style={{ flexDirection: "row", gap: 11, alignItems: "center" }}>
            {i < (done ? 4 : step) ? (
              <CheckCircle2 color={C.green} />
            ) : (
              <Circle color={C.muted} />
            )}
            <Text
              style={{
                flex: 1,
                color: C.text,
                fontWeight: i === step ? "800" : "600",
              }}
            >
              {i + 1}. {x}
            </Text>
          </View>
        </Card>
      ))}
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <ShieldCheck color={connected ? C.green : C.amber} />
          <Text style={{ flex: 1, color: C.text }}>
            État capteur :{" "}
            {connected ? "mode démonstration actif" : "aucun capteur connecté"}
          </Text>
        </View>
      </Card>
      <Button
        title={
          done
            ? "Terminer"
            : step < 3
              ? "Étape suivante"
              : "Lancer la calibration"
        }
        onPress={() => (done ? router.back() : next())}
      />
    </Page>
  );
}
