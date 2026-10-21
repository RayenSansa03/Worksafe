import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

type KneeIllustrationProps = {
  size?: number;
  /** Knee flexion drawn in the picture (deg). */
  angle?: number;
  /** Draw the two sensor modules (thigh + tibia). */
  showSensors?: boolean;
};

/**
 * Vector illustration of a leg with the two sensor modules. Colours come
 * from the theme so it works in dark and light mode.
 */
export function KneeIllustration({ size = 200, angle = 25, showSensors = true }: KneeIllustrationProps) {
  const { colors } = useTheme();
  const knee = { x: 100, y: 100 };
  const len = 70;
  const rad = (d: number) => (d * Math.PI) / 180;
  // Thigh goes up-left from the knee, tibia goes down, flexed by `angle`.
  const thigh = { x: knee.x - len * Math.sin(rad(8)), y: knee.y - len * Math.cos(rad(8)) };
  const tibia = { x: knee.x + len * Math.sin(rad(angle - 8)), y: knee.y + len * Math.cos(rad(angle - 8)) };
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });
  const s1 = mid(knee, thigh, 0.55);
  const s2 = mid(knee, tibia, 0.55);
  const tAngle = (Math.atan2(tibia.y - knee.y, tibia.x - knee.x) * 180) / Math.PI;
  const hAngle = (Math.atan2(thigh.y - knee.y, thigh.x - knee.x) * 180) / Math.PI;

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityLabel="Schéma d'une jambe avec deux capteurs" accessible>
      <Defs>
        <LinearGradient id="limb" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.accentLight} />
          <Stop offset="1" stopColor={colors.accent} />
        </LinearGradient>
      </Defs>
      <Circle cx={100} cy={100} r={92} fill={colors.accentSoft} />
      <Path
        d={`M ${thigh.x} ${thigh.y} L ${knee.x} ${knee.y} L ${tibia.x} ${tibia.y}`}
        stroke="url(#limb)"
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={knee.x} cy={knee.y} r={15} fill={colors.surface} stroke="url(#limb)" strokeWidth={4} />
      {showSensors ? (
        <>
          <G rotation={hAngle + 90} origin={`${s1.x}, ${s1.y}`}>
            <Rect x={s1.x - 13} y={s1.y - 8} width={26} height={16} rx={5} fill={colors.surface} stroke={colors.text} strokeWidth={2} />
            <Circle cx={s1.x} cy={s1.y} r={2.5} fill={colors.accent} />
          </G>
          <G rotation={tAngle + 90} origin={`${s2.x}, ${s2.y}`}>
            <Rect x={s2.x - 13} y={s2.y - 8} width={26} height={16} rx={5} fill={colors.surface} stroke={colors.text} strokeWidth={2} />
            <Circle cx={s2.x} cy={s2.y} r={2.5} fill={colors.accent} />
          </G>
        </>
      ) : null}
    </Svg>
  );
}
