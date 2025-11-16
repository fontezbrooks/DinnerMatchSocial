import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Text, Alert } from "react-native";
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

import { Button, Input, Card, LoadingSpinner, ErrorMessage } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import { ENV } from "@/utils/env";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startFacebookOAuth } = useOAuth({ strategy: "oauth_facebook" });
  const router = useRouter();
  const theme = useTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name");
      return false;
    }
    if (!emailAddress.trim()) {
      setError("Please enter your email address");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const onSignUpPress = async () => {
    if (!isLoaded || !validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "An error occurred during sign-up";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || !verificationCode.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(auth)/onboarding");
      } else {
        setError("Verification failed. Please check your code and try again.");
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "Verification failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSignUp = async () => {
    if (!ENV.ENABLE_SOCIAL_LOGIN) {
      Alert.alert("Social Login", "Social login is currently disabled");
      return;
    }

    try {
      const { createdSessionId, setActive } = await startGoogleOAuth();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace("/(auth)/onboarding");
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "Google sign-up failed";
      setError(errorMessage);
    }
  };

  const onFacebookSignUp = async () => {
    if (!ENV.ENABLE_SOCIAL_LOGIN) {
      Alert.alert("Social Login", "Social login is currently disabled");
      return;
    }

    try {
      const { createdSessionId, setActive } = await startFacebookOAuth();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace("/(auth)/onboarding");
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "Facebook sign-up failed";
      setError(errorMessage);
    }
  };

  const resendVerificationCode = async () => {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert("Code Sent", "A new verification code has been sent to your email");
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "Failed to resend code";
      setError(errorMessage);
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner center message="Loading..." />;
  }

  if (pendingVerification) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Check Your Email
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            We sent a verification code to{"\n"}{emailAddress}
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
            label="Verification Code"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="numeric"
            maxLength={6}
            leftIcon={
              <FontAwesome
                name="key"
                size={20}
                color={theme.colors.textTertiary}
              />
            }
          />

          <Button
            title="Verify Email"
            onPress={onVerifyPress}
            loading={isLoading}
            disabled={verificationCode.length !== 6}
            fullWidth
          />

          <Button
            title="Resend Code"
            onPress={resendVerificationCode}
            variant="ghost"
            style={styles.resendButton}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Wrong email?{" "}
          </Text>
          <Text
            style={[styles.link, { color: theme.colors.primary }]}
            onPress={() => setPendingVerification(false)}
          >
            Go back
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Join DinnerMatch to start planning amazing meals with friends
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

        <View style={styles.nameRow}>
          <Input
            label="First Name"
            placeholder="First name"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.nameInput}
            leftIcon={
              <FontAwesome
                name="user-o"
                size={20}
                color={theme.colors.textTertiary}
              />
            }
          />

          <Input
            label="Last Name"
            placeholder="Last name"
            value={lastName}
            onChangeText={setLastName}
            style={styles.nameInput}
          />
        </View>

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
          placeholder="Create a password"
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

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          leftIcon={
            <FontAwesome
              name="lock"
              size={20}
              color={theme.colors.textTertiary}
            />
          }
        />

        <Button
          title="Create Account"
          onPress={onSignUpPress}
          loading={isLoading}
          disabled={!firstName || !lastName || !emailAddress || !password || !confirmPassword}
          fullWidth
          style={styles.signUpButton}
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
                onPress={onGoogleSignUp}
                variant="outline"
                style={styles.socialButton}
                icon={
                  <FontAwesome name="google" size={20} color={theme.colors.text} />
                }
              />

              <Button
                title="Facebook"
                onPress={onFacebookSignUp}
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
          Already have an account?{" "}
        </Text>
        <Link href="/(auth)/sign-in" style={[styles.link, { color: theme.colors.primary }]}>
          Sign in
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  signUpButton: {
    marginTop: 8,
  },
  resendButton: {
    marginTop: 16,
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