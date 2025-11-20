import { useEffect } from 'react';
import { useClerk, useAuth } from '@clerk/clerk-expo';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const AuthStateManager = () => {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, user } = useAuth();

  useEffect(() => {
    const checkAuthConsistency = async () => {
      if (!isLoaded) return;

      // If Clerk says signed in but no user object, clear auth state
      if (isSignedIn && !user) {
        try {
          await signOut();
          await SecureStore.deleteItemAsync('socket_token');
          console.log('Cleared inconsistent auth state');
        } catch (error) {
          console.error('Failed to clear auth state:', error);
        }
      }
    };

    checkAuthConsistency();
  }, [isLoaded, isSignedIn, user, signOut]);

  return null; // This component doesn't render anything
};

export const clearAllAuthState = async (): Promise<void> => {
  try {
    // Clear Clerk session
    const { signOut } = useClerk();
    await signOut();

    // Clear stored tokens
    await SecureStore.deleteItemAsync('socket_token');
    await SecureStore.deleteItemAsync('auth_token');

    console.log('All auth state cleared');
  } catch (error) {
    console.error('Error clearing auth state:', error);
    throw error;
  }
};