// DinnerMatch Spacing System

// Base spacing unit (4px)
const BASE_UNIT = 4;

// Spacing Scale
export const spacing = {
  0: 0,
  1: BASE_UNIT * 1, // 4px
  2: BASE_UNIT * 2, // 8px
  3: BASE_UNIT * 3, // 12px
  4: BASE_UNIT * 4, // 16px
  5: BASE_UNIT * 5, // 20px
  6: BASE_UNIT * 6, // 24px
  7: BASE_UNIT * 7, // 28px
  8: BASE_UNIT * 8, // 32px
  10: BASE_UNIT * 10, // 40px
  12: BASE_UNIT * 12, // 48px
  16: BASE_UNIT * 16, // 64px
  20: BASE_UNIT * 20, // 80px
  24: BASE_UNIT * 24, // 96px
  32: BASE_UNIT * 32, // 128px
} as const;

// Semantic Spacing
export const semanticSpacing = {
  // Component Internal Spacing
  xs: spacing[1], // 4px - tight spacing within components
  sm: spacing[2], // 8px - small internal spacing
  md: spacing[4], // 16px - medium internal spacing
  lg: spacing[6], // 24px - large internal spacing
  xl: spacing[8], // 32px - extra large internal spacing

  // Layout Spacing
  layoutXs: spacing[3], // 12px - minimal layout spacing
  layoutSm: spacing[4], // 16px - small layout spacing
  layoutMd: spacing[6], // 24px - medium layout spacing
  layoutLg: spacing[8], // 32px - large layout spacing
  layoutXl: spacing[12], // 48px - extra large layout spacing

  // Screen Padding
  screenPadding: spacing[5], // 20px - standard screen padding
  screenPaddingLarge: spacing[6], // 24px - large screen padding

  // Component Gaps
  cardGap: spacing[3], // 12px - gap between cards
  listGap: spacing[4], // 16px - gap between list items
  sectionGap: spacing[6], // 24px - gap between sections
} as const;

// Border Radius
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

// Semantic Border Radius
export const semanticBorderRadius = {
  button: borderRadius.lg,
  card: borderRadius.xl,
  input: borderRadius.md,
  badge: borderRadius.full,
  modal: borderRadius['2xl'],
  avatar: borderRadius.full,
} as const;

// Icon Sizes
export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Avatar Sizes
export const avatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
  '2xl': 64,
  '3xl': 80,
} as const;

// Button Heights
export const buttonHeight = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
} as const;

// Input Heights
export const inputHeight = {
  sm: 36,
  md: 44,
  lg: 52,
} as const;

export type SpacingKey = keyof typeof spacing;
export type SemanticSpacingKey = keyof typeof semanticSpacing;