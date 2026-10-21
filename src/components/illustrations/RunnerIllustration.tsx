import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { reward, useTheme } from '@/theme';

/** Hero illustration: a runner in front of a rising sun. */
export function RunnerIllustration({ size = 240 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 240 192" accessible accessibilityLabel="Illustration d'un coureur" accessibilityRole="image">
      <Defs>
        <LinearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={reward.gold[0]} />
          <Stop offset="1" stopColor={reward.warm[1]} />
        </LinearGradient>
        <LinearGradient id="body" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.accentLight} />
          <Stop offset="1" stopColor={colors.accent} />
        </LinearGradient>
      </Defs>
      <Circle cx={150} cy={78} r={58} fill="url(#sun)" opacity={0.9} />
      <Circle cx={150} cy={78} r={76} fill="none" stroke={colors.accentSoft} strokeWidth={10} />
      {/* ground */}
      <Path d="M 14 168 H 226" stroke={colors.separator} strokeWidth={4} strokeLinecap="round" />
      <Path d="M 40 180 H 90 M 120 180 H 190" stroke={colors.separator} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      {/* runner */}
      <Circle cx={108} cy={52} r={13} fill="url(#body)" />
      <Path d="M 104 70 L 96 108" stroke="url(#body)" strokeWidth={14} strokeLinecap="round" />
      <Path d="M 100 76 L 122 90 L 138 78" stroke="url(#body)" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M 100 76 L 80 92 L 64 82" stroke="url(#body)" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M 96 108 L 122 124 L 116 160" stroke="url(#body)" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M 96 108 L 78 134 L 52 140" stroke="url(#body)" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* speed lines */}
      <Path d="M 22 70 H 52 M 14 92 H 40 M 26 114 H 50" stroke={colors.accent} strokeWidth={4} strokeLinecap="round" opacity={0.45} />
    </Svg>
  );
}
