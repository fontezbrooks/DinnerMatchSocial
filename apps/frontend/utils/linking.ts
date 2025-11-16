// Deep linking utilities for DinnerMatch
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

export interface DeepLinkParams {
  groupInvite?: string;
  sessionId?: string;
  restaurantId?: string;
}

export const createLinking = () => {
  return {
    prefixes: [
      Linking.createURL('/'),
      'dinnermatch://',
      'https://dinnermatch.app',
    ],
    config: {
      screens: {
        '(home)': {
          screens: {
            '(tabs)': {
              screens: {
                index: 'home',
                groups: 'groups',
                history: 'history',
                profile: 'profile',
              },
            },
          },
        },
        '(auth)': {
          screens: {
            'sign-in': 'signin',
            'sign-up': 'signup',
            onboarding: 'onboarding',
          },
        },
        modal: 'modal',
        // Deep link routes
        'group-invite': 'invite/:code',
        'join-session': 'session/:sessionId',
        'restaurant-details': 'restaurant/:restaurantId',
      },
    },
  };
};

// Handle incoming deep links
export const handleDeepLink = (url: string) => {
  const { hostname, path, queryParams } = Linking.parse(url);

  console.log('Deep link received:', { hostname, path, queryParams });

  // Handle group invite links
  // Format: dinnermatch://invite/ABC123 or https://dinnermatch.app/invite/ABC123
  if (path?.includes('/invite/')) {
    const inviteCode = path.split('/invite/')[1];
    if (inviteCode) {
      handleGroupInvite(inviteCode);
      return;
    }
  }

  // Handle session links
  // Format: dinnermatch://session/123 or https://dinnermatch.app/session/123
  if (path?.includes('/session/')) {
    const sessionId = path.split('/session/')[1];
    if (sessionId) {
      handleSessionLink(sessionId);
      return;
    }
  }

  // Handle restaurant links
  // Format: dinnermatch://restaurant/123
  if (path?.includes('/restaurant/')) {
    const restaurantId = path.split('/restaurant/')[1];
    if (restaurantId) {
      handleRestaurantLink(restaurantId);
      return;
    }
  }

  // Default fallback
  router.push('/(home)/');
};

// Handle group invite deep links
export const handleGroupInvite = (inviteCode: string) => {
  console.log('Handling group invite:', inviteCode);

  // Store invite code for processing
  // Could use AsyncStorage or context to persist across app restarts

  // Navigate to groups tab with invite modal
  router.push({
    pathname: '/(home)/(tabs)/groups',
    params: { invite: inviteCode }
  });
};

// Handle session deep links
export const handleSessionLink = (sessionId: string) => {
  console.log('Handling session link:', sessionId);

  // Navigate to session details
  router.push({
    pathname: '/modal',
    params: { sessionId }
  });
};

// Handle restaurant deep links
export const handleRestaurantLink = (restaurantId: string) => {
  console.log('Handling restaurant link:', restaurantId);

  // Navigate to restaurant details modal
  router.push({
    pathname: '/modal',
    params: { restaurantId }
  });
};

// Generate shareable links
export const generateGroupInviteLink = (inviteCode: string): string => {
  return `https://dinnermatch.app/invite/${inviteCode}`;
};

export const generateSessionLink = (sessionId: string): string => {
  return `https://dinnermatch.app/session/${sessionId}`;
};

export const generateRestaurantLink = (restaurantId: string): string => {
  return `https://dinnermatch.app/restaurant/${restaurantId}`;
};

// Initialize deep linking
export const initializeDeepLinking = () => {
  // Handle app opened from deep link when app was closed
  Linking.getInitialURL().then((url) => {
    if (url) {
      console.log('App opened with URL:', url);
      handleDeepLink(url);
    }
  });

  // Handle deep links when app is running
  const subscription = Linking.addEventListener('url', (event) => {
    console.log('Deep link received while app running:', event.url);
    handleDeepLink(event.url);
  });

  return subscription;
};