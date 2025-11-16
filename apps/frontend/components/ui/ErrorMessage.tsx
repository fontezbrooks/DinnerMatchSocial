import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryButtonText?: string;
  variant?: 'inline' | 'banner' | 'card';
  showIcon?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryButtonText = 'Try Again',
  variant = 'card',
  showIcon = true,
  style,
  titleStyle,
  messageStyle,
  onDismiss,
}) => {
  const theme = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'inline':
        return 'transparent';
      case 'banner':
        return theme.colors.errorLight;
      case 'card':
        return theme.colors.errorLight;
      default:
        return theme.colors.errorLight;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'inline':
        return 'transparent';
      case 'banner':
      case 'card':
        return theme.colors.error + '30'; // 20% opacity
      default:
        return theme.colors.error + '30';
    }
  };

  const getPadding = () => {
    switch (variant) {
      case 'inline':
        return 0;
      case 'banner':
        return theme.semanticSpacing.md;
      case 'card':
        return theme.semanticSpacing.lg;
      default:
        return theme.semanticSpacing.lg;
    }
  };

  const getBorderRadius = () => {
    switch (variant) {
      case 'inline':
        return 0;
      case 'banner':
        return theme.semanticBorderRadius.input;
      case 'card':
        return theme.semanticBorderRadius.card;
      default:
        return theme.semanticBorderRadius.card;
    }
  };

  const containerStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: variant === 'inline' ? 0 : 1,
    borderRadius: getBorderRadius(),
    padding: getPadding(),
    flexDirection: 'row',
    alignItems: 'flex-start',
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    marginLeft: showIcon ? theme.semanticSpacing.md : 0,
  };

  const titleTextStyle: TextStyle = {
    ...theme.typography.label.medium,
    color: theme.colors.error,
    marginBottom: theme.semanticSpacing.xs,
  };

  const messageTextStyle: TextStyle = {
    ...theme.typography.body.small,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.body.small.lineHeight * 1.2,
  };

  const buttonContainerStyle: ViewStyle = {
    flexDirection: 'row',
    marginTop: theme.semanticSpacing.md,
    gap: theme.semanticSpacing.md,
  };

  const retryButtonStyle: ViewStyle = {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.semanticSpacing.lg,
    paddingVertical: theme.semanticSpacing.sm,
    borderRadius: theme.semanticBorderRadius.button,
  };

  const dismissButtonStyle: ViewStyle = {
    backgroundColor: 'transparent',
    paddingHorizontal: theme.semanticSpacing.lg,
    paddingVertical: theme.semanticSpacing.sm,
    borderRadius: theme.semanticBorderRadius.button,
    borderWidth: 1,
    borderColor: theme.colors.error,
  };

  const retryButtonTextStyle: TextStyle = {
    ...theme.typography.button.small,
    color: theme.colors.textOnPrimary,
  };

  const dismissButtonTextStyle: TextStyle = {
    ...theme.typography.button.small,
    color: theme.colors.error,
  };

  return (
    <View style={[containerStyle, style]}>
      {showIcon && (
        <FontAwesome
          name="exclamation-triangle"
          size={20}
          color={theme.colors.error}
        />
      )}

      <View style={contentStyle}>
        <Text style={[titleTextStyle, titleStyle]}>{title}</Text>
        <Text style={[messageTextStyle, messageStyle]}>{message}</Text>

        {(onRetry || onDismiss) && (
          <View style={buttonContainerStyle}>
            {onRetry && (
              <TouchableOpacity style={retryButtonStyle} onPress={onRetry}>
                <Text style={retryButtonTextStyle}>{retryButtonText}</Text>
              </TouchableOpacity>
            )}

            {onDismiss && (
              <TouchableOpacity style={dismissButtonStyle} onPress={onDismiss}>
                <Text style={dismissButtonTextStyle}>Dismiss</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};