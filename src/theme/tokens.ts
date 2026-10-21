/**
 * Central design tokens. Every colour, spacing, radius and type style used by
 * the UI comes from here — screens and components never hard-code values.
 *
 * Rules:
 *  - 8 pt grid (4 pt allowed for tight spacing).
 *  - One accent colour. The semantic colours (ok / warn / danger) are
 *    reserved for the alert level and must not be used as decoration.
 *  - Contrast: text colours are >= 4.5:1 against their surface.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/** Minimum touch target (Apple HIG). */
export const MIN_TOUCH = 44;

export type ColorTokens = {
  /** Screen background. */
  background: string;
  /** Cards / grouped surfaces. */
  surface: string;
  /** Surface nested inside a card. */
  surfaceRaised: string;
  separator: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  /** The single brand accent. */
  accent: string;
  /** Text/icon colour drawn on top of `accent`. */
  onAccent: string;
  accentSoft: string;
  /** Lighter tint of the accent, used as the end of accent gradients. */
  accentLight: string;
  /** Semantic alert colours (alert level only). */
  alertOk: string;
  alertWarn: string;
  alertDanger: string;
  alertOkSoft: string;
  alertWarnSoft: string;
  alertDangerSoft: string;
  /** Neutral "no data" colour used for stale / disconnected states. */
  stale: string;
  shadow: string;
  blurTint: 'dark' | 'light';
};

export const darkColors: ColorTokens = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceRaised: '#2C2C2E',
  separator: 'rgba(84,84,88,0.65)',
  text: '#FFFFFF',
  textSecondary: 'rgba(235,235,245,0.64)',
  textTertiary: 'rgba(235,235,245,0.38)',
  accent: '#3DB5FF',
  onAccent: '#001B2E',
  accentSoft: 'rgba(61,181,255,0.16)',
  accentLight: '#8CF3FF',
  alertOk: '#32D74B',
  alertWarn: '#FF9F0A',
  alertDanger: '#FF453A',
  alertOkSoft: 'rgba(50,215,75,0.16)',
  alertWarnSoft: 'rgba(255,159,10,0.18)',
  alertDangerSoft: 'rgba(255,69,58,0.20)',
  stale: '#8E8E93',
  shadow: '#000000',
  blurTint: 'dark',
};

export const lightColors: ColorTokens = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceRaised: '#F2F2F7',
  separator: 'rgba(60,60,67,0.18)',
  text: '#000000',
  textSecondary: 'rgba(60,60,67,0.68)',
  textTertiary: 'rgba(60,60,67,0.40)',
  accent: '#0072C6',
  onAccent: '#FFFFFF',
  accentSoft: 'rgba(0,114,198,0.12)',
  accentLight: '#35B6FF',
  alertOk: '#1F8A3B',
  alertWarn: '#B86E00',
  alertDanger: '#D70015',
  alertOkSoft: 'rgba(31,138,59,0.14)',
  alertWarnSoft: 'rgba(184,110,0,0.14)',
  alertDangerSoft: 'rgba(215,0,21,0.12)',
  stale: '#6C6C70',
  shadow: '#1B2A44',
  blurTint: 'light',
};

/** System font family; iOS = SF Pro, Android = Roboto. No custom font. */
export type TextStyleName =
  | 'largeTitle'
  | 'title'
  | 'headline'
  | 'body'
  | 'callout'
  | 'caption'
  | 'metric'
  | 'metricSmall';

export type TextStyleToken = {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  letterSpacing?: number;
  fontVariant?: 'tabular-nums'[];
};

export const typography: Record<TextStyleName, TextStyleToken> = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: 0.4 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: 0.3 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400' },
  callout: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  // Big live values: tabular digits so numbers do not jitter between frames.
  metric: { fontSize: 40, lineHeight: 46, fontWeight: '700', fontVariant: ['tabular-nums'] },
  metricSmall: { fontSize: 28, lineHeight: 34, fontWeight: '700', fontVariant: ['tabular-nums'] },
};

/** Cap for Dynamic Type so dense live layouts stay usable. */
export const MAX_FONT_SCALE = 1.4;

export const motion = {
  /** Subtle spring used for presses, gauge and banner changes. */
  spring: { damping: 18, stiffness: 190, mass: 1 },
  springSoft: { damping: 22, stiffness: 120, mass: 1 },
  fast: 160,
  base: 280,
} as const;

export const shadows = {
  card: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
} as const;

/** Reward palette: used only for badges, trophies and celebration moments. */
export const reward = {
  gold: ['#FFD66B', '#F5A524'] as [string, string],
  warm: ['#FFB199', '#FF6B4A'] as [string, string],
};
