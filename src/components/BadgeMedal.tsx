import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

type BadgeMedalProps = {
  icon: string;
  colors: [string, string];
  locked?: boolean;
  size?: number;
};

/** Round medal with a gradient ring. Locked badges are greyed with a lock. */
export function BadgeMedal({ icon, colors: gradient, locked = false, size = 72 }: BadgeMedalProps) {
  const { colors } = useTheme();
  const id = `m-${gradient[0].slice(1)}-${gradient[1].slice(1)}`;
  const from = locked ? colors.surfaceRaised : gradient[0];
  const to = locked ? colors.surfaceRaised : gradient[1];

  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 72 72">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Circle cx={36} cy={36} r={34} fill={`url(#${id})`} />
        <Circle cx={36} cy={36} r={27} fill={colors.surface} opacity={locked ? 0.6 : 0.18} />
        <Circle cx={36} cy={36} r={34} fill="none" stroke="#FFFFFF" strokeOpacity={locked ? 0 : 0.35} strokeWidth={2} />
      </Svg>
      <View style={styles.icon}>
        <Ionicons
          name={(locked ? 'lock-closed' : icon) as keyof typeof Ionicons.glyphMap}
          size={size * 0.4}
          color={locked ? colors.textTertiary : '#FFFFFF'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
