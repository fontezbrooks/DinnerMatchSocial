// Global types and interfaces

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  dietaryRestrictions: string[];
  energyLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: User[];
  createdBy: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  groupId: string;
  status: 'planning' | 'voting' | 'confirmed' | 'completed' | 'cancelled';
  scheduledFor: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  selectedRestaurant?: Restaurant;
  votes: Vote[];
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  priceLevel: 1 | 2 | 3 | 4;
  cuisine: string[];
  imageUrl?: string;
  googlePlaceId: string;
}

export interface Vote {
  userId: string;
  restaurantId: string;
  preference: 'love' | 'like' | 'dislike';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}