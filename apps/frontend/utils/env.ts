// Environment configuration utility
import Constants from 'expo-constants';

const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = Constants.expoConfig?.extra?.[name] || process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value || defaultValue || '';
};

export const ENV = {
  // API Configuration
  API_URL: getEnvVar('EXPO_PUBLIC_API_URL', 'http://localhost:3001/api'),
  API_TIMEOUT: parseInt(getEnvVar('EXPO_PUBLIC_API_TIMEOUT', '10000'), 10),

  // Authentication
  CLERK_PUBLISHABLE_KEY: getEnvVar('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY'),

  // OAuth
  GOOGLE_CLIENT_ID: getEnvVar('EXPO_PUBLIC_GOOGLE_CLIENT_ID', ''),
  GOOGLE_CLIENT_SECRET: getEnvVar('EXPO_PUBLIC_GOOGLE_CLIENT_SECRET', ''),
  FACEBOOK_APP_ID: getEnvVar('EXPO_PUBLIC_FACEBOOK_APP_ID', ''),

  // Maps
  GOOGLE_MAPS_API_KEY: getEnvVar('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY', ''),

  // Deep Linking
  SCHEME: getEnvVar('EXPO_PUBLIC_SCHEME', 'dinnermatch'),

  // Environment
  ENVIRONMENT: getEnvVar('EXPO_PUBLIC_ENVIRONMENT', 'development') as 'development' | 'staging' | 'production',

  // Feature Flags
  ENABLE_SOCIAL_LOGIN: getEnvVar('EXPO_PUBLIC_ENABLE_SOCIAL_LOGIN', 'true') === 'true',
  ENABLE_PUSH_NOTIFICATIONS: getEnvVar('EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS', 'true') === 'true',
  ENABLE_ANALYTICS: getEnvVar('EXPO_PUBLIC_ENABLE_ANALYTICS', 'false') === 'true',
} as const;

// Validate required environment variables
export const validateEnv = (): void => {
  const requiredVars = ['EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY'];

  for (const varName of requiredVars) {
    if (!getEnvVar(varName, undefined)) {
      throw new Error(`Required environment variable ${varName} is not set`);
    }
  }
};

// Check if we're in development mode
export const isDevelopment = ENV.ENVIRONMENT === 'development';
export const isProduction = ENV.ENVIRONMENT === 'production';
export const isStaging = ENV.ENVIRONMENT === 'staging';