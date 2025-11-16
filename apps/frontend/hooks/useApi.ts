// React hooks for API operations
import { useState, useCallback } from 'react';

import { apiClient, endpoints } from '@/services/api';
import { ApiResponse } from '@/types';

// Generic hook for API calls
export const useApi = <T>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<ApiResponse<T>>
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();

        if (response.success) {
          return response.data || null;
        } else {
          setError(response.error || 'Unknown error occurred');
          return null;
        }
      } catch (err: any) {
        setError(err.message || 'Network error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { execute, loading, error, setError };
};

// Specific hooks for common operations

// User profile operations
export const useUserProfile = () => {
  const { execute, loading, error } = useApi<User>();

  const getProfile = useCallback(
    () => execute(() => apiClient.get(endpoints.users.profile)),
    [execute]
  );

  const updateProfile = useCallback(
    (data: Partial<User>) =>
      execute(() => apiClient.put(endpoints.users.updateProfile, data)),
    [execute]
  );

  const updateDietaryRestrictions = useCallback(
    (restrictions: string[]) =>
      execute(() =>
        apiClient.put(endpoints.users.updateDietaryRestrictions, {
          dietaryRestrictions: restrictions,
        })
      ),
    [execute]
  );

  const updateEnergyLevel = useCallback(
    (energyLevel: 'low' | 'medium' | 'high') =>
      execute(() =>
        apiClient.put(endpoints.users.updateEnergyLevel, { energyLevel })
      ),
    [execute]
  );

  return {
    getProfile,
    updateProfile,
    updateDietaryRestrictions,
    updateEnergyLevel,
    loading,
    error,
  };
};

// Group operations
export const useGroups = () => {
  const { execute, loading, error } = useApi<any>();

  const getGroups = useCallback(
    () => execute(() => apiClient.get(endpoints.groups.list)),
    [execute]
  );

  const createGroup = useCallback(
    (data: { name: string; description: string }) =>
      execute(() => apiClient.post(endpoints.groups.create, data)),
    [execute]
  );

  const joinGroup = useCallback(
    (inviteCode: string) =>
      execute(() => apiClient.post(endpoints.groups.join(inviteCode))),
    [execute]
  );

  const leaveGroup = useCallback(
    (groupId: string) =>
      execute(() => apiClient.post(endpoints.groups.leave(groupId))),
    [execute]
  );

  const getGroupDetails = useCallback(
    (groupId: string) =>
      execute(() => apiClient.get(endpoints.groups.detail(groupId))),
    [execute]
  );

  return {
    getGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    getGroupDetails,
    loading,
    error,
  };
};

// Session operations
export const useSessions = () => {
  const { execute, loading, error } = useApi<any>();

  const getSessions = useCallback(
    () => execute(() => apiClient.get(endpoints.sessions.list)),
    [execute]
  );

  const createSession = useCallback(
    (data: {
      groupId: string;
      scheduledFor: string;
      location?: { latitude: number; longitude: number; address: string };
    }) => execute(() => apiClient.post(endpoints.sessions.create, data)),
    [execute]
  );

  const getSessionDetails = useCallback(
    (sessionId: string) =>
      execute(() => apiClient.get(endpoints.sessions.detail(sessionId))),
    [execute]
  );

  const voteForRestaurant = useCallback(
    (sessionId: string, restaurantId: string, preference: 'love' | 'like' | 'dislike') =>
      execute(() =>
        apiClient.post(endpoints.sessions.vote(sessionId), {
          restaurantId,
          preference,
        })
      ),
    [execute]
  );

  const confirmSession = useCallback(
    (sessionId: string, restaurantId: string) =>
      execute(() =>
        apiClient.post(endpoints.sessions.confirm(sessionId), { restaurantId })
      ),
    [execute]
  );

  return {
    getSessions,
    createSession,
    getSessionDetails,
    voteForRestaurant,
    confirmSession,
    loading,
    error,
  };
};

// Restaurant operations
export const useRestaurants = () => {
  const { execute, loading, error } = useApi<any>();

  const searchRestaurants = useCallback(
    (params: {
      query?: string;
      location?: { latitude: number; longitude: number };
      radius?: number;
      cuisine?: string[];
      priceLevel?: number[];
    }) =>
      execute(() =>
        apiClient.get(
          `${endpoints.restaurants.search}?${new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
              if (value !== undefined) {
                acc[key] = Array.isArray(value) ? value.join(',') : String(value);
              }
              return acc;
            }, {} as Record<string, string>)
          ).toString()}`
        )
      ),
    [execute]
  );

  const getRestaurantSuggestions = useCallback(
    (sessionId: string) =>
      execute(() => apiClient.get(endpoints.restaurants.suggestions(sessionId))),
    [execute]
  );

  const getRestaurantDetails = useCallback(
    (restaurantId: string) =>
      execute(() => apiClient.get(endpoints.restaurants.details(restaurantId))),
    [execute]
  );

  return {
    searchRestaurants,
    getRestaurantSuggestions,
    getRestaurantDetails,
    loading,
    error,
  };
};