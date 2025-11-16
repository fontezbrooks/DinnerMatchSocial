#!/usr/bin/env node
/**
 * Environment setup utility for API integration testing
 * Helps users configure API keys and test environment
 */

import { promises as fs } from 'fs';
import { createInterface } from 'readline';

class APISetupWizard {
  constructor() {
    this.config = {
      apis: {
        yelp: { key: '', status: 'not_configured' },
        googlePlaces: { key: '', status: 'not_configured' },
        spoonacular: { key: '', status: 'not_configured' },
        edamam: { appId: '', appKey: '', status: 'not_configured' }
      },
      location: {
        latitude: 33.7490,
        longitude: -84.3880,
        name: 'Atlanta',
        radius: 5000
      }
    };
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run() {
    console.log('🔧 DinnerMatch API Integration Setup Wizard');
    console.log('===========================================');
    console.log('');

    try {
      // Check for existing .env file
      await this.checkExistingEnvironment();

      // Guide user through API setup
      await this.setupAPIs();

      // Configure test location
      await this.setupTestLocation();

      // Generate .env file
      await this.generateEnvironmentFile();

      // Test API connectivity
      await this.testConnectivity();

      console.log('✅ Setup completed successfully!');
      console.log('');
      console.log('🚀 Next steps:');
      console.log('  npm run test:all     # Run all API tests');
      console.log('  npm run test:restaurants  # Test restaurant APIs only');
      console.log('  npm run test:recipes      # Test recipe APIs only');

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async checkExistingEnvironment() {
    try {
      const envContent = await fs.readFile('.env', 'utf-8');
      console.log('📁 Found existing .env file');

      const answer = await this.question('Do you want to overwrite it? (y/n): ');
      if (answer.toLowerCase() !== 'y') {
        console.log('🚪 Exiting setup. Use existing .env file.');
        process.exit(0);
      }
    } catch (error) {
      console.log('📝 No existing .env file found. Creating new one.');
    }
  }

  async setupAPIs() {
    console.log('');
    console.log('🔑 API Key Configuration');
    console.log('========================');

    // Yelp Fusion API
    console.log('');
    console.log('1. Yelp Fusion API');
    console.log('   • Get your API key from: https://www.yelp.com/developers');
    console.log('   • Required for restaurant search and details');
    const yelpKey = await this.question('   Enter Yelp API key (or press Enter to skip): ');
    if (yelpKey.trim()) {
      this.config.apis.yelp.key = yelpKey.trim();
      this.config.apis.yelp.status = 'configured';
    }

    // Google Places API
    console.log('');
    console.log('2. Google Places API');
    console.log('   • Get your API key from: https://console.cloud.google.com/');
    console.log('   • Enable Places API and Nearby Search');
    console.log('   • Fallback option for restaurant data');
    const googleKey = await this.question('   Enter Google Places API key (or press Enter to skip): ');
    if (googleKey.trim()) {
      this.config.apis.googlePlaces.key = googleKey.trim();
      this.config.apis.googlePlaces.status = 'configured';
    }

    // Spoonacular API
    console.log('');
    console.log('3. Spoonacular Recipe API');
    console.log('   • Get your API key from: https://spoonacular.com/food-api');
    console.log('   • Primary choice for recipe data');
    const spoonacularKey = await this.question('   Enter Spoonacular API key (or press Enter to skip): ');
    if (spoonacularKey.trim()) {
      this.config.apis.spoonacular.key = spoonacularKey.trim();
      this.config.apis.spoonacular.status = 'configured';
    }

    // Edamam Recipe API
    console.log('');
    console.log('4. Edamam Recipe API');
    console.log('   • Get your credentials from: https://developer.edamam.com/');
    console.log('   • Alternative recipe source');
    const edamamAppId = await this.question('   Enter Edamam App ID (or press Enter to skip): ');
    if (edamamAppId.trim()) {
      this.config.apis.edamam.appId = edamamAppId.trim();
      const edamamAppKey = await this.question('   Enter Edamam App Key: ');
      this.config.apis.edamam.appKey = edamamAppKey.trim();
      this.config.apis.edamam.status = 'configured';
    }
  }

  async setupTestLocation() {
    console.log('');
    console.log('📍 Test Location Configuration');
    console.log('==============================');
    console.log(`Current location: ${this.config.location.name}`);
    console.log(`Coordinates: ${this.config.location.latitude}, ${this.config.location.longitude}`);

    const changeLocation = await this.question('Change test location? (y/n): ');
    if (changeLocation.toLowerCase() === 'y') {
      const name = await this.question('Enter city name: ');
      const lat = await this.question('Enter latitude: ');
      const lng = await this.question('Enter longitude: ');
      const radius = await this.question('Enter search radius in meters (default 5000): ');

      if (name.trim()) this.config.location.name = name.trim();
      if (lat.trim()) this.config.location.latitude = parseFloat(lat.trim());
      if (lng.trim()) this.config.location.longitude = parseFloat(lng.trim());
      if (radius.trim()) this.config.location.radius = parseInt(radius.trim());
    }
  }

  async generateEnvironmentFile() {
    console.log('');
    console.log('📄 Generating .env file...');

    const envContent = [
      '# Restaurant APIs',
      `YELP_API_KEY=${this.config.apis.yelp.key}`,
      `GOOGLE_PLACES_API_KEY=${this.config.apis.googlePlaces.key}`,
      '',
      '# Recipe APIs',
      `SPOONACULAR_API_KEY=${this.config.apis.spoonacular.key}`,
      `EDAMAM_RECIPE_APP_ID=${this.config.apis.edamam.appId}`,
      `EDAMAM_RECIPE_APP_KEY=${this.config.apis.edamam.appKey}`,
      '',
      '# Test Configuration',
      `TEST_LOCATION_LAT=${this.config.location.latitude}`,
      `TEST_LOCATION_LNG=${this.config.location.longitude}`,
      `TEST_LOCATION_NAME=${this.config.location.name}`,
      `TEST_RADIUS_METERS=${this.config.location.radius}`,
      ''
    ].join('\n');

    await fs.writeFile('.env', envContent);
    console.log('✅ .env file created');
  }

  async testConnectivity() {
    console.log('');
    console.log('🔗 Testing API Connectivity');
    console.log('============================');

    const configuredAPIs = Object.entries(this.config.apis)
      .filter(([_, api]) => api.status === 'configured')
      .map(([name, _]) => name);

    if (configuredAPIs.length === 0) {
      console.log('⚠️ No APIs configured. Skipping connectivity test.');
      return;
    }

    console.log(`Testing ${configuredAPIs.length} configured APIs...`);

    for (const apiName of configuredAPIs) {
      try {
        const result = await this.testAPI(apiName);
        console.log(`${result ? '✅' : '❌'} ${apiName}: ${result ? 'Connected' : 'Failed'}`);
      } catch (error) {
        console.log(`❌ ${apiName}: ${error.message}`);
      }
    }
  }

  async testAPI(apiName) {
    const fetch = await import('node-fetch').then(module => module.default);

    switch (apiName) {
      case 'yelp':
        return await this.testYelp(fetch);
      case 'googlePlaces':
        return await this.testGooglePlaces(fetch);
      case 'spoonacular':
        return await this.testSpoonacular(fetch);
      case 'edamam':
        return await this.testEdamam(fetch);
      default:
        return false;
    }
  }

  async testYelp(fetch) {
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?location=${this.config.location.name}&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apis.yelp.key}`,
          'Accept': 'application/json'
        }
      }
    );
    return response.ok;
  }

  async testGooglePlaces(fetch) {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${this.config.location.latitude},${this.config.location.longitude}&radius=1000&type=restaurant&key=${this.config.apis.googlePlaces.key}`
    );
    return response.ok;
  }

  async testSpoonacular(fetch) {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${this.config.apis.spoonacular.key}&number=1`
    );
    return response.ok;
  }

  async testEdamam(fetch) {
    const response = await fetch(
      `https://api.edamam.com/api/recipes/v2?type=public&q=test&app_id=${this.config.apis.edamam.appId}&app_key=${this.config.apis.edamam.appKey}&from=0&to=1`
    );
    return response.ok;
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const wizard = new APISetupWizard();
  await wizard.run();
}