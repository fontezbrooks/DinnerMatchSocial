#!/usr/bin/env node
/**
 * Recipe API Testing Suite
 * Tests Spoonacular and Edamam Recipe APIs for DinnerMatch
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const TEST_CONFIG = {
  dietary_restrictions: [
    'vegan',
    'vegetarian',
    'gluten-free',
    'dairy-free',
    'nut-free',
    'low-carb',
    'keto',
    'paleo'
  ],
  cuisine_types: [
    'italian',
    'mexican',
    'asian',
    'american',
    'mediterranean',
    'indian',
    'thai',
    'french'
  ],
  difficulty_levels: ['easy', 'medium', 'hard'],
  max_prep_times: [15, 30, 45, 60], // minutes
  sample_recipes: 50
};

class RecipeAPITester {
  constructor() {
    this.results = {
      spoonacular: {
        success: false,
        recipes: [],
        performance: {},
        coverage: {},
        dataQuality: {},
        errors: []
      },
      edamam: {
        success: false,
        recipes: [],
        performance: {},
        coverage: {},
        dataQuality: {},
        errors: []
      },
      summary: {}
    };
    this.startTime = Date.now();
  }

  // Spoonacular API Tests
  async testSpoonacularAPI() {
    console.log('🔄 Testing Spoonacular Recipe API...');

    if (!process.env.SPOONACULAR_API_KEY) {
      this.results.spoonacular.errors.push('Missing SPOONACULAR_API_KEY environment variable');
      return;
    }

    try {
      const baseUrl = 'https://api.spoonacular.com/recipes';
      const apiKey = process.env.SPOONACULAR_API_KEY;

      // Basic recipe search test
      const basicSearchStart = Date.now();
      const basicResponse = await fetch(
        `${baseUrl}/complexSearch?apiKey=${apiKey}&number=${TEST_CONFIG.sample_recipes}&addRecipeInformation=true&fillIngredients=true`
      );

      if (!basicResponse.ok) {
        throw new Error(`HTTP ${basicResponse.status}: ${basicResponse.statusText}`);
      }

      const basicData = await basicResponse.json();
      const basicSearchTime = Date.now() - basicSearchStart;

      this.results.spoonacular.performance.basicSearch = basicSearchTime;
      this.results.spoonacular.recipes = basicData.results || [];

      console.log(`✅ Spoonacular basic search: ${this.results.spoonacular.recipes.length} recipes found in ${basicSearchTime}ms`);

      // Test dietary restrictions
      await this.testSpoonacularDietaryFilters();

      // Test cuisine types
      await this.testSpoonacularCuisineTypes();

      // Test recipe details
      await this.testSpoonacularRecipeDetails();

      // Test nutrition information
      await this.testSpoonacularNutrition();

      // Analyze data quality
      await this.analyzeSpoonacularDataQuality();

      this.results.spoonacular.success = true;

    } catch (error) {
      console.error('❌ Spoonacular API Error:', error.message);
      this.results.spoonacular.errors.push(error.message);
    }
  }

  async testSpoonacularDietaryFilters() {
    console.log('🔄 Testing Spoonacular dietary filters...');
    const dietaryResults = {};

    for (const diet of TEST_CONFIG.dietary_restrictions) {
      try {
        const startTime = Date.now();
        const data = await this.searchSpoonacular({ diet, number: 20 });
        const searchTime = Date.now() - startTime;

        dietaryResults[diet] = {
          count: data?.results?.length || 0,
          responseTime: searchTime,
          totalResults: data?.totalResults || 0
        };

        console.log(`  ${diet}: ${dietaryResults[diet].count} recipes in ${searchTime}ms (total available: ${dietaryResults[diet].totalResults})`);
      } catch (error) {
        dietaryResults[diet] = { error: error.message };
      }

      // Rate limiting delay
      await this.delay(200);
    }

    this.results.spoonacular.coverage.dietary = dietaryResults;
  }

  async testSpoonacularCuisineTypes() {
    console.log('🔄 Testing Spoonacular cuisine types...');
    const cuisineResults = {};

    for (const cuisine of TEST_CONFIG.cuisine_types) {
      try {
        const startTime = Date.now();
        const data = await this.searchSpoonacular({ cuisine, number: 20 });
        const searchTime = Date.now() - startTime;

        cuisineResults[cuisine] = {
          count: data?.results?.length || 0,
          responseTime: searchTime,
          totalResults: data?.totalResults || 0
        };

        console.log(`  ${cuisine}: ${cuisineResults[cuisine].count} recipes in ${searchTime}ms`);
      } catch (error) {
        cuisineResults[cuisine] = { error: error.message };
      }

      await this.delay(200);
    }

    this.results.spoonacular.coverage.cuisine = cuisineResults;
  }

  async testSpoonacularRecipeDetails() {
    console.log('🔄 Testing Spoonacular recipe details...');

    if (!this.results.spoonacular.recipes.length) return;

    const sampleRecipe = this.results.spoonacular.recipes[0];

    try {
      const startTime = Date.now();
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${sampleRecipe.id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}&includeNutrition=true`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const detailData = await response.json();
      const detailTime = Date.now() - startTime;

      this.results.spoonacular.performance.recipeDetail = detailTime;
      this.results.spoonacular.sampleDetail = detailData;

      console.log(`✅ Recipe detail fetch: ${detailTime}ms`);
    } catch (error) {
      console.error('❌ Recipe detail error:', error.message);
      this.results.spoonacular.errors.push(`Recipe detail: ${error.message}`);
    }
  }

  async testSpoonacularNutrition() {
    console.log('🔄 Testing Spoonacular nutrition data...');

    if (!this.results.spoonacular.recipes.length) return;

    const sampleRecipe = this.results.spoonacular.recipes[0];

    try {
      const startTime = Date.now();
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${sampleRecipe.id}/nutritionWidget.json?apiKey=${process.env.SPOONACULAR_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const nutritionData = await response.json();
      const nutritionTime = Date.now() - startTime;

      this.results.spoonacular.performance.nutrition = nutritionTime;
      this.results.spoonacular.sampleNutrition = nutritionData;

      console.log(`✅ Nutrition data fetch: ${nutritionTime}ms`);
    } catch (error) {
      console.error('❌ Nutrition data error:', error.message);
      this.results.spoonacular.errors.push(`Nutrition: ${error.message}`);
    }
  }

  async searchSpoonacular(params = {}) {
    const baseUrl = 'https://api.spoonacular.com/recipes/complexSearch';
    const queryParams = new URLSearchParams({
      apiKey: process.env.SPOONACULAR_API_KEY,
      addRecipeInformation: true,
      fillIngredients: true,
      number: 10,
      ...params
    });

    const response = await fetch(`${baseUrl}?${queryParams}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async analyzeSpoonacularDataQuality() {
    const recipes = this.results.spoonacular.recipes;
    if (!recipes.length) return;

    const quality = {
      hasImage: 0,
      hasInstructions: 0,
      hasIngredients: 0,
      hasNutrition: 0,
      hasCookingTime: 0,
      hasServings: 0,
      avgReadyInMinutes: 0,
      avgHealthScore: 0
    };

    let totalTime = 0;
    let totalHealthScore = 0;
    let timeCount = 0;
    let healthScoreCount = 0;

    recipes.forEach(recipe => {
      if (recipe.image) quality.hasImage++;
      if (recipe.instructions || recipe.analyzedInstructions?.length > 0) quality.hasInstructions++;
      if (recipe.extendedIngredients?.length > 0) quality.hasIngredients++;
      if (recipe.nutrition) quality.hasNutrition++;
      if (recipe.readyInMinutes) {
        quality.hasCookingTime++;
        totalTime += recipe.readyInMinutes;
        timeCount++;
      }
      if (recipe.servings) quality.hasServings++;
      if (recipe.healthScore !== undefined) {
        totalHealthScore += recipe.healthScore;
        healthScoreCount++;
      }
    });

    if (timeCount > 0) quality.avgReadyInMinutes = Math.round(totalTime / timeCount);
    if (healthScoreCount > 0) quality.avgHealthScore = Math.round(totalHealthScore / healthScoreCount);

    // Convert to percentages
    Object.keys(quality).forEach(key => {
      if (key.startsWith('has')) {
        quality[key] = Math.round((quality[key] / recipes.length) * 100);
      }
    });

    this.results.spoonacular.dataQuality = quality;
  }

  // Edamam Recipe API Tests
  async testEdamamAPI() {
    console.log('🔄 Testing Edamam Recipe API...');

    if (!process.env.EDAMAM_RECIPE_APP_ID || !process.env.EDAMAM_RECIPE_APP_KEY) {
      this.results.edamam.errors.push('Missing EDAMAM_RECIPE_APP_ID or EDAMAM_RECIPE_APP_KEY environment variable');
      return;
    }

    try {
      const baseUrl = 'https://api.edamam.com/api/recipes/v2';
      const appId = process.env.EDAMAM_RECIPE_APP_ID;
      const appKey = process.env.EDAMAM_RECIPE_APP_KEY;

      // Basic recipe search test
      const basicSearchStart = Date.now();
      const basicResponse = await fetch(
        `${baseUrl}?type=public&q=chicken&app_id=${appId}&app_key=${appKey}&from=0&to=20&field=uri&field=label&field=image&field=source&field=url&field=dietLabels&field=healthLabels&field=ingredientLines&field=ingredients&field=calories&field=totalTime&field=cuisineType&field=mealType&field=dishType&field=totalNutrients&field=totalDaily&field=digest`
      );

      if (!basicResponse.ok) {
        throw new Error(`HTTP ${basicResponse.status}: ${basicResponse.statusText}`);
      }

      const basicData = await basicResponse.json();
      const basicSearchTime = Date.now() - basicSearchStart;

      this.results.edamam.performance.basicSearch = basicSearchTime;
      this.results.edamam.recipes = basicData.hits?.map(hit => hit.recipe) || [];

      console.log(`✅ Edamam basic search: ${this.results.edamam.recipes.length} recipes found in ${basicSearchTime}ms`);

      // Test dietary restrictions
      await this.testEdamamDietaryFilters();

      // Test cuisine types
      await this.testEdamamCuisineTypes();

      // Analyze data quality
      await this.analyzeEdamamDataQuality();

      this.results.edamam.success = true;

    } catch (error) {
      console.error('❌ Edamam API Error:', error.message);
      this.results.edamam.errors.push(error.message);
    }
  }

  async testEdamamDietaryFilters() {
    console.log('🔄 Testing Edamam dietary filters...');
    const dietaryResults = {};

    const healthLabels = {
      'vegan': 'vegan',
      'vegetarian': 'vegetarian',
      'gluten-free': 'gluten-free',
      'dairy-free': 'dairy-free',
      'nut-free': 'tree-nut-free',
      'low-carb': 'low-carb',
      'keto': 'keto-friendly',
      'paleo': 'paleo'
    };

    for (const [diet, healthLabel] of Object.entries(healthLabels)) {
      try {
        const startTime = Date.now();
        const data = await this.searchEdamam({ health: healthLabel });
        const searchTime = Date.now() - startTime;

        dietaryResults[diet] = {
          count: data?.hits?.length || 0,
          responseTime: searchTime,
          totalResults: data?.count || 0
        };

        console.log(`  ${diet}: ${dietaryResults[diet].count} recipes in ${searchTime}ms (total available: ${dietaryResults[diet].totalResults})`);
      } catch (error) {
        dietaryResults[diet] = { error: error.message };
      }

      await this.delay(200);
    }

    this.results.edamam.coverage.dietary = dietaryResults;
  }

  async testEdamamCuisineTypes() {
    console.log('🔄 Testing Edamam cuisine types...');
    const cuisineResults = {};

    const cuisineMap = {
      'italian': 'italian',
      'mexican': 'mexican',
      'asian': 'asian',
      'american': 'american',
      'mediterranean': 'mediterranean',
      'indian': 'indian',
      'thai': 'south east asian',
      'french': 'french'
    };

    for (const [cuisine, edamamCuisine] of Object.entries(cuisineMap)) {
      try {
        const startTime = Date.now();
        const data = await this.searchEdamam({ cuisineType: edamamCuisine });
        const searchTime = Date.now() - startTime;

        cuisineResults[cuisine] = {
          count: data?.hits?.length || 0,
          responseTime: searchTime,
          totalResults: data?.count || 0
        };

        console.log(`  ${cuisine}: ${cuisineResults[cuisine].count} recipes in ${searchTime}ms`);
      } catch (error) {
        cuisineResults[cuisine] = { error: error.message };
      }

      await this.delay(200);
    }

    this.results.edamam.coverage.cuisine = cuisineResults;
  }

  async searchEdamam(params = {}) {
    const baseUrl = 'https://api.edamam.com/api/recipes/v2';
    const queryParams = new URLSearchParams({
      type: 'public',
      q: 'recipe',
      app_id: process.env.EDAMAM_RECIPE_APP_ID,
      app_key: process.env.EDAMAM_RECIPE_APP_KEY,
      from: 0,
      to: 20,
      field: [
        'uri', 'label', 'image', 'source', 'url', 'dietLabels',
        'healthLabels', 'ingredientLines', 'ingredients', 'calories',
        'totalTime', 'cuisineType', 'mealType', 'dishType',
        'totalNutrients', 'totalDaily', 'digest'
      ].join(','),
      ...params
    });

    const response = await fetch(`${baseUrl}?${queryParams}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async analyzeEdamamDataQuality() {
    const recipes = this.results.edamam.recipes;
    if (!recipes.length) return;

    const quality = {
      hasImage: 0,
      hasIngredients: 0,
      hasNutrition: 0,
      hasCookingTime: 0,
      hasCalories: 0,
      hasHealthLabels: 0,
      hasDietLabels: 0,
      avgCalories: 0,
      avgTotalTime: 0
    };

    let totalCalories = 0;
    let totalTime = 0;
    let caloriesCount = 0;
    let timeCount = 0;

    recipes.forEach(recipe => {
      if (recipe.image) quality.hasImage++;
      if (recipe.ingredientLines?.length > 0) quality.hasIngredients++;
      if (recipe.totalNutrients || recipe.totalDaily) quality.hasNutrition++;
      if (recipe.totalTime) {
        quality.hasCookingTime++;
        totalTime += recipe.totalTime;
        timeCount++;
      }
      if (recipe.calories) {
        quality.hasCalories++;
        totalCalories += recipe.calories;
        caloriesCount++;
      }
      if (recipe.healthLabels?.length > 0) quality.hasHealthLabels++;
      if (recipe.dietLabels?.length > 0) quality.hasDietLabels++;
    });

    if (caloriesCount > 0) quality.avgCalories = Math.round(totalCalories / caloriesCount);
    if (timeCount > 0) quality.avgTotalTime = Math.round(totalTime / timeCount);

    // Convert to percentages
    Object.keys(quality).forEach(key => {
      if (key.startsWith('has')) {
        quality[key] = Math.round((quality[key] / recipes.length) * 100);
      }
    });

    this.results.edamam.dataQuality = quality;
  }

  // Rate Limit Testing
  async testRecipeAPIRateLimits() {
    console.log('🔄 Testing Recipe API rate limits...');

    const rateLimitResults = {
      spoonacular: await this.testSpoonacularRateLimit(),
      edamam: await this.testEdamamRateLimit()
    };

    this.results.rateLimits = rateLimitResults;
  }

  async testSpoonacularRateLimit() {
    if (!process.env.SPOONACULAR_API_KEY) return { error: 'No API key provided' };

    console.log('  Testing Spoonacular rate limit...');
    const requests = [];
    const startTime = Date.now();

    for (let i = 0; i < 5; i++) {
      requests.push(this.makeSpoonacularRequest().catch(e => ({ error: e.message })));
    }

    const results = await Promise.all(requests);
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;
    const totalTime = Date.now() - startTime;

    return {
      requests: 5,
      successful: successCount,
      failed: errorCount,
      totalTime,
      averageTime: Math.round(totalTime / 5),
      errors: results.filter(r => r.error).map(r => r.error)
    };
  }

  async testEdamamRateLimit() {
    if (!process.env.EDAMAM_RECIPE_APP_ID || !process.env.EDAMAM_RECIPE_APP_KEY) {
      return { error: 'No API credentials provided' };
    }

    console.log('  Testing Edamam rate limit...');
    const requests = [];
    const startTime = Date.now();

    for (let i = 0; i < 5; i++) {
      requests.push(this.makeEdamamRequest().catch(e => ({ error: e.message })));
    }

    const results = await Promise.all(requests);
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;
    const totalTime = Date.now() - startTime;

    return {
      requests: 5,
      successful: successCount,
      failed: errorCount,
      totalTime,
      averageTime: Math.round(totalTime / 5),
      errors: results.filter(r => r.error).map(r => r.error)
    };
  }

  async makeSpoonacularRequest() {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOONACULAR_API_KEY}&number=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async makeEdamamRequest() {
    const response = await fetch(
      `https://api.edamam.com/api/recipes/v2?type=public&q=test&app_id=${process.env.EDAMAM_RECIPE_APP_ID}&app_key=${process.env.EDAMAM_RECIPE_APP_KEY}&from=0&to=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Utility methods
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Results Generation
  generateSummary() {
    const totalTime = Date.now() - this.startTime;

    this.results.summary = {
      testDuration: totalTime,
      totalRecipes: {
        spoonacular: this.results.spoonacular.recipes.length,
        edamam: this.results.edamam.recipes.length
      },
      apiStatus: {
        spoonacular: this.results.spoonacular.success,
        edamam: this.results.edamam.success
      },
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };

    return this.results;
  }

  generateRecommendations() {
    const recommendations = [];

    // API availability
    if (this.results.spoonacular.success && this.results.edamam.success) {
      recommendations.push('✅ Both recipe APIs are functional and accessible');
    } else if (this.results.spoonacular.success || this.results.edamam.success) {
      recommendations.push('⚠️ Only one recipe API is functional - consider primary/backup strategy');
    } else {
      recommendations.push('❌ Both recipe APIs have issues - investigate authentication');
    }

    // Performance recommendations
    const spoonacularPerf = this.results.spoonacular.performance?.basicSearch;
    const edamamPerf = this.results.edamam.performance?.basicSearch;

    if (spoonacularPerf && spoonacularPerf < 500) {
      recommendations.push('✅ Spoonacular meets performance requirements (<500ms)');
    }
    if (edamamPerf && edamamPerf < 500) {
      recommendations.push('✅ Edamam meets performance requirements (<500ms)');
    }

    // Data quality recommendations
    const spoonacularQuality = this.results.spoonacular.dataQuality;
    const edamamQuality = this.results.edamam.dataQuality;

    if (spoonacularQuality?.hasImage > 90) {
      recommendations.push('✅ Spoonacular provides excellent image coverage');
    }
    if (edamamQuality?.hasImage > 90) {
      recommendations.push('✅ Edamam provides excellent image coverage');
    }

    if (spoonacularQuality?.hasNutrition > 80) {
      recommendations.push('✅ Spoonacular provides good nutrition data coverage');
    }
    if (edamamQuality?.hasNutrition > 80) {
      recommendations.push('✅ Edamam provides good nutrition data coverage');
    }

    // Dietary filter recommendations
    const spoonacularDietary = this.results.spoonacular.coverage?.dietary;
    const edamamDietary = this.results.edamam.coverage?.dietary;

    if (spoonacularDietary && Object.values(spoonacularDietary).some(d => d.count > 10)) {
      recommendations.push('✅ Spoonacular supports adequate dietary filtering');
    }
    if (edamamDietary && Object.values(edamamDietary).some(d => d.count > 10)) {
      recommendations.push('✅ Edamam supports adequate dietary filtering');
    }

    return recommendations;
  }

  // Main execution
  async run() {
    console.log('🚀 Starting Recipe API Integration Tests');
    console.log('');

    // Run API tests
    await this.testSpoonacularAPI();
    console.log('');

    await this.testEdamamAPI();
    console.log('');

    await this.testRecipeAPIRateLimits();
    console.log('');

    // Generate results
    const results = this.generateSummary();

    console.log('📊 RECIPE API TEST RESULTS');
    console.log('=====================================');
    console.log(`Total Test Duration: ${results.summary.testDuration}ms`);
    console.log(`Spoonacular Recipes Found: ${results.summary.totalRecipes.spoonacular}`);
    console.log(`Edamam Recipes Found: ${results.summary.totalRecipes.edamam}`);
    console.log('');

    console.log('🎯 RECOMMENDATIONS:');
    results.summary.recommendations.forEach(rec => console.log(`  ${rec}`));
    console.log('');

    // Save results to file
    await this.saveResults();

    return results;
  }

  async saveResults() {
    const fs = await import('fs');
    const resultsFile = 'recipe-api-results.json';

    try {
      await fs.promises.writeFile(
        resultsFile,
        JSON.stringify(this.results, null, 2)
      );
      console.log(`💾 Results saved to ${resultsFile}`);
    } catch (error) {
      console.error('❌ Failed to save results:', error.message);
    }
  }
}

// Export for use in other modules
export default RecipeAPITester;

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new RecipeAPITester();
  await tester.run();
}