import { router } from "expo-router";
import {
  ChevronRight,
  SlidersHorizontal,
  UserRound,
} from "lucide-react-native";
import { Text, TextInput, View } from "react-native";
import { Alert } from "react-native";
import { useState } from "react";
import { Button, Card, C, Header, Label, Page, Pill } from "../../src/ui";
import { useApp } from "../../src/store";
export default function Profile() {
  const connected = useApp((s) => s.connected),
    name = useApp((s) => s.name),
    sport = useApp((s) => s.sport),
    weight = useApp((s) => s.weight),
    kneeSide = useApp((s) => s.kneeSide),
    setProfile = useApp((s) => s.setProfile);
  const [draft, setDraft] = useState({ name, sport, weight });
  const apply = () => {
    if (!draft.name.trim() || !draft.sport.trim()) {
      Alert.alert("Profil incomplet", "Renseignez votre nom et votre sport.");
      return;
    }
    setProfile(draft);
    Alert.alert(
      "Profil enregistré",
      "Vos informations sont conservées sur cet appareil.",
    );
  };
  return (
    <Page>
      <Header
        title="Profil"
        sub="Athlète et préférences"
        right={
          <Pill color={connected ? C.amber : C.muted}>
            {connected ? "MODE DÉMO" : "HORS LIGNE"}
          </Pill>
        }
      />
      <Card>
        <View style={{ flexDirection: "row", gap: 13, alignItems: "center" }}>
          <View
            style={{ backgroundColor: C.pale, padding: 14, borderRadius: 30 }}
          >
            <UserRound color={C.blue} size={27} />
          </View>
          <View>
            <Text style={{ fontSize: 19, fontWeight: "900", color: C.text }}>
              {name}
            </Text>
            <Text style={{ color: C.muted, marginTop: 3 }}>
              {sport} · Genou {kneeSide}
            </Text>
          </View>
        </View>
      </Card>
      <Card>
        <Label>Informations de l’athlète</Label>
        {(
          [
            ["name", "Nom"],
            ["sport", "Sport"],
            ["weight", "Poids (optionnel, kg)"],
          ] as const
        ).map(([key, label]) => (
          <View key={key} style={{ marginTop: 8 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: C.muted,
                marginBottom: 5,
              }}
            >
              {label}
            </Text>
            <TextInput
              value={draft[key]}
              onChangeText={(v) => setDraft((x) => ({ ...x, [key]: v }))}
              keyboardType={key === "weight" ? "decimal-pad" : "default"}
              placeholder={label}
              style={{
                backgroundColor: "#F5F7FB",
                borderRadius: 10,
                padding: 11,
                color: C.text,
              }}
            />
          </View>
        ))}
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: C.muted,
            marginTop: 12,
            marginBottom: 7,
          }}
        >
          Genou surveillé
        </Text>
        <View style={{ flexDirection: "row", gap: 7 }}>
          {(["gauche", "droite", "les deux"] as const).map((side) => (
            <Text
              key={side}
              onPress={() => setProfile({ kneeSide: side })}
              style={{
                padding: 9,
                borderRadius: 9,
                overflow: "hidden",
                color: kneeSide === side ? "white" : C.text,
                backgroundColor: kneeSide === side ? C.blue : "#F1F4F8",
                fontWeight: "700",
              }}
            >
              {side}
            </Text>
          ))}
        </View>
        <Text style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
          Le côté sélectionné est enregistré immédiatement.
        </Text>
      </Card>
      <Button title="Enregistrer le profil" onPress={apply} />
      {[
        [
          "Paramètres de surveillance",
          "Seuils et unités",
          "/settings",
          SlidersHorizontal,
        ],
        [
          "Calibration des capteurs",
          "Procédure guidée",
          "/calibration",
          ChevronRight,
        ],
        [
          "Recommandations",
          "Observations d’entraînement",
          "/recommendations",
          ChevronRight,
        ],
        [
          "Connexion du capteur",
          "BLE ou mode démonstration",
          "/connect",
          ChevronRight,
        ],
      ].map(([title, desc, path, Icon]: any) => (
        <Card key={title} onPress={() => router.push(path)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Icon color={C.blue} size={21} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "800", color: C.text }}>{title}</Text>
              <Text style={{ color: C.muted, marginTop: 3 }}>{desc}</Text>
            </View>
            <ChevronRight color={C.muted} />
          </View>
        </Card>
      ))}
      <Card>
        <Text style={{ fontWeight: "800", color: C.text }}>
          Confidentialité des données
        </Text>
        <Text style={{ color: C.muted, lineHeight: 20, marginTop: 5 }}>
          Les préférences et les séances sont stockées localement sur cet
          appareil. Le mode démo génère des mesures fictives.
        </Text>
      </Card>
      <Text style={{ textAlign: "center", color: C.muted, fontSize: 11 }}>
        WorkSafe 1.0 · Suivi sportif, sans diagnostic médical
      </Text>
    </Page>
  );
}
