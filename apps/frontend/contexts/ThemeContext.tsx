// DinnerMatch Theme Context
import React, { createContext, useContext, ReactNode } from 'react';
import { ColorSchemeName, useColorScheme as useNativeColorScheme } from 'react-native';

import Colors from '@/constants/Colors';
import { typography } from '@/constants/Typography';
import { spacing, semanticSpacing, borderRadius, semanticBorderRadius } from '@/constants/Spacing';

// Theme interface
interface Theme {
  colors: typeof Colors.light;
  typography: typeof typography;
  spacing: typeof spacing;
  semanticSpacing: typeof semanticSpacing;
  borderRadius: typeof borderRadius;
  semanticBorderRadius: typeof semanticBorderRadius;
  isDark: boolean;
}

// Theme context
const ThemeContext = createContext<Theme | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  colorScheme?: ColorSchemeName;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  colorScheme: forcedColorScheme
}) => {
  const systemColorScheme = useNativeColorScheme();
  const colorScheme = forcedColorScheme ?? systemColorScheme ?? 'light';
  const isDark = colorScheme === 'dark';

  const theme: Theme = {
    colors: Colors[colorScheme],
    typography,
    spacing,
    semanticSpacing,
    borderRadius,
    semanticBorderRadius,
    isDark,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = (): Theme => {
  const theme = useContext(ThemeContext);

  if (theme === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return theme;
};

// Hook to get themed styles
export const useThemedStyles = <T>(
  createStyles: (theme: Theme) => T
): T => {
  const theme = useTheme();
  return createStyles(theme);
};

// Utility function to create themed styles
export const createThemedStyles = <T>(
  createStyles: (theme: Theme) => T
) => {
  return createStyles;
};