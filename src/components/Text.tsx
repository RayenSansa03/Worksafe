import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { MAX_FONT_SCALE, typography, useTheme, type TextStyleName } from '@/theme';

export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'onAccent';

export type TextProps = RNTextProps & {
  variant?: TextStyleName;
  tone?: TextTone;
};

/** Themed text. Honours Dynamic Type up to MAX_FONT_SCALE. */
export function Text({ variant = 'body', tone = 'primary', style, ...rest }: TextProps) {
  const { colors } = useTheme();
  const color = {
    primary: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    accent: colors.accent,
    onAccent: colors.onAccent,
  }[tone];

  return (
    <RNText
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      {...rest}
      style={[typography[variant], { color }, style]}
    />
  );
}
