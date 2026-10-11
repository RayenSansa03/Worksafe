import { router } from "expo-router";
import {
  Bluetooth,
  ChevronLeft,
  Radio,
  ShieldCheck,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Button, Card, C, Header, Page, Pill } from "../src/ui";
import { useApp } from "../src/store";
export default function Connect() {
  const [scanning, setScanning] = useState(false);
  const connected = useApp((s) => s.connected);
  const setConnected = useApp((s) => s.setConnected);
  return (
    <Page>
      <Text
        onPress={() => router.back()}
        style={{ fontSize: 16, color: C.blue, fontWeight: "700" }}
      >
        ‹ Retour
      </Text>
      <Header
        title="Connecter votre genouillère"
        sub="Capteur BLE WorkSafe Knee"
        right={<Pill color={C.blue}>BLE</Pill>}
      />
      <Text style={{ fontSize: 15, color: C.muted, lineHeight: 22 }}>
        Assurez-vous que le capteur ESP32 est allumé à proximité immédiate.
      </Text>
      <Card>
        <View
          style={{
            height: 205,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F6F8FC",
            borderRadius: 15,
          }}
        >
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 75,
              borderWidth: 1,
              borderColor: "#DCE7F8",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 24,
                backgroundColor: C.blue,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Radio color="white" size={36} />
            </View>
          </View>
          <Text style={{ fontWeight: "800", color: C.navy, marginTop: 8 }}>
            Recherche BLE native requise
          </Text>
        </View>
      </Card>
      <Button
        title={scanning ? "Recherche en cours…" : "Rechercher les appareils"}
        onPress={() => {
          setScanning(true);
          Alert.alert(
            "BLE indisponible",
            "La découverte réelle nécessite une version de développement native et le protocole GATT du firmware ESP32. Vous pouvez continuer en mode démonstration.",
          );
          setTimeout(() => setScanning(false), 800);
        }}
      />
      <Card>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <ShieldCheck color={C.green} size={24} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "800", color: C.text }}>
              Mode démonstration
            </Text>
            <Text style={{ color: C.muted, lineHeight: 19 }}>
              Aucune connexion physique simulée. Les données de démo seront
              étiquetées.
            </Text>
          </View>
        </View>
      </Card>
      <Card>
        <Text style={{ fontSize: 17, fontWeight: "800", color: C.text }}>
          Appareil exemple
        </Text>
        <Text style={{ color: C.muted, marginTop: 5 }}>
          WorkSafe Knee Sensor · ESP32
        </Text>
        <Text style={{ color: C.muted, marginTop: 4 }}>
          BLE réel désactivé tant que UUID et format du firmware ne sont pas
          fournis.
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 13,
          }}
        >
          <Pill color={connected ? C.green : C.amber}>
            {connected ? "DÉMO ACTIVE" : "NON CONNECTÉ"}
          </Pill>
          <Text
            onPress={() => setConnected(!connected)}
            style={{ color: connected ? C.red : C.blue, fontWeight: "800" }}
          >
            {connected ? "Désactiver" : "Activer la démo"}
          </Text>
        </View>
      </Card>
      <Button
        title="Continuer vers le tableau de bord  →"
        onPress={() => router.replace("/(tabs)")}
      />
    </Page>
  );
}
