import { env } from '../config/env';

export interface RestaurantSearchParams {
  location?: string;
  latitude?: number;
  longitude?: number;
  term?: string;
  categories?: string;
  price?: '1' | '2' | '3' | '4'; // 1 = $, 2 = $$, 3 = $$$, 4 = $$$$
  radius?: number; // in meters, max 40000
  limit?: number; // max 50
  offset?: number;
  sort_by?: 'best_match' | 'rating' | 'review_count' | 'distance';
  open_now?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  image_url: string;
  url: string;
  review_count: number;
  categories: Array<{ alias: string; title: string }>;
  rating: number;
  coordinates: { latitude: number; longitude: number };
  transactions: string[];
  price?: string;
  location: {
    address1: string;
    address2?: string;
    address3?: string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
  };
  phone: string;
  display_phone: string;
  distance: number;
  is_closed: boolean;
  hours?: Array<{
    open: Array<{
      is_overnight: boolean;
      start: string;
      end: string;
      day: number;
    }>;
    hours_type: string;
    is_open_now: boolean;
  }>;
}

export interface RestaurantSearchResponse {
  businesses: Restaurant[];
  total: number;
  region: {
    center: { latitude: number; longitude: number };
  };
}

export class RestaurantService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.yelp.com/v3';

  constructor() {
    this.apiKey = env.YELP_API_KEY;
    if (!this.apiKey) {
      throw new Error('YELP_API_KEY is not configured');
    }
  }

  /**
   * Search for restaurants using Yelp Fusion API
   */
  async searchRestaurants(params: RestaurantSearchParams): Promise<RestaurantSearchResponse> {
    try {
      const searchParams = new URLSearchParams();

      // Location parameters (either location string OR lat/lng)
      if (params.location) {
        searchParams.append('location', params.location);
      } else if (params.latitude && params.longitude) {
        searchParams.append('latitude', params.latitude.toString());
        searchParams.append('longitude', params.longitude.toString());
      } else {
        throw new Error('Either location or latitude/longitude must be provided');
      }

      // Search term
      if (params.term) {
        searchParams.append('term', params.term);
      }

      // Category filtering (default to restaurants)
      searchParams.append('categories', params.categories || 'restaurants');

      // Price filtering
      if (params.price) {
        searchParams.append('price', params.price);
      }

      // Radius (max 40000 meters = ~25 miles)
      if (params.radius) {
        searchParams.append('radius', Math.min(params.radius, 40000).toString());
      }

      // Limit results (max 50)
      searchParams.append('limit', (params.limit || 20).toString());

      // Offset for pagination
      if (params.offset) {
        searchParams.append('offset', params.offset.toString());
      }

      // Sort order
      searchParams.append('sort_by', params.sort_by || 'best_match');

      // Open now filter
      if (params.open_now) {
        searchParams.append('open_now', 'true');
      }

      const url = `${this.baseUrl}/businesses/search?${searchParams.toString()}`;

      console.log(`🔍 Searching restaurants: ${params.location || `${params.latitude},${params.longitude}`}`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Yelp API error:', response.status, errorBody);
        throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`✅ Found ${data.businesses.length} restaurants`);
      return data as RestaurantSearchResponse;

    } catch (error) {
      console.error('❌ Error searching restaurants:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific restaurant
   */
  async getRestaurantDetails(businessId: string): Promise<Restaurant> {
    try {
      const url = `${this.baseUrl}/businesses/${businessId}`;

      console.log(`📍 Getting restaurant details: ${businessId}`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Yelp API error:', response.status, errorBody);
        throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Got restaurant details: ${data.name}`);

      return data as Restaurant;

    } catch (error) {
      console.error('❌ Error getting restaurant details:', error);
      throw error;
    }
  }

  /**
   * Search restaurants by phone number
   */
  async searchRestaurantsByPhone(phone: string): Promise<RestaurantSearchResponse> {
    try {
      const url = `${this.baseUrl}/businesses/search/phone?phone=${encodeURIComponent(phone)}`;

      console.log(`📞 Searching restaurant by phone: ${phone}`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Yelp API error:', response.status, errorBody);
        throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Found ${data.businesses.length} restaurants by phone`);

      return data as RestaurantSearchResponse;

    } catch (error) {
      console.error('❌ Error searching restaurants by phone:', error);
      throw error;
    }
  }

  /**
   * Get restaurant reviews
   */
  async getRestaurantReviews(businessId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/businesses/${businessId}/reviews`;

      console.log(`⭐ Getting restaurant reviews: ${businessId}`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Yelp API error:', response.status, errorBody);
        throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Got ${data.reviews?.length || 0} reviews`);

      return data;

    } catch (error) {
      console.error('❌ Error getting restaurant reviews:', error);
      throw error;
    }
  }

  /**
   * Get restaurants that support delivery/takeout
   */
  async getDeliveryRestaurants(params: Omit<RestaurantSearchParams, 'categories'>): Promise<RestaurantSearchResponse> {
    try {
      return await this.searchRestaurants({
        ...params,
        categories: 'restaurants,food,delivery',
      });
    } catch (error) {
      console.error('❌ Error getting delivery restaurants:', error);
      throw error;
    }
  }

  /**
   * Filter restaurants by dietary preferences
   */
  getDietaryFilteredRestaurants(restaurants: Restaurant[], dietary: string[]): Restaurant[] {
    if (!dietary || dietary.length === 0) {
      return restaurants;
    }

    return restaurants.filter(restaurant => {
      const categories = restaurant.categories.map(cat => cat.alias.toLowerCase());

      return dietary.some(diet => {
        switch (diet.toLowerCase()) {
          case 'vegetarian':
            return categories.some(cat =>
              cat.includes('vegetarian') ||
              cat.includes('vegan') ||
              cat.includes('salads')
            );
          case 'vegan':
            return categories.some(cat => cat.includes('vegan'));
          case 'gluten_free':
            return categories.some(cat => cat.includes('glutenfree'));
          case 'halal':
            return categories.some(cat => cat.includes('halal'));
          case 'kosher':
            return categories.some(cat => cat.includes('kosher'));
          default:
            return false;
        }
      });
    });
  }
}

export const restaurantService = new RestaurantService();