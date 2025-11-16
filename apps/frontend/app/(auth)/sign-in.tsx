import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { StyleSheet, ScrollView, View, Text, Alert } from "react-native";
import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";

import { Button, Input, Card, LoadingSpinner, ErrorMessage } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import { ENV } from "@/utils/env";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startFacebookOAuth } = useOAuth({ strategy: "oauth_facebook" });
  const router = useRouter();
  const theme = useTheme();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(home)");
      } else {
        setError("Sign-in incomplete. Please check your credentials.");
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "An error occurred during sign-in";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    if (!ENV.ENABLE_SOCIAL_LOGIN) {
      Alert.alert("Social Login", "Social login is currently disabled");
      return;
    }

    try {
      const { createdSessionId, setActive } = await startGoogleOAuth();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace("/(home)");
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "Google sign-in failed";
      setError(errorMessage);
    }
  };

  const onFacebookSignIn = async () => {
    if (!ENV.ENABLE_SOCIAL_LOGIN) {
      Alert.alert("Social Login", "Social login is currently disabled");
      return;
    }

    try {
      const { createdSessionId, setActive } = await startFacebookOAuth();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace("/(home)");
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "Facebook sign-in failed";
      setError(errorMessage);
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner center message="Loading..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome Back
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Sign in to continue planning amazing dinners
        </Text>
      </View>

      <Card style={styles.formCard} variant="elevated" padding="large">
        {error && (
          <ErrorMessage
            message={error}
            variant="banner"
            onDismiss={() => setError(null)}
          />
        )}

        <Input
          label="Email"
          placeholder="Enter your email"
          value={emailAddress}
          onChangeText={setEmailAddress}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          leftIcon={
            <FontAwesome
              name="envelope-o"
              size={20}
              color={theme.colors.textTertiary}
            />
          }
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          showPasswordToggle
          leftIcon={
            <FontAwesome
              name="lock"
              size={20}
              color={theme.colors.textTertiary}
            />
          }
        />

        <Button
          title="Sign In"
          onPress={onSignInPress}
          loading={isLoading}
          disabled={!emailAddress || !password}
          fullWidth
          style={styles.signInButton}
        />

        {ENV.ENABLE_SOCIAL_LOGIN && (
          <>
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textTertiary }]}>
                or continue with
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>

            <View style={styles.socialButtons}>
              <Button
                title="Google"
                onPress={onGoogleSignIn}
                variant="outline"
                style={styles.socialButton}
                icon={
                  <FontAwesome name="google" size={20} color={theme.colors.text} />
                }
              />

              <Button
                title="Facebook"
                onPress={onFacebookSignIn}
                variant="outline"
                style={styles.socialButton}
                icon={
                  <FontAwesome name="facebook" size={20} color={theme.colors.text} />
                }
              />
            </View>
          </>
        )}
      </Card>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Don't have an account?{" "}
        </Text>
        <Link href="/(auth)/sign-up" style={[styles.link, { color: theme.colors.primary }]}>
          Sign up
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    marginBottom: 24,
  },
  signInButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
  },
});
