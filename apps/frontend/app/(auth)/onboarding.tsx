import { StyleSheet, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleComplete = () => {
    // Navigate to main app after onboarding
    router.replace('/(home)');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome to DinnerMatch!</Text>
        <Text style={styles.subtitle}>
          Let's set up your profile to help you find the perfect dining experiences
        </Text>

        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Step {currentStep + 1} of 3</Text>

          {currentStep === 0 && (
            <View style={styles.step}>
              <Text style={styles.stepHeader}>Dietary Restrictions</Text>
              <Text style={styles.stepDescription}>
                Select any dietary restrictions or preferences you have
              </Text>
              {/* Add dietary restriction selection UI here */}
            </View>
          )}

          {currentStep === 1 && (
            <View style={styles.step}>
              <Text style={styles.stepHeader}>Energy Level</Text>
              <Text style={styles.stepDescription}>
                How often do you like to dine out?
              </Text>
              {/* Add energy level selection UI here */}
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.step}>
              <Text style={styles.stepHeader}>All Set!</Text>
              <Text style={styles.stepDescription}>
                You're ready to start planning amazing dining sessions with your friends
              </Text>
            </View>
          )}
        </View>

        <View style={styles.navigationContainer}>
          {currentStep > 0 && (
            <Text
              style={styles.navButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </Text>
          )}

          <Text
            style={[styles.navButton, styles.primaryButton]}
            onPress={() => {
              if (currentStep < 2) {
                setCurrentStep(currentStep + 1);
              } else {
                handleComplete();
              }
            }}
          >
            {currentStep < 2 ? 'Next' : 'Get Started'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 22,
  },
  stepContainer: {
    flex: 1,
    minHeight: 300,
  },
  stepTitle: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  step: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepHeader: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  navButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    color: 'white',
    borderRadius: 8,
  },
});