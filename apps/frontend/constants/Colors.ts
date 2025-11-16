// DinnerMatch Color System

// Primary Colors
const primary = {
  50: '#E3F2FD',
  100: '#BBDEFB',
  200: '#90CAF9',
  300: '#64B5F6',
  400: '#42A5F5',
  500: '#2196F3', // Main primary
  600: '#1E88E5',
  700: '#1976D2',
  800: '#1565C0',
  900: '#0D47A1',
};

const secondary = {
  50: '#F3E5F5',
  100: '#E1BEE7',
  200: '#CE93D8',
  300: '#BA68C8',
  400: '#AB47BC',
  500: '#9C27B0', // Main secondary
  600: '#8E24AA',
  700: '#7B1FA2',
  800: '#6A1B9A',
  900: '#4A148C',
};

// Semantic Colors
const success = {
  50: '#E8F5E8',
  500: '#4CAF50',
  700: '#388E3C',
};

const warning = {
  50: '#FFF8E1',
  500: '#FF9800',
  700: '#F57C00',
};

const error = {
  50: '#FFEBEE',
  500: '#F44336',
  700: '#D32F2F',
};

const info = {
  50: '#E3F2FD',
  500: '#2196F3',
  700: '#1976D2',
};

// Neutral Colors
const neutral = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#EEEEEE',
  300: '#E0E0E0',
  400: '#BDBDBD',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

// Light Theme
const lightTheme = {
  // Primary
  primary: primary[500],
  primaryLight: primary[300],
  primaryDark: primary[700],

  // Secondary
  secondary: secondary[500],
  secondaryLight: secondary[300],
  secondaryDark: secondary[700],

  // Background
  background: '#FFFFFF',
  backgroundSecondary: neutral[50],
  backgroundTertiary: neutral[100],

  // Surface
  surface: '#FFFFFF',
  surfaceVariant: neutral[100],

  // Text
  text: neutral[900],
  textSecondary: neutral[700],
  textTertiary: neutral[600],
  textDisabled: neutral[400],
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Borders
  border: neutral[200],
  borderLight: neutral[100],
  borderDark: neutral[300],

  // States
  success: success[500],
  successLight: success[50],
  warning: warning[500],
  warningLight: warning[50],
  error: error[500],
  errorLight: error[50],
  info: info[500],
  infoLight: info[50],

  // Navigation
  tint: primary[500],
  tabIconDefault: neutral[400],
  tabIconSelected: primary[500],

  // Shadows
  shadow: '#000000',
  elevation: {
    1: 'rgba(0, 0, 0, 0.05)',
    2: 'rgba(0, 0, 0, 0.1)',
    3: 'rgba(0, 0, 0, 0.15)',
    4: 'rgba(0, 0, 0, 0.2)',
  },
};

// Dark Theme
const darkTheme = {
  // Primary
  primary: primary[400],
  primaryLight: primary[200],
  primaryDark: primary[600],

  // Secondary
  secondary: secondary[400],
  secondaryLight: secondary[200],
  secondaryDark: secondary[600],

  // Background
  background: neutral[900],
  backgroundSecondary: neutral[800],
  backgroundTertiary: neutral[700],

  // Surface
  surface: neutral[800],
  surfaceVariant: neutral[700],

  // Text
  text: '#FFFFFF',
  textSecondary: neutral[200],
  textTertiary: neutral[400],
  textDisabled: neutral[600],
  textOnPrimary: neutral[900],
  textOnSecondary: neutral[900],

  // Borders
  border: neutral[700],
  borderLight: neutral[600],
  borderDark: neutral[800],

  // States
  success: success[500],
  successLight: success[50],
  warning: warning[500],
  warningLight: warning[50],
  error: error[500],
  errorLight: error[50],
  info: info[500],
  infoLight: info[50],

  // Navigation
  tint: primary[400],
  tabIconDefault: neutral[500],
  tabIconSelected: primary[400],

  // Shadows
  shadow: '#000000',
  elevation: {
    1: 'rgba(0, 0, 0, 0.15)',
    2: 'rgba(0, 0, 0, 0.25)',
    3: 'rgba(0, 0, 0, 0.35)',
    4: 'rgba(0, 0, 0, 0.45)',
  },
};

export default {
  light: lightTheme,
  dark: darkTheme,
};

export { primary, secondary, success, warning, error, info, neutral };
