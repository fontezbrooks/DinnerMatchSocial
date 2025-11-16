import React, { useState } from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  size?: 'small' | 'medium' | 'large';
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  size = 'medium',
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  showPasswordToggle = false,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const getHeight = () => {
    if (multiline) {
      return numberOfLines * 20 + theme.semanticSpacing.lg;
    }
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

  const getTypographyStyle = () => {
    switch (size) {
      case 'small':
        return theme.typography.body.small;
      case 'medium':
        return theme.typography.body.medium;
      case 'large':
        return theme.typography.body.large;
      default:
        return theme.typography.body.medium;
    }
  };

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.surfaceVariant;
    return theme.colors.surface;
  };

  const containerStyle: ViewStyle = {
    marginBottom: theme.semanticSpacing.md,
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    backgroundColor: getBackgroundColor(),
    borderWidth: 1,
    borderColor: getBorderColor(),
    borderRadius: theme.semanticBorderRadius.input,
    paddingHorizontal: theme.semanticSpacing.md,
    paddingVertical: multiline ? theme.semanticSpacing.md : 0,
    height: multiline ? undefined : getHeight(),
    minHeight: multiline ? getHeight() : undefined,
  };

  const textInputStyle: TextStyle = {
    flex: 1,
    ...getTypographyStyle(),
    color: disabled ? theme.colors.textDisabled : theme.colors.text,
    textAlignVertical: multiline ? 'top' : 'center',
  };

  const labelStyle: TextStyle = {
    ...theme.typography.label.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.semanticSpacing.xs,
  };

  const errorStyle: TextStyle = {
    ...theme.typography.caption.medium,
    color: theme.colors.error,
    marginTop: theme.semanticSpacing.xs,
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const actualSecureTextEntry = showPasswordToggle
    ? !isPasswordVisible
    : secureTextEntry;

  const actualRightIcon = showPasswordToggle ? (
    <TouchableOpacity onPress={togglePasswordVisibility}>
      <FontAwesome
        name={isPasswordVisible ? 'eye' : 'eye-slash'}
        size={20}
        color={theme.colors.textTertiary}
      />
    </TouchableOpacity>
  ) : rightIcon;

  return (
    <View style={[containerStyle, style]}>
      {label && <Text style={labelStyle}>{label}</Text>}

      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={{ marginRight: theme.semanticSpacing.sm }}>
            {leftIcon}
          </View>
        )}

        <TextInput
          style={[textInputStyle, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          secureTextEntry={actualSecureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
        />

        {actualRightIcon && (
          <View style={{ marginLeft: theme.semanticSpacing.sm }}>
            {actualRightIcon}
          </View>
        )}
      </View>

      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};