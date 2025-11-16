#!/usr/bin/env node
/**
 * Comprehensive API Integration Test Runner
 * Runs all API tests and generates unified reports
 */

import RestaurantAPITester from './restaurant-api-test.js';
import RecipeAPITester from './recipe-api-test.js';
import { promises as fs } from 'fs';

class APIIntegrationTestSuite {
  constructor() {
    this.results = {
      restaurants: null,
      recipes: null,
      summary: {},
      timestamp: new Date().toISOString()
    };
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 Starting Complete API Integration Test Suite');
    console.log('===============================================');
    console.log(`📅 Test Started: ${new Date().toLocaleString()}`);
    console.log('');

    try {
      // Run restaurant API tests
      console.log('📍 TESTING RESTAURANT APIs');
      console.log('==========================');
      const restaurantTester = new RestaurantAPITester();
      this.results.restaurants = await restaurantTester.run();

      console.log('🍽️ TESTING RECIPE APIs');
      console.log('=======================');
      const recipeTester = new RecipeAPITester();
      this.results.recipes = await recipeTester.run();

      // Generate comprehensive summary
      await this.generateComprehensiveSummary();

      // Generate cost analysis
      await this.generateCostAnalysis();

      // Save all results
      await this.saveCompleteResults();

      console.log('✅ All API integration tests completed successfully!');

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      throw error;
    }
  }

  async generateComprehensiveSummary() {
    const totalTime = Date.now() - this.startTime;

    this.results.summary = {
      testDuration: totalTime,
      testDate: this.results.timestamp,
      overallStatus: this.calculateOverallStatus(),
      keyMetrics: this.calculateKeyMetrics(),
      recommendations: this.generateUnifiedRecommendations(),
      riskFactors: this.identifyRiskFactors(),
      costProjections: this.calculateBasicCostProjections(),
      nextSteps: this.suggestNextSteps()
    };

    console.log('📊 COMPREHENSIVE SUMMARY');
    console.log('========================');
    console.log(`Overall Status: ${this.results.summary.overallStatus}`);
    console.log(`Total Test Duration: ${totalTime}ms`);
    console.log('');

    console.log('🎯 KEY METRICS:');
    Object.entries(this.results.summary.keyMetrics).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log('');

    console.log('💡 UNIFIED RECOMMENDATIONS:');
    this.results.summary.recommendations.forEach(rec => console.log(`  ${rec}`));
    console.log('');

    console.log('⚠️ RISK FACTORS:');
    this.results.summary.riskFactors.forEach(risk => console.log(`  ${risk}`));
    console.log('');
  }

  calculateOverallStatus() {
    const restaurantSuccess = this.results.restaurants?.summary?.apiStatus?.yelp ||
                             this.results.restaurants?.summary?.apiStatus?.googlePlaces;
    const recipeSuccess = this.results.recipes?.summary?.apiStatus?.spoonacular ||
                         this.results.recipes?.summary?.apiStatus?.edamam;

    if (restaurantSuccess && recipeSuccess) {
      return '🟢 READY FOR IMPLEMENTATION';
    } else if (restaurantSuccess || recipeSuccess) {
      return '🟡 PARTIAL SUCCESS - NEEDS ATTENTION';
    } else {
      return '🔴 CRITICAL ISSUES - BLOCKED';
    }
  }

  calculateKeyMetrics() {
    const metrics = {};

    // Restaurant metrics
    const restaurantCount = (this.results.restaurants?.summary?.totalRestaurants?.yelp || 0) +
                           (this.results.restaurants?.summary?.totalRestaurants?.googlePlaces || 0);

    metrics['Total Restaurants Available'] = restaurantCount;
    metrics['Atlanta Coverage'] = restaurantCount >= 50 ? '✅ Sufficient' : '❌ Insufficient';

    // Recipe metrics
    const recipeCount = (this.results.recipes?.summary?.totalRecipes?.spoonacular || 0) +
                       (this.results.recipes?.summary?.totalRecipes?.edamam || 0);

    metrics['Total Recipes Available'] = recipeCount;

    // Performance metrics
    const restaurantPerf = Math.min(
      this.results.restaurants?.yelp?.performance?.basicSearch || 9999,
      this.results.restaurants?.googlePlaces?.performance?.basicSearch || 9999
    );
    const recipePerf = Math.min(
      this.results.recipes?.spoonacular?.performance?.basicSearch || 9999,
      this.results.recipes?.edamam?.performance?.basicSearch || 9999
    );

    metrics['Best Restaurant API Response Time'] = `${restaurantPerf}ms`;
    metrics['Best Recipe API Response Time'] = `${recipePerf}ms`;
    metrics['Performance Target'] = restaurantPerf < 500 && recipePerf < 500 ? '✅ Met' : '❌ Not Met';

    return metrics;
  }

  generateUnifiedRecommendations() {
    const recommendations = [];

    // Combine recommendations from both test suites
    if (this.results.restaurants?.summary?.recommendations) {
      recommendations.push(...this.results.restaurants.summary.recommendations);
    }
    if (this.results.recipes?.summary?.recommendations) {
      recommendations.push(...this.results.recipes.summary.recommendations);
    }

    // Add strategic recommendations
    const restaurantCount = (this.results.restaurants?.summary?.totalRestaurants?.yelp || 0) +
                           (this.results.restaurants?.summary?.totalRestaurants?.googlePlaces || 0);
    const recipeCount = (this.results.recipes?.summary?.totalRecipes?.spoonacular || 0) +
                       (this.results.recipes?.summary?.totalRecipes?.edamam || 0);

    if (restaurantCount >= 50 && recipeCount >= 20) {
      recommendations.push('🎯 STRATEGIC: Both APIs provide sufficient content for MVP launch');
    }

    // API strategy recommendations
    const yelpSuccess = this.results.restaurants?.yelp?.success;
    const googleSuccess = this.results.restaurants?.googlePlaces?.success;
    const spoonacularSuccess = this.results.recipes?.spoonacular?.success;
    const edamamSuccess = this.results.recipes?.edamam?.success;

    if (yelpSuccess && spoonacularSuccess) {
      recommendations.push('🎯 STRATEGY: Use Yelp + Spoonacular as primary APIs');
    } else if (googleSuccess && edamamSuccess) {
      recommendations.push('🎯 STRATEGY: Use Google Places + Edamam as primary APIs');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  identifyRiskFactors() {
    const risks = [];

    // API availability risks
    const workingRestaurantAPIs = [
      this.results.restaurants?.yelp?.success,
      this.results.restaurants?.googlePlaces?.success
    ].filter(Boolean).length;

    const workingRecipeAPIs = [
      this.results.recipes?.spoonacular?.success,
      this.results.recipes?.edamam?.success
    ].filter(Boolean).length;

    if (workingRestaurantAPIs === 0) {
      risks.push('🔴 CRITICAL: No restaurant APIs working - app cannot function');
    } else if (workingRestaurantAPIs === 1) {
      risks.push('🟡 MEDIUM: Single point of failure for restaurant data');
    }

    if (workingRecipeAPIs === 0) {
      risks.push('🔴 CRITICAL: No recipe APIs working - limited app functionality');
    } else if (workingRecipeAPIs === 1) {
      risks.push('🟡 MEDIUM: Single point of failure for recipe data');
    }

    // Performance risks
    const restaurantPerf = Math.min(
      this.results.restaurants?.yelp?.performance?.basicSearch || 9999,
      this.results.restaurants?.googlePlaces?.performance?.basicSearch || 9999
    );
    const recipePerf = Math.min(
      this.results.recipes?.spoonacular?.performance?.basicSearch || 9999,
      this.results.recipes?.edamam?.performance?.basicSearch || 9999
    );

    if (restaurantPerf > 1000 || recipePerf > 1000) {
      risks.push('🟡 MEDIUM: API response times may impact user experience');
    }

    // Content volume risks
    const restaurantCount = (this.results.restaurants?.summary?.totalRestaurants?.yelp || 0) +
                           (this.results.restaurants?.summary?.totalRestaurants?.googlePlaces || 0);

    if (restaurantCount < 50) {
      risks.push('🟡 MEDIUM: Restaurant coverage may be insufficient for good user experience');
    }

    if (risks.length === 0) {
      risks.push('🟢 LOW: No critical risks identified in API integration');
    }

    return risks;
  }

  calculateBasicCostProjections() {
    // Basic cost projections based on common API pricing
    const projections = {
      estimatedMonthlyCost: 0,
      costPerUser: 0,
      notes: []
    };

    // Yelp Fusion: Free tier 5000 calls/month, then $0.50/1000 calls
    // Google Places: $17/1000 requests (Nearby Search)
    // Spoonacular: $0.004/request after free tier
    // Edamam: $0.006/request after free tier

    if (this.results.restaurants?.yelp?.success) {
      projections.notes.push('Yelp: 5000 free calls/month, then $0.50/1000');
    }
    if (this.results.restaurants?.googlePlaces?.success) {
      projections.notes.push('Google Places: ~$17/1000 requests');
    }
    if (this.results.recipes?.spoonacular?.success) {
      projections.notes.push('Spoonacular: ~$4/1000 requests');
    }
    if (this.results.recipes?.edamam?.success) {
      projections.notes.push('Edamam: ~$6/1000 requests');
    }

    // Rough calculation for 10k users, 3 API calls per session, 2 sessions/month
    const monthlyAPICalls = 10000 * 3 * 2; // 60k calls/month
    projections.estimatedMonthlyCost = Math.round((monthlyAPICalls * 0.01) * 100) / 100; // ~$0.01 average
    projections.costPerUser = Math.round((projections.estimatedMonthlyCost / 10000) * 10000) / 10000;

    projections.notes.push(`Estimated for 10k users: $${projections.estimatedMonthlyCost}/month`);
    projections.notes.push(`Cost per user per month: $${projections.costPerUser}`);

    return projections;
  }

  suggestNextSteps() {
    const steps = [];

    // Based on test results, suggest implementation priorities
    const yelpSuccess = this.results.restaurants?.yelp?.success;
    const spoonacularSuccess = this.results.recipes?.spoonacular?.success;

    if (yelpSuccess && spoonacularSuccess) {
      steps.push('1. Implement Yelp Fusion API integration for restaurant data');
      steps.push('2. Implement Spoonacular API integration for recipe data');
      steps.push('3. Set up API key management and rate limiting');
      steps.push('4. Implement error handling and fallback strategies');
    } else {
      steps.push('1. Resolve API authentication issues');
      steps.push('2. Re-run integration tests');
      steps.push('3. Consider alternative API providers');
    }

    steps.push('5. Implement caching strategy to minimize API costs');
    steps.push('6. Create monitoring and alerting for API health');
    steps.push('7. Load test with expected user volumes');

    return steps;
  }

  async generateCostAnalysis() {
    const costAnalysis = {
      pricingTiers: {
        yelp: {
          free: '5,000 calls/month',
          paid: '$0.50 per 1,000 calls'
        },
        googlePlaces: {
          free: '$200 credit/month (~11,764 calls)',
          paid: '$17 per 1,000 calls'
        },
        spoonacular: {
          free: '150 calls/day',
          paid: '$49/month for 10k calls'
        },
        edamam: {
          free: '5 calls/minute, 10k/month',
          paid: 'Custom pricing'
        }
      },
      scenarios: await this.calculateCostScenarios()
    };

    await fs.writeFile(
      'cost-analysis.json',
      JSON.stringify(costAnalysis, null, 2)
    );

    console.log('💰 Cost analysis generated');
  }

  async calculateCostScenarios() {
    const scenarios = {
      mvp: {
        users: 1000,
        sessionsPerUserPerMonth: 4,
        apiCallsPerSession: 3,
        monthlyCost: 0,
        breakdown: {}
      },
      growth: {
        users: 10000,
        sessionsPerUserPerMonth: 6,
        apiCallsPerSession: 4,
        monthlyCost: 0,
        breakdown: {}
      },
      scale: {
        users: 100000,
        sessionsPerUserPerMonth: 8,
        apiCallsPerSession: 5,
        monthlyCost: 0,
        breakdown: {}
      }
    };

    Object.keys(scenarios).forEach(scenario => {
      const s = scenarios[scenario];
      const totalCalls = s.users * s.sessionsPerUserPerMonth * s.apiCallsPerSession;

      // Rough cost calculation based on mixed API usage
      s.breakdown.restaurantAPI = Math.max(0, (totalCalls * 0.5 - 5000) * 0.0005); // Yelp pricing
      s.breakdown.recipeAPI = Math.max(0, totalCalls * 0.5 * 0.004); // Spoonacular pricing
      s.monthlyCost = s.breakdown.restaurantAPI + s.breakdown.recipeAPI;
    });

    return scenarios;
  }

  async saveCompleteResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = `api-integration-results-${timestamp}.json`;

    await fs.writeFile(
      resultsFile,
      JSON.stringify(this.results, null, 2)
    );

    console.log(`💾 Complete results saved to ${resultsFile}`);
  }
}

// Export for use in other modules
export { APIIntegrationTestSuite };

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new APIIntegrationTestSuite();
  await testSuite.runAllTests();
}