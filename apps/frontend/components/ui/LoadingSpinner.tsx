import React from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  center?: boolean;
  overlay?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  message,
  center = false,
  overlay = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();

  const spinnerColor = color || theme.colors.primary;

  const containerStyle: ViewStyle = {
    ...(center && {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    }),
    ...(overlay && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background + '80', // 50% opacity
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }),
  };

  const messageStyle: TextStyle = {
    ...theme.typography.body.medium,
    color: theme.colors.textSecondary,
    marginTop: theme.semanticSpacing.md,
    textAlign: 'center',
  };

  return (
    <View style={[containerStyle, style]}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <Text style={[messageStyle, textStyle]}>{message}</Text>
      )}
    </View>
  );
};