import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

import { useColorScheme } from "@/components/useColorScheme";
import { ENV } from "@/utils/env";
import { useDeepLinking } from "@/hooks/useDeepLinking";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
  const { isLoaded, isSignedIn } = useAuth();
  const colorScheme = useColorScheme();

  // Initialize deep linking
  useDeepLinking();

  // Show loading screen while Clerk loads
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isSignedIn ? (
          // Authenticated stack
          <>
            <Stack.Screen name="(home)" />
            <Stack.Screen name="modal" options={{
              presentation: "modal",
              headerShown: true,
              title: "Details"
            }} />
          </>
        ) : (
          // Unauthenticated stack
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={ENV.CLERK_PUBLISHABLE_KEY}
    >
      <InitialLayout />
    </ClerkProvider>
  );
}
