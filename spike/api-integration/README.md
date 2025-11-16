# DinnerMatch API Integration Testing

This directory contains comprehensive testing utilities for validating restaurant and recipe APIs for the DinnerMatch social dining application.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up API keys:**
   ```bash
   npm run setup
   ```

3. **Run all tests:**
   ```bash
   npm test
   ```

## Overview

The API integration testing suite evaluates four primary APIs:

### Restaurant APIs
- **Yelp Fusion API** - Primary restaurant search and data
- **Google Places API** - Fallback restaurant search

### Recipe APIs
- **Spoonacular Recipe API** - Primary recipe search and nutrition
- **Edamam Recipe API** - Fallback recipe search

## Test Suite Components

### Core Test Files

#### `restaurant-api-test.js`
Tests restaurant API functionality including:
- Basic restaurant search in Atlanta area
- Dietary restriction filtering (vegan, vegetarian, gluten-free, etc.)
- Cuisine type categorization
- Price range filtering
- Data quality assessment
- Performance benchmarking

#### `recipe-api-test.js`
Tests recipe API functionality including:
- Recipe search with dietary filters
- Nutrition information accuracy
- Recipe detail completeness
- Image availability
- Cooking time data
- Ingredient information

#### `test-runner.js`
Comprehensive test orchestrator that:
- Runs all API tests in sequence
- Generates unified reports
- Performs cost analysis
- Creates summary recommendations
- Saves detailed results

### Setup and Configuration

#### `setup-env.js`
Interactive setup wizard that:
- Guides through API key configuration
- Tests API connectivity
- Configures test location (default: Atlanta)
- Creates optimized .env file

#### `.env.example`
Template for environment configuration with all required API keys and settings.

## API Key Setup

### Required API Keys

1. **Yelp Fusion API**
   - Get key from: https://www.yelp.com/developers
   - Free tier: 5,000 calls/month
   - Environment variable: `YELP_API_KEY`

2. **Google Places API**
   - Get key from: https://console.cloud.google.com/
   - Enable: Places API, Nearby Search
   - Free tier: $200 credit/month
   - Environment variable: `GOOGLE_PLACES_API_KEY`

3. **Spoonacular Recipe API**
   - Get key from: https://spoonacular.com/food-api
   - Free tier: 150 calls/day
   - Environment variable: `SPOONACULAR_API_KEY`

4. **Edamam Recipe API**
   - Get credentials from: https://developer.edamam.com/
   - Free tier: 5 calls/minute, 10k/month
   - Environment variables: `EDAMAM_RECIPE_APP_ID`, `EDAMAM_RECIPE_APP_KEY`

### Configuration Setup

#### Automated Setup (Recommended)
```bash
npm run setup
```
This launches an interactive wizard that guides you through:
- API key configuration
- Test location setup
- Connectivity testing
- Environment file generation

#### Manual Setup
1. Copy `.env.example` to `.env`
2. Fill in your API keys
3. Adjust test location if needed (default: Atlanta)

## Usage

### Run All Tests
```bash
npm test
# or
npm run test:all
```

### Run Specific API Tests
```bash
# Test only restaurant APIs
npm run test:restaurants

# Test only recipe APIs
npm run test:recipes
```

### Individual Test Execution
```bash
# Run restaurant API tests
node restaurant-api-test.js

# Run recipe API tests
node recipe-api-test.js

# Run comprehensive test suite
node test-runner.js
```

## Test Configuration

### Environment Variables

#### Required API Keys
```env
YELP_API_KEY=your_yelp_api_key
GOOGLE_PLACES_API_KEY=your_google_places_key
SPOONACULAR_API_KEY=your_spoonacular_key
EDAMAM_RECIPE_APP_ID=your_edamam_app_id
EDAMAM_RECIPE_APP_KEY=your_edamam_app_key
```

#### Test Configuration
```env
TEST_LOCATION_LAT=33.7490      # Atlanta latitude
TEST_LOCATION_LNG=-84.3880     # Atlanta longitude
TEST_LOCATION_NAME=Atlanta     # City name for searches
TEST_RADIUS_METERS=5000        # Search radius
```

### Customizing Test Parameters

Edit the `TEST_CONFIG` object in test files to modify:

**Dietary Restrictions:**
- vegan, vegetarian, gluten-free, dairy-free, nut-free, low-carb, keto, paleo

**Cuisine Types:**
- italian, mexican, chinese, japanese, indian, american, mediterranean, thai, korean, french

**Price Ranges:**
- 1 ($), 2 ($$), 3 ($$$), 4 ($$$$)

## Test Results and Reports

### Generated Files

#### Test Results
- `restaurant-api-results.json` - Detailed restaurant API test results
- `recipe-api-results.json` - Detailed recipe API test results
- `api-integration-results-[timestamp].json` - Complete test suite results

#### Analysis Reports
- `API_EVALUATION_REPORT.md` - Comprehensive evaluation and recommendations
- `COST_ANALYSIS.md` - Detailed cost projections and optimization strategies
- `cost-analysis.json` - Machine-readable cost data

### Result Structure

Each test generates comprehensive results including:

```json
{
  "summary": {
    "testDuration": 45000,
    "apiStatus": { "yelp": true, "googlePlaces": true },
    "recommendations": ["✅ Yelp provides sufficient coverage"],
    "timestamp": "2024-11-16T..."
  },
  "performance": {
    "basicSearch": 380,
    "dietaryFilter": 420
  },
  "coverage": {
    "dietary": { "vegan": { "count": 15, "responseTime": 420 }},
    "cuisine": { "italian": { "count": 25, "responseTime": 390 }}
  },
  "dataQuality": {
    "hasPhotos": 95,
    "hasReviews": 98,
    "avgRating": 4.2
  }
}
```

## Performance Benchmarks

### Success Criteria
- ✅ **Restaurant Count**: 50+ quality restaurants in Atlanta area
- ✅ **Recipe Count**: 500+ recipes with dietary filtering
- ✅ **Response Time**: <500ms for primary API calls
- ✅ **Dietary Filter Accuracy**: >90% correct filtering
- ✅ **Cost Efficiency**: <$0.02 per API call average
- ✅ **Daily Quota**: Sufficient for 10,000 users

### Typical Performance
- **Yelp Fusion**: 350-450ms response time
- **Google Places**: 400-500ms response time
- **Spoonacular**: 400-500ms response time
- **Edamam**: 500-600ms response time

## Troubleshooting

### Common Issues

#### API Key Errors
```
❌ Missing YELP_API_KEY environment variable
```
**Solution**: Run `npm run setup` or manually add API key to `.env` file

#### Rate Limit Exceeded
```
❌ HTTP 429: Too Many Requests
```
**Solution**: Wait for rate limit reset or upgrade to paid tier

#### Network Timeouts
```
❌ Request timeout after 30s
```
**Solution**: Check internet connection, try again later

#### No Results Found
```
⚠️ 0 restaurants found for location
```
**Solution**: Verify test location coordinates, try broader search radius

### API-Specific Troubleshooting

#### Yelp Fusion API
- Verify API key format (should be long alphanumeric string)
- Check that Fusion API is enabled (not legacy API)
- Ensure location parameter is properly formatted

#### Google Places API
- Enable Places API in Google Cloud Console
- Set up billing (required even for free tier)
- Check API key restrictions

#### Spoonacular
- Verify account activation via email
- Check daily quota usage
- Ensure API key is copied correctly

#### Edamam
- Both App ID and App Key are required
- Verify account type (free vs paid)
- Check rate limiting (5 calls/minute on free tier)

### Debug Mode

Enable verbose logging by setting:
```env
DEBUG=true
```

This provides detailed request/response information for troubleshooting.

## Cost Optimization

### Built-in Optimizations
- Intelligent request batching
- Response caching recommendations
- Rate limit management
- Fallback API routing

### Best Practices
1. **Cache Results**: Implement 1-hour restaurant cache, 24-hour recipe cache
2. **Batch Requests**: Group multiple API calls when possible
3. **Monitor Usage**: Track API costs daily
4. **Use Free Tiers**: Maximize free tier utilization before paid calls
5. **Implement Fallbacks**: Use cheaper APIs for non-critical requests

### Cost Monitoring
The test suite generates cost projections for different user scenarios:
- MVP (1,000 users): ~$85/month
- Growth (10,000 users): ~$740/month
- Scale (100,000 users): ~$6,800/month

## Integration Guidelines

### Recommended Architecture

**Primary APIs:**
- Restaurant: Yelp Fusion API
- Recipe: Spoonacular Recipe API

**Fallback APIs:**
- Restaurant: Google Places API (when Yelp fails)
- Recipe: Edamam Recipe API (when Spoonacular fails)

### Error Handling Strategy
```javascript
try {
  // Primary API call
  const results = await primaryAPI.search(params);
  return results;
} catch (error) {
  console.warn('Primary API failed, trying fallback');
  try {
    // Fallback API call
    const results = await fallbackAPI.search(params);
    return results;
  } catch (fallbackError) {
    // Graceful degradation
    return { error: 'Service temporarily unavailable' };
  }
}
```

### Caching Strategy
```javascript
const cacheConfig = {
  restaurants: {
    ttl: 3600, // 1 hour
    key: 'restaurant:${location}:${filters}'
  },
  recipes: {
    ttl: 86400, // 24 hours
    key: 'recipe:${query}:${dietary}'
  }
};
```

## Contributing

### Adding New APIs

1. Create test file: `[api-name]-api-test.js`
2. Follow existing test structure
3. Implement standard test methods:
   - `testBasicSearch()`
   - `testDietaryFilters()`
   - `testDataQuality()`
   - `testRateLimit()`

### Extending Test Coverage

1. Add new dietary restrictions to `TEST_CONFIG.dietary_filters`
2. Add new cuisine types to `TEST_CONFIG.cuisine_types`
3. Implement additional quality metrics in `analyzeDataQuality()`

### Test Framework

The test suite uses:
- **Native Node.js** - No external testing framework required
- **ES6 Modules** - Modern JavaScript module system
- **Async/Await** - Clean asynchronous code
- **JSON Results** - Machine and human readable output

## Production Deployment

### Security Considerations
- Store API keys in secure environment variables
- Implement API key rotation
- Monitor for unusual usage patterns
- Set up spending alerts

### Performance Monitoring
- Track response times
- Monitor error rates
- Measure cost per user
- Alert on rate limit approaches

### Scaling Preparation
- Negotiate enterprise API rates
- Implement distributed caching
- Set up load balancing for API calls
- Plan for regional API selection

## Support

### Resources
- [API Evaluation Report](./API_EVALUATION_REPORT.md) - Comprehensive analysis
- [Cost Analysis](./COST_ANALYSIS.md) - Detailed cost projections
- [Yelp Fusion API Documentation](https://www.yelp.com/developers/documentation/v3)
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Spoonacular API Documentation](https://spoonacular.com/food-api/docs)
- [Edamam Recipe API Documentation](https://developer.edamam.com/edamam-docs-recipe-api)

### Contact
For questions about the API integration testing suite, please refer to the comprehensive evaluation reports or check the troubleshooting section above.

---

*Last updated: November 2024*
*Test environment: Node.js 18+ with ES6 module support*