import request from 'supertest';
import app from '../app';

// Mock the external API services for testing
jest.mock('../services/restaurantService', () => ({
  restaurantService: {
    searchRestaurants: jest.fn(),
    getRestaurantDetails: jest.fn(),
    getDietaryFilteredRestaurants: jest.fn(),
  },
}));

jest.mock('../services/recipeService', () => ({
  recipeService: {
    searchRecipes: jest.fn(),
    getRecipeDetails: jest.fn(),
    filterRecipesByDiet: jest.fn(),
  },
}));

// Mock auth middleware for testing
jest.mock('../middleware/auth', () => ({
  auth: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-id', username: 'testuser' };
    next();
  },
}));

describe('Discovery API Endpoints', () => {
  describe('Restaurant Search', () => {
    it('should search restaurants with location', async () => {
      const { restaurantService } = require('../services/restaurantService');

      const mockRestaurants = {
        businesses: [
          {
            id: 'test-restaurant-1',
            name: 'Test Restaurant',
            image_url: 'https://example.com/image.jpg',
            rating: 4.5,
            price: '$$',
            location: {
              address1: '123 Test St',
              city: 'Test City',
              state: 'CA',
              zip_code: '12345',
              display_address: ['123 Test St', 'Test City, CA 12345'],
            },
            coordinates: { latitude: 37.7749, longitude: -122.4194 },
            phone: '+1234567890',
            url: 'https://yelp.com/biz/test-restaurant',
          },
        ],
        total: 1,
        region: {
          center: { latitude: 37.7749, longitude: -122.4194 },
        },
      };

      restaurantService.searchRestaurants.mockResolvedValue(mockRestaurants);
      restaurantService.getDietaryFilteredRestaurants.mockImplementation(
        (restaurants, filters) => restaurants
      );

      const response = await request(app)
        .get('/api/discovery/restaurants/search')
        .query({ location: 'San Francisco, CA' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.businesses).toHaveLength(1);
      expect(response.body.data.businesses[0].name).toBe('Test Restaurant');
    });

    it('should require location parameters', async () => {
      const response = await request(app)
        .get('/api/discovery/restaurants/search')
        .expect(400);

      expect(response.body.error).toBe(
        'Either location or latitude/longitude coordinates are required'
      );
      expect(response.body.code).toBe('MISSING_LOCATION');
    });

    it('should handle search with coordinates', async () => {
      const { restaurantService } = require('../services/restaurantService');

      restaurantService.searchRestaurants.mockResolvedValue({
        businesses: [],
        total: 0,
      });

      const response = await request(app)
        .get('/api/discovery/restaurants/search')
        .query({
          latitude: '37.7749',
          longitude: '-122.4194',
          term: 'pizza',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(restaurantService.searchRestaurants).toHaveBeenCalledWith({
        location: undefined,
        latitude: 37.7749,
        longitude: -122.4194,
        term: 'pizza',
        categories: undefined,
        price: undefined,
        radius: undefined,
        limit: 20,
        offset: 0,
        sort_by: undefined,
        open_now: false,
      });
    });
  });

  describe('Recipe Search', () => {
    it('should search recipes with parameters', async () => {
      const { recipeService } = require('../services/recipeService');

      const mockRecipes = {
        results: [
          {
            id: 123,
            title: 'Test Recipe',
            image: 'https://example.com/recipe.jpg',
            readyInMinutes: 30,
            servings: 4,
            vegetarian: true,
            vegan: false,
          },
        ],
        offset: 0,
        number: 1,
        totalResults: 1,
      };

      recipeService.searchRecipes.mockResolvedValue(mockRecipes);

      const response = await request(app)
        .get('/api/discovery/recipes/search')
        .query({
          query: 'pasta',
          diet: 'vegetarian',
          maxReadyTime: '30',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toHaveLength(1);
      expect(response.body.data.results[0].title).toBe('Test Recipe');
    });

    it('should search recipes by ingredients', async () => {
      const { recipeService } = require('../services/recipeService');

      const mockRecipes = [
        {
          id: 456,
          title: 'Pasta with Tomatoes',
          image: 'https://example.com/pasta.jpg',
          usedIngredientCount: 2,
          missedIngredientCount: 0,
        },
      ];

      recipeService.searchRecipesByIngredients.mockResolvedValue(mockRecipes);

      const response = await request(app)
        .post('/api/discovery/recipes/by-ingredients')
        .send({
          ingredients: ['pasta', 'tomatoes'],
          number: 10,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Pasta with Tomatoes');
    });

    it('should require ingredients for ingredient search', async () => {
      const response = await request(app)
        .post('/api/discovery/recipes/by-ingredients')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('At least one ingredient is required');
      expect(response.body.code).toBe('MISSING_INGREDIENTS');
    });
  });

  describe('Combined Recommendations', () => {
    it('should get combined restaurant and recipe recommendations', async () => {
      const { restaurantService } = require('../services/restaurantService');
      const { recipeService } = require('../services/recipeService');

      restaurantService.searchRestaurants.mockResolvedValue({
        businesses: [{ id: 'r1', name: 'Test Restaurant' }],
      });
      restaurantService.getDietaryFilteredRestaurants.mockImplementation(
        (restaurants, filters) => restaurants
      );

      recipeService.searchRecipes.mockResolvedValue({
        results: [{ id: 1, title: 'Test Recipe' }],
      });
      recipeService.filterRecipesByDiet.mockImplementation(
        (recipes, filters) => recipes
      );

      const response = await request(app)
        .get('/api/discovery/recommendations')
        .query({
          location: 'New York, NY',
          cuisine: 'italian',
          dietary: 'vegetarian',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurants).toHaveLength(1);
      expect(response.body.data.recipes).toHaveLength(1);
    });

    it('should handle API failures gracefully', async () => {
      const { restaurantService } = require('../services/restaurantService');
      const { recipeService } = require('../services/recipeService');

      restaurantService.searchRestaurants.mockRejectedValue(
        new Error('Yelp API error')
      );
      recipeService.searchRecipes.mockResolvedValue({
        results: [{ id: 1, title: 'Test Recipe' }],
      });

      const response = await request(app)
        .get('/api/discovery/recommendations')
        .query({ location: 'Invalid Location' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.restaurants).toHaveLength(0);
      expect(response.body.data.recipes).toHaveLength(1);
    });
  });

  describe('Restaurant Details', () => {
    it('should get restaurant details by ID', async () => {
      const { restaurantService } = require('../services/restaurantService');

      const mockRestaurant = {
        id: 'test-restaurant',
        name: 'Test Restaurant',
        rating: 4.5,
        hours: [{ is_open_now: true }],
      };

      restaurantService.getRestaurantDetails.mockResolvedValue(mockRestaurant);

      const response = await request(app)
        .get('/api/discovery/restaurants/test-restaurant')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Restaurant');
    });

    it('should require restaurant ID', async () => {
      const response = await request(app)
        .get('/api/discovery/restaurants/')
        .expect(404);
    });
  });

  describe('Recipe Details', () => {
    it('should get recipe details by ID', async () => {
      const { recipeService } = require('../services/recipeService');

      const mockRecipe = {
        id: 123,
        title: 'Detailed Recipe',
        instructions: 'Cook it well',
        nutrition: { calories: 300 },
      };

      recipeService.getRecipeDetails.mockResolvedValue(mockRecipe);

      const response = await request(app)
        .get('/api/discovery/recipes/123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Detailed Recipe');
    });

    it('should require valid recipe ID', async () => {
      const response = await request(app)
        .get('/api/discovery/recipes/invalid')
        .expect(400);

      expect(response.body.code).toBe('INVALID_RECIPE_ID');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const { restaurantService } = require('../services/restaurantService');

      restaurantService.searchRestaurants.mockRejectedValue(
        new Error('External API error')
      );

      const response = await request(app)
        .get('/api/discovery/restaurants/search')
        .query({ location: 'Test Location' })
        .expect(500);

      expect(response.body.error).toBe('Failed to search restaurants');
      expect(response.body.code).toBe('RESTAURANT_SEARCH_ERROR');
    });
  });
});

describe('Integration Test Flow', () => {
  it('should complete end-to-end restaurant discovery flow', async () => {
    const { restaurantService } = require('../services/restaurantService');

    // Mock the full flow
    const mockSearchResults = {
      businesses: [
        {
          id: 'flow-restaurant',
          name: 'Flow Test Restaurant',
          image_url: 'https://example.com/image.jpg',
          rating: 4.8,
          price: '$$$',
          location: { display_address: ['123 Flow St', 'Flow City, CA'] },
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
          phone: '+1-555-123-4567',
        },
      ],
      total: 1,
    };

    const mockRestaurantDetails = {
      ...mockSearchResults.businesses[0],
      hours: [{ is_open_now: true, open: [] }],
      transactions: ['delivery', 'pickup'],
    };

    const mockReviews = {
      reviews: [
        {
          id: 'review1',
          rating: 5,
          text: 'Great food!',
          user: { name: 'Test User' },
        },
      ],
      total: 1,
    };

    restaurantService.searchRestaurants.mockResolvedValue(mockSearchResults);
    restaurantService.getDietaryFilteredRestaurants.mockImplementation(
      (restaurants) => restaurants
    );
    restaurantService.getRestaurantDetails.mockResolvedValue(mockRestaurantDetails);
    restaurantService.getRestaurantReviews.mockResolvedValue(mockReviews);

    // 1. Search for restaurants
    const searchResponse = await request(app)
      .get('/api/discovery/restaurants/search')
      .query({ location: 'San Francisco, CA', term: 'sushi' })
      .expect(200);

    expect(searchResponse.body.data.businesses).toHaveLength(1);
    const restaurant = searchResponse.body.data.businesses[0];

    // 2. Get restaurant details
    const detailsResponse = await request(app)
      .get(`/api/discovery/restaurants/${restaurant.id}`)
      .expect(200);

    expect(detailsResponse.body.data.name).toBe('Flow Test Restaurant');

    // 3. Get restaurant reviews
    const reviewsResponse = await request(app)
      .get(`/api/discovery/restaurants/${restaurant.id}/reviews`)
      .expect(200);

    expect(reviewsResponse.body.data.reviews).toHaveLength(1);
    expect(reviewsResponse.body.data.reviews[0].rating).toBe(5);

    console.log('✅ End-to-end restaurant discovery flow completed successfully');
  });
});