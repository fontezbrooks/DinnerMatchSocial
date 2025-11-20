import express from 'express';
import { restaurantService, RestaurantSearchParams } from '../services/restaurantService';
import { recipeService, RecipeSearchParams } from '../services/recipeService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all discovery routes
router.use(authenticateToken);

/**
 * Search restaurants by location and filters
 * GET /api/discovery/restaurants/search
 */
router.get('/restaurants/search', async (req, res) => {
  try {
    const {
      location,
      latitude,
      longitude,
      term,
      categories,
      price,
      radius,
      limit,
      offset,
      sort_by,
      open_now,
      dietary
    } = req.query;

    // Validate location parameters
    if (!location && (!latitude || !longitude)) {
      return res.status(400).json({
        error: 'Either location or latitude/longitude coordinates are required',
        code: 'MISSING_LOCATION'
      });
    }

    const searchParams: RestaurantSearchParams = {
      location: location as string,
      latitude: latitude ? parseFloat(latitude as string) : undefined,
      longitude: longitude ? parseFloat(longitude as string) : undefined,
      term: term as string,
      categories: categories as string,
      price: price as '1' | '2' | '3' | '4',
      radius: radius ? parseInt(radius as string) : undefined,
      limit: limit ? parseInt(limit as string) : 20,
      offset: offset ? parseInt(offset as string) : 0,
      sort_by: sort_by as any,
      open_now: open_now === 'true'
    };

    console.log(`🔍 Restaurant search request:`, searchParams);

    const results = await restaurantService.searchRestaurants(searchParams);

    // Apply dietary filters if specified
    let filteredRestaurants = results.businesses;
    if (dietary && typeof dietary === 'string') {
      const dietaryFilters = dietary.split(',');
      filteredRestaurants = restaurantService.getDietaryFilteredRestaurants(
        results.businesses,
        dietaryFilters
      );
    }

    res.json({
      success: true,
      data: {
        ...results,
        businesses: filteredRestaurants,
        total: filteredRestaurants.length
      },
      filters_applied: dietary ? dietary.split(',') : []
    });

  } catch (error) {
    console.error('❌ Restaurant search error:', error);
    res.status(500).json({
      error: 'Failed to search restaurants',
      code: 'RESTAURANT_SEARCH_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get detailed restaurant information
 * GET /api/discovery/restaurants/:id
 */
router.get('/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Restaurant ID is required',
        code: 'MISSING_RESTAURANT_ID'
      });
    }

    console.log(`📍 Restaurant details request: ${id}`);

    const restaurant = await restaurantService.getRestaurantDetails(id);

    res.json({
      success: true,
      data: restaurant
    });

  } catch (error) {
    console.error('❌ Restaurant details error:', error);
    res.status(500).json({
      error: 'Failed to get restaurant details',
      code: 'RESTAURANT_DETAILS_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get restaurant reviews
 * GET /api/discovery/restaurants/:id/reviews
 */
router.get('/restaurants/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Restaurant ID is required',
        code: 'MISSING_RESTAURANT_ID'
      });
    }

    console.log(`⭐ Restaurant reviews request: ${id}`);

    const reviews = await restaurantService.getRestaurantReviews(id);

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    console.error('❌ Restaurant reviews error:', error);
    res.status(500).json({
      error: 'Failed to get restaurant reviews',
      code: 'RESTAURANT_REVIEWS_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Search recipes by query and filters
 * GET /api/discovery/recipes/search
 */
router.get('/recipes/search', async (req, res) => {
  try {
    const {
      query,
      cuisine,
      diet,
      intolerances,
      includeIngredients,
      excludeIngredients,
      maxReadyTime,
      maxCalories,
      minProtein,
      maxCarbs,
      sort,
      number,
      offset
    } = req.query;

    const searchParams: RecipeSearchParams = {
      query: query as string,
      cuisine: cuisine as string,
      diet: diet as string,
      intolerances: intolerances as string,
      includeIngredients: includeIngredients as string,
      excludeIngredients: excludeIngredients as string,
      maxReadyTime: maxReadyTime ? parseInt(maxReadyTime as string) : undefined,
      maxCalories: maxCalories ? parseInt(maxCalories as string) : undefined,
      minProtein: minProtein ? parseInt(minProtein as string) : undefined,
      maxCarbs: maxCarbs ? parseInt(maxCarbs as string) : undefined,
      sort: sort as any,
      number: number ? parseInt(number as string) : 20,
      offset: offset ? parseInt(offset as string) : 0
    };

    console.log(`🔍 Recipe search request:`, searchParams);

    const results = await recipeService.searchRecipes(searchParams);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('❌ Recipe search error:', error);
    res.status(500).json({
      error: 'Failed to search recipes',
      code: 'RECIPE_SEARCH_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get detailed recipe information
 * GET /api/discovery/recipes/:id
 */
router.get('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Valid recipe ID is required',
        code: 'INVALID_RECIPE_ID'
      });
    }

    console.log(`📍 Recipe details request: ${id}`);

    const recipe = await recipeService.getRecipeDetails(parseInt(id));

    res.json({
      success: true,
      data: recipe
    });

  } catch (error) {
    console.error('❌ Recipe details error:', error);
    res.status(500).json({
      error: 'Failed to get recipe details',
      code: 'RECIPE_DETAILS_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Search recipes by ingredients
 * POST /api/discovery/recipes/by-ingredients
 */
router.post('/recipes/by-ingredients', async (req, res) => {
  try {
    const { ingredients, number } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        error: 'At least one ingredient is required',
        code: 'MISSING_INGREDIENTS'
      });
    }

    console.log(`🥕 Recipe by ingredients request: ${ingredients.join(', ')}`);

    const results = await recipeService.searchRecipesByIngredients(
      ingredients,
      number || 10
    );

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('❌ Recipe by ingredients error:', error);
    res.status(500).json({
      error: 'Failed to search recipes by ingredients',
      code: 'RECIPE_INGREDIENTS_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get random recipes
 * GET /api/discovery/recipes/random
 */
router.get('/recipes/random', async (req, res) => {
  try {
    const { tags, number, limitLicense } = req.query;

    const params = {
      tags: tags as string,
      number: number ? parseInt(number as string) : 10,
      limitLicense: limitLicense === 'true'
    };

    console.log(`🎲 Random recipes request:`, params);

    const results = await recipeService.getRandomRecipes(params);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('❌ Random recipes error:', error);
    res.status(500).json({
      error: 'Failed to get random recipes',
      code: 'RANDOM_RECIPES_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get autocomplete suggestions for recipe search
 * GET /api/discovery/recipes/autocomplete
 */
router.get('/recipes/autocomplete', async (req, res) => {
  try {
    const { query, number } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required',
        code: 'MISSING_QUERY'
      });
    }

    console.log(`💭 Recipe autocomplete request: ${query}`);

    const results = await recipeService.getRecipeAutocomplete(
      query as string,
      number ? parseInt(number as string) : 10
    );

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('❌ Recipe autocomplete error:', error);
    res.status(500).json({
      error: 'Failed to get recipe autocomplete',
      code: 'RECIPE_AUTOCOMPLETE_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get combined recommendations (restaurants + recipes)
 * GET /api/discovery/recommendations
 */
router.get('/recommendations', async (req, res) => {
  try {
    const {
      location,
      latitude,
      longitude,
      cuisine,
      dietary,
      maxReadyTime,
      priceRange,
      radius
    } = req.query;

    // Validate location
    if (!location && (!latitude || !longitude)) {
      return res.status(400).json({
        error: 'Either location or latitude/longitude coordinates are required',
        code: 'MISSING_LOCATION'
      });
    }

    console.log(`🎯 Combined recommendations request`);

    // Search restaurants and recipes in parallel
    const [restaurantResults, recipeResults] = await Promise.allSettled([
      restaurantService.searchRestaurants({
        location: location as string,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
        categories: 'restaurants',
        price: priceRange as any,
        radius: radius ? parseInt(radius as string) : undefined,
        limit: 10
      }),
      recipeService.searchRecipes({
        cuisine: cuisine as string,
        diet: dietary as string,
        maxReadyTime: maxReadyTime ? parseInt(maxReadyTime as string) : undefined,
        number: 10
      })
    ]);

    const response: any = {
      success: true,
      data: {
        restaurants: [],
        recipes: []
      }
    };

    // Process restaurant results
    if (restaurantResults.status === 'fulfilled') {
      let restaurants = restaurantResults.value.businesses;

      // Apply dietary filters if specified
      if (dietary && typeof dietary === 'string') {
        restaurants = restaurantService.getDietaryFilteredRestaurants(
          restaurants,
          dietary.split(',')
        );
      }

      response.data.restaurants = restaurants;
    } else {
      console.error('❌ Restaurant search failed:', restaurantResults.reason);
      response.data.restaurants = [];
    }

    // Process recipe results
    if (recipeResults.status === 'fulfilled') {
      let recipes = recipeResults.value.results;

      // Apply dietary filters if specified
      if (dietary && typeof dietary === 'string') {
        recipes = recipeService.filterRecipesByDiet(
          recipes,
          dietary.split(',')
        );
      }

      response.data.recipes = recipes;
    } else {
      console.error('❌ Recipe search failed:', recipeResults.reason);
      response.data.recipes = [];
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Combined recommendations error:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      code: 'RECOMMENDATIONS_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;