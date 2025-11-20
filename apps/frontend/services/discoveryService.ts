import { API_BASE_URL } from '../config/api';

export interface RestaurantSearchParams {
  location?: string;
  latitude?: number;
  longitude?: number;
  term?: string;
  categories?: string;
  price?: '1' | '2' | '3' | '4';
  radius?: number;
  limit?: number;
  offset?: number;
  sort_by?: 'best_match' | 'rating' | 'review_count' | 'distance';
  open_now?: boolean;
  dietary?: string;
}

export interface RecipeSearchParams {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  includeIngredients?: string;
  excludeIngredients?: string;
  maxReadyTime?: number;
  maxCalories?: number;
  minProtein?: number;
  maxCarbs?: number;
  sort?: 'popularity' | 'time' | 'calories' | 'random';
  number?: number;
  offset?: number;
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
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  spoonacularSourceUrl: string;
  aggregateLikes: number;
  healthScore: number;
  cheap: boolean;
  cuisines: string[];
  dairyFree: boolean;
  diets: string[];
  glutenFree: boolean;
  ketogenic: boolean;
  vegan: boolean;
  vegetarian: boolean;
  instructions: string;
  summary: string;
}

export interface DiscoveryResponse<T> {
  success: boolean;
  data: T;
  filters_applied?: string[];
}

class DiscoveryService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${API_BASE_URL}/discovery${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details || errorData.error || `HTTP ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Discovery API error [${endpoint}]:`, error);
      throw error;
    }
  }

  private async getAuthToken(): Promise<string> {
    // This would typically get the token from AsyncStorage or auth context
    // For now, return a placeholder that would be replaced with actual auth
    return 'your-jwt-token-here';
  }

  // Restaurant methods
  async searchRestaurants(
    params: RestaurantSearchParams
  ): Promise<DiscoveryResponse<{ businesses: Restaurant[]; total: number }>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/restaurants/search?${searchParams.toString()}`);
  }

  async getRestaurantDetails(id: string): Promise<DiscoveryResponse<Restaurant>> {
    return this.request(`/restaurants/${id}`);
  }

  async getRestaurantReviews(id: string): Promise<DiscoveryResponse<any>> {
    return this.request(`/restaurants/${id}/reviews`);
  }

  // Recipe methods
  async searchRecipes(
    params: RecipeSearchParams
  ): Promise<DiscoveryResponse<{ results: Recipe[]; offset: number; number: number; totalResults: number }>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/recipes/search?${searchParams.toString()}`);
  }

  async getRecipeDetails(id: number): Promise<DiscoveryResponse<Recipe>> {
    return this.request(`/recipes/${id}`);
  }

  async searchRecipesByIngredients(
    ingredients: string[],
    number: number = 10
  ): Promise<DiscoveryResponse<any[]>> {
    return this.request('/recipes/by-ingredients', {
      method: 'POST',
      body: JSON.stringify({ ingredients, number }),
    });
  }

  async getRandomRecipes(params: {
    tags?: string;
    number?: number;
    limitLicense?: boolean;
  }): Promise<DiscoveryResponse<{ recipes: Recipe[] }>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/recipes/random?${searchParams.toString()}`);
  }

  async getRecipeAutocomplete(
    query: string,
    number: number = 10
  ): Promise<DiscoveryResponse<any[]>> {
    return this.request(`/recipes/autocomplete?query=${encodeURIComponent(query)}&number=${number}`);
  }

  // Combined search
  async getRecommendations(params: {
    location?: string;
    latitude?: number;
    longitude?: number;
    cuisine?: string;
    dietary?: string;
    maxReadyTime?: number;
    priceRange?: string;
    radius?: number;
  }): Promise<DiscoveryResponse<{
    restaurants: Restaurant[];
    recipes: Recipe[];
  }>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/recommendations?${searchParams.toString()}`);
  }

  // Helper methods for converting data to match format
  restaurantToMatchItem(restaurant: Restaurant) {
    return {
      id: restaurant.id,
      type: 'restaurant' as const,
      name: restaurant.name,
      image: restaurant.image_url,
      rating: restaurant.rating,
      price: restaurant.price,
      address: restaurant.location.display_address.join(', '),
      coordinates: restaurant.coordinates,
      url: restaurant.url,
      phone: restaurant.phone,
    };
  }

  recipeToMatchItem(recipe: Recipe) {
    return {
      id: recipe.id.toString(),
      type: 'recipe' as const,
      name: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      url: recipe.spoonacularSourceUrl,
    };
  }
}

export const discoveryService = new DiscoveryService();
export default discoveryService;