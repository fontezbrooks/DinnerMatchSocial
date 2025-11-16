import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}) => {
  const theme = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;

    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textDisabled;

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return theme.colors.textOnPrimary;
      case 'outline':
        return theme.colors.primary;
      case 'ghost':
        return theme.colors.text;
      default:
        return theme.colors.textOnPrimary;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.border;

    switch (variant) {
      case 'outline':
        return theme.colors.primary;
      case 'danger':
        return theme.colors.error;
      default:
        return 'transparent';
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 36;
      case 'medium':
        return 44;
      case 'large':
        return 52;
      default:
        return 44;
    }
  };

  const getPaddingHorizontal = () => {
    switch (size) {
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

  const getTypographyStyle = () => {
    switch (size) {
      case 'small':
        return theme.typography.button.small;
      case 'medium':
        return theme.typography.button.medium;
      case 'large':
        return theme.typography.button.large;
      default:
        return theme.typography.button.medium;
    }
  };

  const buttonStyle: ViewStyle = {
    height: getHeight(),
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: variant === 'outline' ? 1 : 0,
    borderRadius: theme.semanticBorderRadius.button,
    paddingHorizontal: getPaddingHorizontal(),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
    gap: theme.semanticSpacing.sm,
  };

  const textStyleResolved: TextStyle = {
    ...getTypographyStyle(),
    color: getTextColor(),
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
        />
      )}
      {!loading && icon && icon}
      <Text style={[textStyleResolved, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};