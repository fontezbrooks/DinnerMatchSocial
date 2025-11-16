#!/usr/bin/env node
/**
 * Restaurant API Testing Suite
 * Tests Yelp Fusion API and Google Places API for DinnerMatch
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const TEST_CONFIG = {
  location: {
    latitude: parseFloat(process.env.TEST_LOCATION_LAT || '33.7490'),
    longitude: parseFloat(process.env.TEST_LOCATION_LNG || '-84.3880'),
    name: process.env.TEST_LOCATION_NAME || 'Atlanta',
    radius: parseInt(process.env.TEST_RADIUS_METERS || '5000')
  },
  dietary_filters: [
    'vegan',
    'vegetarian',
    'gluten_free',
    'kosher',
    'halal'
  ],
  cuisine_types: [
    'italian',
    'mexican',
    'chinese',
    'japanese',
    'indian',
    'american',
    'mediterranean',
    'thai',
    'korean',
    'french'
  ],
  price_ranges: [1, 2, 3, 4]
};

class RestaurantAPITester {
  constructor() {
    this.results = {
      yelp: {
        success: false,
        restaurants: [],
        performance: {},
        coverage: {},
        errors: []
      },
      googlePlaces: {
        success: false,
        restaurants: [],
        performance: {},
        coverage: {},
        errors: []
      },
      summary: {}
    };
    this.startTime = Date.now();
  }

  // Yelp Fusion API Tests
  async testYelpFusionAPI() {
    console.log('🔄 Testing Yelp Fusion API...');

    if (!process.env.YELP_API_KEY) {
      this.results.yelp.errors.push('Missing YELP_API_KEY environment variable');
      return;
    }

    try {
      const baseUrl = 'https://api.yelp.com/v3/businesses/search';
      const headers = {
        'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
        'Accept': 'application/json'
      };

      // Basic search test
      const basicSearchStart = Date.now();
      const basicResponse = await fetch(
        `${baseUrl}?location=${TEST_CONFIG.location.name}&radius=${TEST_CONFIG.location.radius}&categories=restaurants&limit=50`,
        { headers }
      );

      if (!basicResponse.ok) {
        throw new Error(`HTTP ${basicResponse.status}: ${basicResponse.statusText}`);
      }

      const basicData = await basicResponse.json();
      const basicSearchTime = Date.now() - basicSearchStart;

      this.results.yelp.performance.basicSearch = basicSearchTime;
      this.results.yelp.restaurants = basicData.businesses || [];

      console.log(`✅ Yelp basic search: ${this.results.yelp.restaurants.length} restaurants found in ${basicSearchTime}ms`);

      // Test dietary restrictions
      await this.testYelpDietaryFilters(headers);

      // Test cuisine types
      await this.testYelpCuisineTypes(headers);

      // Test price ranges
      await this.testYelpPriceRanges(headers);

      // Analyze data quality
      await this.analyzeYelpDataQuality();

      this.results.yelp.success = true;

    } catch (error) {
      console.error('❌ Yelp API Error:', error.message);
      this.results.yelp.errors.push(error.message);
    }
  }

  async testYelpDietaryFilters(headers) {
    console.log('🔄 Testing Yelp dietary filters...');
    const dietaryResults = {};

    for (const diet of TEST_CONFIG.dietary_filters) {
      try {
        const searchTerms = this.getDietarySearchTerms(diet);
        const promises = searchTerms.map(term =>
          this.searchYelp(headers, { term, dietary: diet })
        );

        const results = await Promise.all(promises);
        const totalResults = results.reduce((sum, r) => sum + (r?.businesses?.length || 0), 0);

        dietaryResults[diet] = {
          totalFound: totalResults,
          searchTerms: searchTerms.length,
          averagePerTerm: Math.round(totalResults / searchTerms.length)
        };

        console.log(`  ${diet}: ${totalResults} restaurants found`);
      } catch (error) {
        dietaryResults[diet] = { error: error.message };
      }
    }

    this.results.yelp.coverage.dietary = dietaryResults;
  }

  async testYelpCuisineTypes(headers) {
    console.log('🔄 Testing Yelp cuisine types...');
    const cuisineResults = {};

    for (const cuisine of TEST_CONFIG.cuisine_types) {
      try {
        const startTime = Date.now();
        const data = await this.searchYelp(headers, { categories: cuisine });
        const searchTime = Date.now() - startTime;

        cuisineResults[cuisine] = {
          count: data?.businesses?.length || 0,
          responseTime: searchTime
        };

        console.log(`  ${cuisine}: ${cuisineResults[cuisine].count} restaurants in ${searchTime}ms`);
      } catch (error) {
        cuisineResults[cuisine] = { error: error.message };
      }
    }

    this.results.yelp.coverage.cuisine = cuisineResults;
  }

  async testYelpPriceRanges(headers) {
    console.log('🔄 Testing Yelp price ranges...');
    const priceResults = {};

    for (const price of TEST_CONFIG.price_ranges) {
      try {
        const data = await this.searchYelp(headers, { price });
        priceResults[price] = {
          count: data?.businesses?.length || 0
        };
        console.log(`  Price ${price}: ${priceResults[price].count} restaurants`);
      } catch (error) {
        priceResults[price] = { error: error.message };
      }
    }

    this.results.yelp.coverage.price = priceResults;
  }

  async searchYelp(headers, params = {}) {
    const baseUrl = 'https://api.yelp.com/v3/businesses/search';
    const queryParams = new URLSearchParams({
      location: TEST_CONFIG.location.name,
      radius: TEST_CONFIG.location.radius,
      categories: 'restaurants',
      limit: 20,
      ...params
    });

    const response = await fetch(`${baseUrl}?${queryParams}`, { headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async analyzeYelpDataQuality() {
    const restaurants = this.results.yelp.restaurants;
    if (!restaurants.length) return;

    const quality = {
      hasPhotos: 0,
      hasReviews: 0,
      hasHours: 0,
      hasPhone: 0,
      hasAddress: 0,
      avgRating: 0,
      avgReviewCount: 0
    };

    let totalRating = 0;
    let totalReviews = 0;

    restaurants.forEach(restaurant => {
      if (restaurant.photos && restaurant.photos.length > 0) quality.hasPhotos++;
      if (restaurant.review_count > 0) quality.hasReviews++;
      if (restaurant.hours) quality.hasHours++;
      if (restaurant.phone) quality.hasPhone++;
      if (restaurant.location) quality.hasAddress++;

      totalRating += restaurant.rating || 0;
      totalReviews += restaurant.review_count || 0;
    });

    quality.avgRating = (totalRating / restaurants.length).toFixed(2);
    quality.avgReviewCount = Math.round(totalReviews / restaurants.length);

    // Convert to percentages
    Object.keys(quality).forEach(key => {
      if (key.startsWith('has')) {
        quality[key] = Math.round((quality[key] / restaurants.length) * 100);
      }
    });

    this.results.yelp.dataQuality = quality;
  }

  // Google Places API Tests
  async testGooglePlacesAPI() {
    console.log('🔄 Testing Google Places API...');

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      this.results.googlePlaces.errors.push('Missing GOOGLE_PLACES_API_KEY environment variable');
      return;
    }

    try {
      const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

      // Basic search test
      const basicSearchStart = Date.now();
      const basicResponse = await fetch(
        `${baseUrl}?location=${TEST_CONFIG.location.latitude},${TEST_CONFIG.location.longitude}&radius=${TEST_CONFIG.location.radius}&type=restaurant&key=${process.env.GOOGLE_PLACES_API_KEY}`
      );

      if (!basicResponse.ok) {
        throw new Error(`HTTP ${basicResponse.status}: ${basicResponse.statusText}`);
      }

      const basicData = await basicResponse.json();
      const basicSearchTime = Date.now() - basicSearchStart;

      this.results.googlePlaces.performance.basicSearch = basicSearchTime;
      this.results.googlePlaces.restaurants = basicData.results || [];

      console.log(`✅ Google Places basic search: ${this.results.googlePlaces.restaurants.length} restaurants found in ${basicSearchTime}ms`);

      // Test text search for dietary restrictions
      await this.testGooglePlacesDietaryFilters();

      // Analyze data quality
      await this.analyzeGooglePlacesDataQuality();

      this.results.googlePlaces.success = true;

    } catch (error) {
      console.error('❌ Google Places API Error:', error.message);
      this.results.googlePlaces.errors.push(error.message);
    }
  }

  async testGooglePlacesDietaryFilters() {
    console.log('🔄 Testing Google Places dietary filters...');
    const dietaryResults = {};

    for (const diet of TEST_CONFIG.dietary_filters) {
      try {
        const searchTerms = this.getDietarySearchTerms(diet);
        const promises = searchTerms.map(term =>
          this.searchGooglePlaces(term)
        );

        const results = await Promise.all(promises);
        const totalResults = results.reduce((sum, r) => sum + (r?.results?.length || 0), 0);

        dietaryResults[diet] = {
          totalFound: totalResults,
          searchTerms: searchTerms.length,
          averagePerTerm: Math.round(totalResults / searchTerms.length)
        };

        console.log(`  ${diet}: ${totalResults} restaurants found`);
      } catch (error) {
        dietaryResults[diet] = { error: error.message };
      }
    }

    this.results.googlePlaces.coverage.dietary = dietaryResults;
  }

  async searchGooglePlaces(query) {
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    const params = new URLSearchParams({
      query: `${query} restaurant ${TEST_CONFIG.location.name}`,
      location: `${TEST_CONFIG.location.latitude},${TEST_CONFIG.location.longitude}`,
      radius: TEST_CONFIG.location.radius,
      type: 'restaurant',
      key: process.env.GOOGLE_PLACES_API_KEY
    });

    const response = await fetch(`${baseUrl}?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async analyzeGooglePlacesDataQuality() {
    const restaurants = this.results.googlePlaces.restaurants;
    if (!restaurants.length) return;

    const quality = {
      hasPhotos: 0,
      hasRating: 0,
      hasUserRatingsTotal: 0,
      hasGeometry: 0,
      hasFormattedAddress: 0,
      avgRating: 0,
      avgUserRatingsTotal: 0
    };

    let totalRating = 0;
    let totalUserRatings = 0;
    let ratingCount = 0;
    let userRatingCount = 0;

    restaurants.forEach(restaurant => {
      if (restaurant.photos && restaurant.photos.length > 0) quality.hasPhotos++;
      if (restaurant.rating) {
        quality.hasRating++;
        totalRating += restaurant.rating;
        ratingCount++;
      }
      if (restaurant.user_ratings_total) {
        quality.hasUserRatingsTotal++;
        totalUserRatings += restaurant.user_ratings_total;
        userRatingCount++;
      }
      if (restaurant.geometry) quality.hasGeometry++;
      if (restaurant.formatted_address) quality.hasFormattedAddress++;
    });

    if (ratingCount > 0) quality.avgRating = (totalRating / ratingCount).toFixed(2);
    if (userRatingCount > 0) quality.avgUserRatingsTotal = Math.round(totalUserRatings / userRatingCount);

    // Convert to percentages
    Object.keys(quality).forEach(key => {
      if (key.startsWith('has')) {
        quality[key] = Math.round((quality[key] / restaurants.length) * 100);
      }
    });

    this.results.googlePlaces.dataQuality = quality;
  }

  getDietarySearchTerms(diet) {
    const terms = {
      'vegan': ['vegan', 'plant-based', 'vegan-friendly'],
      'vegetarian': ['vegetarian', 'veggie', 'vegetarian-friendly'],
      'gluten_free': ['gluten-free', 'gluten free', 'celiac-friendly'],
      'kosher': ['kosher', 'kosher-certified'],
      'halal': ['halal', 'halal-certified']
    };
    return terms[diet] || [diet];
  }

  // Performance and Rate Limit Testing
  async testRateLimits() {
    console.log('🔄 Testing API rate limits...');

    const rateLimitResults = {
      yelp: await this.testYelpRateLimit(),
      googlePlaces: await this.testGooglePlacesRateLimit()
    };

    this.results.rateLimits = rateLimitResults;
  }

  async testYelpRateLimit() {
    if (!process.env.YELP_API_KEY) return { error: 'No API key provided' };

    console.log('  Testing Yelp rate limit...');
    const requests = [];
    const startTime = Date.now();

    for (let i = 0; i < 10; i++) {
      requests.push(this.makeYelpRequest().catch(e => ({ error: e.message })));
    }

    const results = await Promise.all(requests);
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;
    const totalTime = Date.now() - startTime;

    return {
      requests: 10,
      successful: successCount,
      failed: errorCount,
      totalTime,
      averageTime: Math.round(totalTime / 10),
      errors: results.filter(r => r.error).map(r => r.error)
    };
  }

  async testGooglePlacesRateLimit() {
    if (!process.env.GOOGLE_PLACES_API_KEY) return { error: 'No API key provided' };

    console.log('  Testing Google Places rate limit...');
    const requests = [];
    const startTime = Date.now();

    for (let i = 0; i < 10; i++) {
      requests.push(this.makeGooglePlacesRequest().catch(e => ({ error: e.message })));
    }

    const results = await Promise.all(requests);
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;
    const totalTime = Date.now() - startTime;

    return {
      requests: 10,
      successful: successCount,
      failed: errorCount,
      totalTime,
      averageTime: Math.round(totalTime / 10),
      errors: results.filter(r => r.error).map(r => r.error)
    };
  }

  async makeYelpRequest() {
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?location=${TEST_CONFIG.location.name}&categories=restaurants&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async makeGooglePlacesRequest() {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${TEST_CONFIG.location.latitude},${TEST_CONFIG.location.longitude}&radius=1000&type=restaurant&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Results Generation
  generateSummary() {
    const totalTime = Date.now() - this.startTime;

    this.results.summary = {
      testDuration: totalTime,
      totalRestaurants: {
        yelp: this.results.yelp.restaurants.length,
        googlePlaces: this.results.googlePlaces.restaurants.length
      },
      apiStatus: {
        yelp: this.results.yelp.success,
        googlePlaces: this.results.googlePlaces.success
      },
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };

    return this.results;
  }

  generateRecommendations() {
    const recommendations = [];

    // Restaurant count recommendation
    const yelpCount = this.results.yelp.restaurants.length;
    const googleCount = this.results.googlePlaces.restaurants.length;

    if (yelpCount >= 50) {
      recommendations.push('✅ Yelp provides sufficient restaurant coverage for Atlanta');
    } else if (yelpCount + googleCount >= 50) {
      recommendations.push('⚠️ Use Yelp + Google Places combined for sufficient coverage');
    } else {
      recommendations.push('❌ Both APIs may not provide sufficient restaurant coverage');
    }

    // Performance recommendation
    const yelpPerf = this.results.yelp.performance?.basicSearch;
    const googlePerf = this.results.googlePlaces.performance?.basicSearch;

    if (yelpPerf && yelpPerf < 500) {
      recommendations.push('✅ Yelp API meets performance requirements (<500ms)');
    }
    if (googlePerf && googlePerf < 500) {
      recommendations.push('✅ Google Places API meets performance requirements (<500ms)');
    }

    // Data quality recommendations
    const yelpQuality = this.results.yelp.dataQuality;
    const googleQuality = this.results.googlePlaces.dataQuality;

    if (yelpQuality?.hasPhotos > 80) {
      recommendations.push('✅ Yelp provides good photo coverage');
    }
    if (googleQuality?.hasPhotos > 80) {
      recommendations.push('✅ Google Places provides good photo coverage');
    }

    return recommendations;
  }

  // Main execution
  async run() {
    console.log('🚀 Starting Restaurant API Integration Tests');
    console.log(`📍 Test Location: ${TEST_CONFIG.location.name} (${TEST_CONFIG.location.latitude}, ${TEST_CONFIG.location.longitude})`);
    console.log(`📏 Search Radius: ${TEST_CONFIG.location.radius}m`);
    console.log('');

    // Run API tests
    await this.testYelpFusionAPI();
    console.log('');

    await this.testGooglePlacesAPI();
    console.log('');

    await this.testRateLimits();
    console.log('');

    // Generate results
    const results = this.generateSummary();

    console.log('📊 RESTAURANT API TEST RESULTS');
    console.log('=====================================');
    console.log(`Total Test Duration: ${results.summary.testDuration}ms`);
    console.log(`Yelp Restaurants Found: ${results.summary.totalRestaurants.yelp}`);
    console.log(`Google Places Restaurants Found: ${results.summary.totalRestaurants.googlePlaces}`);
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
    const resultsFile = 'restaurant-api-results.json';

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
export default RestaurantAPITester;

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new RestaurantAPITester();
  await tester.run();
}