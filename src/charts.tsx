import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { C } from "./ui";
export function Gauge({
  value = 85,
  size = 150,
}: {
  value?: number;
  size?: number;
}) {
  const r = 58,
    c = 2 * Math.PI * r,
    dash = (c * value) / 100;
  return (
    <Svg width={size} height={size} viewBox="0 0 150 150">
      <Circle
        cx="75"
        cy="75"
        r={r}
        fill="none"
        stroke="#E7EBF0"
        strokeWidth="10"
      />
      <Circle
        cx="75"
        cy="75"
        r={r}
        fill="none"
        stroke={C.blue}
        strokeWidth="10"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        rotation="-90"
        origin="75,75"
      />
      <SvgText
        x="75"
        y="73"
        textAnchor="middle"
        fontSize="31"
        fontWeight="700"
        fill={C.text}
      >
        {value}
      </SvgText>
      <SvgText x="75" y="94" textAnchor="middle" fontSize="10" fill={C.muted}>
        / 100
      </SvgText>
      <SvgText x="75" y="112" textAnchor="middle" fontSize="9" fill={C.green}>
        ↗ STABLE
      </SvgText>
    </Svg>
  );
}
export function FlexChart({
  values = [38, 45, 59, 64, 58, 44, 52, 72, 81, 43, 38, 68, 91, 35, 48],
}: {
  values?: number[];
}) {
  const w = 310,
    h = 126,
    points = values
      .map(
        (v, i) =>
          `${i ? "L" : "M"} ${(i * w) / (values.length - 1)} ${h - (v / 100) * h}`,
      )
      .join(" ");
  return (
    <Svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <Rect width={w} height={h} fill="#F4F7FC" rx="9" />
      <Line
        x1="0"
        y1={h * 0.25}
        x2={w}
        y2={h * 0.25}
        stroke="#F0A928"
        strokeDasharray="4 4"
      />
      <Path
        d={points}
        fill="none"
        stroke={C.blue}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <SvgText x="5" y="13" fontSize="8" fill={C.amber}>
        SEUIL DE SÉCURITÉ*
      </SvgText>
    </Svg>
  );
}
export function ImpactChart({
  values = [1.2, 1.8, 2.1, 2.8, 1.9, 1.6, 2.1],
}: {
  values?: number[];
}) {
  const w = 310,
    h = 80,
    bw = 28,
    gap = 14;
  return (
    <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
      <Line x1="0" y1={h - 15} x2={w} y2={h - 15} stroke="#E9EEF5" />
      {values.map((v, i) => (
        <>
          <Rect
            key={`r${i}`}
            x={8 + i * (bw + gap)}
            y={h - 20 - v * 17}
            width={bw}
            height={v * 17}
            rx="3"
            fill={v > 2.5 ? C.amber : v > 2 ? C.green : "#C9DAFF"}
          />
          <SvgText
            key={`t${i}`}
            x={22 + i * (bw + gap)}
            y={h - 4}
            textAnchor="middle"
            fontSize="8"
            fill={C.muted}
          >
            {v.toFixed(1)}
          </SvgText>
        </>
      ))}
    </Svg>
  );
}
