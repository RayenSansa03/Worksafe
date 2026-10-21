import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { reward, useTheme } from '@/theme';

/** Celebration illustration for the end-of-session summary. */
export function TrophyIllustration({ size = 180 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 180 180" accessible accessibilityLabel="Illustration d'un trophée" accessibilityRole="image">
      <Defs>
        <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={reward.gold[0]} />
          <Stop offset="1" stopColor={reward.gold[1]} />
        </LinearGradient>
      </Defs>
      <Circle cx={90} cy={90} r={82} fill={colors.accentSoft} />
      {/* sparkles */}
      <Path d="M 28 46 l 4 10 l 10 4 l -10 4 l -4 10 l -4 -10 l -10 -4 l 10 -4 z" fill={reward.gold[0]} />
      <Path d="M 150 36 l 3 7 l 7 3 l -7 3 l -3 7 l -3 -7 l -7 -3 l 7 -3 z" fill={colors.accentLight} />
      <Path d="M 148 118 l 3 7 l 7 3 l -7 3 l -3 7 l -3 -7 l -7 -3 l 7 -3 z" fill={reward.gold[0]} />
      {/* handles */}
      <Path d="M 56 54 H 38 C 38 82 52 90 66 92" stroke="url(#gold)" strokeWidth={9} fill="none" strokeLinecap="round" />
      <Path d="M 124 54 H 142 C 142 82 128 90 114 92" stroke="url(#gold)" strokeWidth={9} fill="none" strokeLinecap="round" />
      {/* cup */}
      <Path d="M 54 40 H 126 V 66 C 126 96 110 112 90 112 C 70 112 54 96 54 66 Z" fill="url(#gold)" />
      <Path d="M 66 46 V 66 C 66 82 74 94 84 100" stroke="#FFFFFF" strokeWidth={5} opacity={0.45} fill="none" strokeLinecap="round" />
      {/* stem + base */}
      <Rect x={82} y={110} width={16} height={22} rx={4} fill="url(#gold)" />
      <Rect x={62} y={130} width={56} height={14} rx={7} fill="url(#gold)" />
    </Svg>
  );
}
