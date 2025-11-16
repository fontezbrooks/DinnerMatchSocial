// DinnerMatch Typography System

// Font Families
export const fontFamilies = {
  primary: 'System', // iOS: San Francisco, Android: Roboto
  mono: 'SpaceMono',
} as const;

// Font Sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 64,
} as const;

// Font Weights
export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// Line Heights
export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

// Typography Styles
export const typography = {
  // Display Styles (Headers)
  display: {
    large: {
      fontSize: fontSize['5xl'],
      lineHeight: fontSize['5xl'] * lineHeight.tight,
      fontWeight: fontWeight.bold,
      fontFamily: fontFamilies.primary,
    },
    medium: {
      fontSize: fontSize['4xl'],
      lineHeight: fontSize['4xl'] * lineHeight.tight,
      fontWeight: fontWeight.bold,
      fontFamily: fontFamilies.primary,
    },
    small: {
      fontSize: fontSize['3xl'],
      lineHeight: fontSize['3xl'] * lineHeight.tight,
      fontWeight: fontWeight.bold,
      fontFamily: fontFamilies.primary,
    },
  },

  // Heading Styles
  heading: {
    h1: {
      fontSize: fontSize['2xl'],
      lineHeight: fontSize['2xl'] * lineHeight.tight,
      fontWeight: fontWeight.bold,
      fontFamily: fontFamilies.primary,
    },
    h2: {
      fontSize: fontSize.xl,
      lineHeight: fontSize.xl * lineHeight.tight,
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamilies.primary,
    },
    h3: {
      fontSize: fontSize.lg,
      lineHeight: fontSize.lg * lineHeight.normal,
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamilies.primary,
    },
    h4: {
      fontSize: fontSize.base,
      lineHeight: fontSize.base * lineHeight.normal,
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamilies.primary,
    },
  },

  // Body Text Styles
  body: {
    large: {
      fontSize: fontSize.lg,
      lineHeight: fontSize.lg * lineHeight.normal,
      fontWeight: fontWeight.normal,
      fontFamily: fontFamilies.primary,
    },
    medium: {
      fontSize: fontSize.base,
      lineHeight: fontSize.base * lineHeight.normal,
      fontWeight: fontWeight.normal,
      fontFamily: fontFamilies.primary,
    },
    small: {
      fontSize: fontSize.sm,
      lineHeight: fontSize.sm * lineHeight.normal,
      fontWeight: fontWeight.normal,
      fontFamily: fontFamilies.primary,
    },
  },

  // Caption Styles
  caption: {
    large: {
      fontSize: fontSize.sm,
      lineHeight: fontSize.sm * lineHeight.normal,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamilies.primary,
    },
    medium: {
      fontSize: fontSize.xs,
      lineHeight: fontSize.xs * lineHeight.normal,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamilies.primary,
    },
    small: {
      fontSize: 10,
      lineHeight: 10 * lineHeight.normal,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamilies.primary,
    },
  },

  // Button Styles
  button: {
    large: {
      fontSize: fontSize.lg,
      lineHeight: fontSize.lg * lineHeight.tight,
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamilies.primary,
    },
    medium: {
      fontSize: fontSize.base,
      lineHeight: fontSize.base * lineHeight.tight,
      fontWeight: fontWeight.semibold,
      fontFamily: fontFamilies.primary,
    },
    small: {
      fontSize: fontSize.sm,
      lineHeight: fontSize.sm * lineHeight.tight,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamilies.primary,
    },
  },

  // Label Styles
  label: {
    large: {
      fontSize: fontSize.base,
      lineHeight: fontSize.base * lineHeight.normal,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamilies.primary,
    },
    medium: {
      fontSize: fontSize.sm,
      lineHeight: fontSize.sm * lineHeight.normal,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamilies.primary,
    },
    small: {
      fontSize: fontSize.xs,
      lineHeight: fontSize.xs * lineHeight.normal,
      fontWeight: fontWeight.medium,
      fontFamily: fontFamilies.primary,
    },
  },
} as const;

export type TypographyStyle = keyof typeof typography;
export type TypographyVariant<T extends TypographyStyle> = keyof typeof typography[T];