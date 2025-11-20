import { env } from '../config/env';

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

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  license: string;
  sourceName: string;
  sourceUrl: string;
  spoonacularSourceUrl: string;
  aggregateLikes: number;
  healthScore: number;
  spoonacularScore: number;
  pricePerServing: number;
  analyzedInstructions: Array<{
    name: string;
    steps: Array<{
      number: number;
      step: string;
      ingredients: Array<{
        id: number;
        name: string;
        localizedName: string;
        image: string;
      }>;
      equipment: Array<{
        id: number;
        name: string;
        localizedName: string;
        image: string;
      }>;
      length?: {
        number: number;
        unit: string;
      };
    }>;
  }>;
  cheap: boolean;
  creditsText: string;
  cuisines: string[];
  dairyFree: boolean;
  diets: string[];
  gaps: string;
  glutenFree: boolean;
  instructions: string;
  ketogenic: boolean;
  lowFodmap: boolean;
  occasions: string[];
  sustainable: boolean;
  vegan: boolean;
  vegetarian: boolean;
  veryHealthy: boolean;
  veryPopular: boolean;
  whole30: boolean;
  weightWatcherSmartPoints: number;
  dishTypes: string[];
  extendedIngredients: Array<{
    aisle: string;
    amount: number;
    consitency: string;
    id: number;
    image: string;
    measures: any;
    meta: string[];
    name: string;
    nameClean: string;
    original: string;
    originalName: string;
    unit: string;
  }>;
  summary: string;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
      percentOfDailyNeeds: number;
    }>;
    properties: any[];
    flavonoids: any[];
    ingredients: any[];
    caloricBreakdown: {
      percentProtein: number;
      percentFat: number;
      percentCarbs: number;
    };
    weightPerServing: {
      amount: number;
      unit: string;
    };
  };
}

export interface RecipeSearchResponse {
  results: Recipe[];
  offset: number;
  number: number;
  totalResults: number;
}

export class RecipeService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.spoonacular.com';

  constructor() {
    this.apiKey = env.SPOONACULAR_API_KEY;
    if (!this.apiKey) {
      throw new Error('SPOONACULAR_API_KEY is not configured');
    }
  }

  /**
   * Search for recipes using Spoonacular API
   */
  async searchRecipes(params: RecipeSearchParams): Promise<RecipeSearchResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('apiKey', this.apiKey);

      // Query string
      if (params.query) {
        searchParams.append('query', params.query);
      }

      // Cuisine filter
      if (params.cuisine) {
        searchParams.append('cuisine', params.cuisine);
      }

      // Diet filter (vegetarian, vegan, gluten free, etc.)
      if (params.diet) {
        searchParams.append('diet', params.diet);
      }

      // Intolerances (dairy, egg, gluten, etc.)
      if (params.intolerances) {
        searchParams.append('intolerances', params.intolerances);
      }

      // Include ingredients
      if (params.includeIngredients) {
        searchParams.append('includeIngredients', params.includeIngredients);
      }

      // Exclude ingredients
      if (params.excludeIngredients) {
        searchParams.append('excludeIngredients', params.excludeIngredients);
      }

      // Max ready time in minutes
      if (params.maxReadyTime) {
        searchParams.append('maxReadyTime', params.maxReadyTime.toString());
      }

      // Nutritional filters
      if (params.maxCalories) {
        searchParams.append('maxCalories', params.maxCalories.toString());
      }
      if (params.minProtein) {
        searchParams.append('minProtein', params.minProtein.toString());
      }
      if (params.maxCarbs) {
        searchParams.append('maxCarbs', params.maxCarbs.toString());
      }

      // Sort order
      if (params.sort) {
        const sortMapping = {
          popularity: 'popularity',
          time: 'time',
          calories: 'calories',
          random: 'random'
        };
        searchParams.append('sort', sortMapping[params.sort]);
      }

      // Results count and pagination
      searchParams.append('number', (params.number || 20).toString());
      if (params.offset) {
        searchParams.append('offset', params.offset.toString());
      }

      // Add recipe information and nutrition
      searchParams.append('addRecipeInformation', 'true');
      searchParams.append('addRecipeNutrition', 'true');
      searchParams.append('fillIngredients', 'true');

      const url = `${this.baseUrl}/recipes/complexSearch?${searchParams.toString()}`;

      console.log(`🔍 Searching recipes: ${params.query || 'general search'}`);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Spoonacular API error:', response.status, errorBody);
        throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`✅ Found ${data.results.length} recipes`);
      return data as RecipeSearchResponse;

    } catch (error) {
      console.error('❌ Error searching recipes:', error);
      throw error;
    }
  }

  /**
   * Get detailed recipe information by ID
   */
  async getRecipeDetails(recipeId: number): Promise<Recipe> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('apiKey', this.apiKey);
      searchParams.append('includeNutrition', 'true');

      const url = `${this.baseUrl}/recipes/${recipeId}/information?${searchParams.toString()}`;

      console.log(`📍 Getting recipe details: ${recipeId}`);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Spoonacular API error:', response.status, errorBody);
        throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Got recipe details: ${data.title}`);

      return data as Recipe;

    } catch (error) {
      console.error('❌ Error getting recipe details:', error);
      throw error;
    }
  }

  /**
   * Search recipes by ingredients
   */
  async searchRecipesByIngredients(ingredients: string[], number: number = 10): Promise<any[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('apiKey', this.apiKey);
      searchParams.append('ingredients', ingredients.join(',+'));
      searchParams.append('number', number.toString());
      searchParams.append('ranking', '1'); // Maximize used ingredients

      const url = `${this.baseUrl}/recipes/findByIngredients?${searchParams.toString()}`;

      console.log(`🥕 Searching recipes by ingredients: ${ingredients.join(', ')}`);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Spoonacular API error:', response.status, errorBody);
        throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Found ${data.length} recipes by ingredients`);

      return data;

    } catch (error) {
      console.error('❌ Error searching recipes by ingredients:', error);
      throw error;
    }
  }

  /**
   * Get random recipes
   */
  async getRandomRecipes(params: {
    limitLicense?: boolean;
    tags?: string;
    number?: number;
  }): Promise<{ recipes: Recipe[] }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('apiKey', this.apiKey);
      searchParams.append('number', (params.number || 10).toString());

      if (params.limitLicense) {
        searchParams.append('limitLicense', 'true');
      }

      if (params.tags) {
        searchParams.append('tags', params.tags);
      }

      const url = `${this.baseUrl}/recipes/random?${searchParams.toString()}`;

      console.log(`🎲 Getting random recipes`);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Spoonacular API error:', response.status, errorBody);
        throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Got ${data.recipes.length} random recipes`);

      return data;

    } catch (error) {
      console.error('❌ Error getting random recipes:', error);
      throw error;
    }
  }

  /**
   * Get autocomplete suggestions for recipe search
   */
  async getRecipeAutocomplete(query: string, number: number = 10): Promise<any[]> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('apiKey', this.apiKey);
      searchParams.append('query', query);
      searchParams.append('number', number.toString());

      const url = `${this.baseUrl}/recipes/autocomplete?${searchParams.toString()}`;

      console.log(`💭 Getting recipe autocomplete: ${query}`);

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Spoonacular API error:', response.status, errorBody);
        throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Got ${data.length} autocomplete suggestions`);

      return data;

    } catch (error) {
      console.error('❌ Error getting recipe autocomplete:', error);
      throw error;
    }
  }

  /**
   * Filter recipes by dietary restrictions
   */
  filterRecipesByDiet(recipes: Recipe[], dietaryRestrictions: string[]): Recipe[] {
    if (!dietaryRestrictions || dietaryRestrictions.length === 0) {
      return recipes;
    }

    return recipes.filter(recipe => {
      return dietaryRestrictions.every(restriction => {
        switch (restriction.toLowerCase()) {
          case 'vegetarian':
            return recipe.vegetarian;
          case 'vegan':
            return recipe.vegan;
          case 'gluten_free':
            return recipe.glutenFree;
          case 'dairy_free':
            return recipe.dairyFree;
          case 'ketogenic':
            return recipe.ketogenic;
          case 'whole30':
            return recipe.whole30;
          default:
            return true; // Unknown restriction, don't filter
        }
      });
    });
  }
}

export const recipeService = new RecipeService();