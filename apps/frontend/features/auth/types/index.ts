// Auth-specific types

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OnboardingData {
  dietaryRestrictions: string[];
  energyLevel: 'low' | 'medium' | 'high';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}

export interface OAuthProvider {
  provider: 'google' | 'facebook';
  token: string;
}