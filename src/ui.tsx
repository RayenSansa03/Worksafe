import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export const C = {
  blue: "#1765E8",
  navy: "#15345B",
  bg: "#F5F7FB",
  white: "#FFFFFF",
  text: "#15243B",
  muted: "#77849A",
  green: "#159B78",
  amber: "#F0A928",
  red: "#DC4B4B",
  border: "#E5EAF2",
  pale: "#E8F0FF",
};
export function Page({ children }: PropsWithChildren) {
  return (
    <SafeAreaView edges={["top"]} style={s.page}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Header({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <View style={s.header}>
      <View style={{ flex: 1 }}>
        <Text style={s.eyebrow}>WORKSAFE · SUIVI BIOMÉCANIQUE</Text>
        <Text style={s.title}>{title}</Text>
        {sub ? <Text style={s.muted}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}
export function Card({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: any;
  onPress?: () => void;
}) {
  return onPress ? (
    <Pressable onPress={onPress} style={[s.card, style]}>
      {children}
    </Pressable>
  ) : (
    <View style={[s.card, style]}>{children}</View>
  );
}
export function Label({ children }: { children: string }) {
  return <Text style={s.label}>{children.toUpperCase()}</Text>;
}
export function Button({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[s.button, secondary && s.secondary]}>
      <Text style={[s.buttonText, secondary && { color: C.text }]}>
        {title}
      </Text>
    </Pressable>
  );
}
export function Pill({
  children,
  color = C.green,
}: {
  children: string;
  color?: string;
}) {
  return (
    <View style={[s.pill, { backgroundColor: `${color}18` }]}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={[s.pillText, { color }]}>{children}</Text>
    </View>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 30, gap: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 10,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.3,
    fontWeight: "800",
    color: C.navy,
    marginBottom: 5,
  },
  title: { fontSize: 25, lineHeight: 30, fontWeight: "800", color: C.text },
  muted: { fontSize: 13, color: C.muted, marginTop: 3 },
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EFF2F7",
    shadowColor: "#173454",
    shadowOpacity: 0.035,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  label: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "800",
    color: C.navy,
    marginBottom: 8,
  },
  button: {
    height: 50,
    borderRadius: 13,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  secondary: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  buttonText: { color: "white", fontWeight: "800", fontSize: 15 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 30,
  },
  pillText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
