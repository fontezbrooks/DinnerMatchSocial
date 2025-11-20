import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

import { useColorScheme } from '@/components/useColorScheme';
import { ENV } from '@/utils/env';
import { useDeepLinking } from '@/hooks/useDeepLinking';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthStateManager } from '@/components/auth/AuthStateManager';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function InitialLayout() {
  const { isLoaded, isSignedIn, user } = useAuth();
  const colorScheme = useColorScheme();

  // Initialize deep linking
  useDeepLinking();

  // Show loading screen while Clerk loads
  if (!isLoaded) {
    return null;
  }

  // Additional check: If Clerk says signed in but no user object, force sign out
  const shouldShowAuth = !isSignedIn || !user;

  return (
    <ThemeProvider colorScheme={colorScheme}>
      <AuthStateManager />
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {shouldShowAuth ? (
            // Unauthenticated stack
            <Stack.Screen name="(auth)" />
          ) : (
            // Authenticated stack
            <Stack.Screen name="(home)" />
          )}
        </Stack>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={ENV.CLERK_PUBLISHABLE_KEY}>
      <InitialLayout />
    </ClerkProvider>
  );
}
