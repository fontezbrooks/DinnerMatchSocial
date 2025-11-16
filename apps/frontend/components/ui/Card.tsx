import React from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding = 'medium',
  style,
  disabled = false,
}) => {
  const theme = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return theme.semanticSpacing.md;
      case 'medium':
        return theme.semanticSpacing.lg;
      case 'large':
        return theme.semanticSpacing.xl;
      default:
        return theme.semanticSpacing.lg;
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.surfaceVariant;
    return theme.colors.surface;
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'outlined':
        return theme.colors.border;
      default:
        return 'transparent';
    }
  };

  const getShadowStyle = () => {
    if (variant === 'elevated') {
      return {
        shadowColor: theme.colors.shadow,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      };
    }
    return {};
  };

  const cardStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: theme.semanticBorderRadius.card,
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: getBorderColor(),
    padding: getPadding(),
    opacity: disabled ? 0.6 : 1,
    ...getShadowStyle(),
  };

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};