// Hook for handling deep linking in the app
import { useEffect } from 'react';
import { initializeDeepLinking } from '@/utils/linking';

export const useDeepLinking = () => {
  useEffect(() => {
    // Initialize deep linking when the app starts
    const subscription = initializeDeepLinking();

    // Cleanup subscription on unmount
    return subscription?.remove;
  }, []);
};