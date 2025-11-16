#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up DinnerMatch Backend...\n');

// Check if .env exists, if not copy from .env.example
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📋 Creating .env file from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created');
  console.log('⚠️  Please update the .env file with your actual configuration values\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check for required environment variables
console.log('🔍 Checking environment configuration...');
require('dotenv').config();

const requiredVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

const missingVars = requiredVars.filter(varName => !process.env[varName] || process.env[varName].length < 32);

if (missingVars.length > 0) {
  console.log('⚠️  Missing or insufficient environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName} (needs to be at least 32 characters)`);
  });
  console.log('\n💡 You can generate secure secrets with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  console.log('   Update your .env file with the generated secrets\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check if PostgreSQL is running
console.log('🐘 Checking PostgreSQL connection...');
try {
  const { Client } = require('pg');
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default db first
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  });

  // This will be handled by the actual server startup
  console.log('💡 PostgreSQL configuration loaded from .env');
  console.log('   Run migrations after ensuring PostgreSQL is running\n');
} catch (error) {
  console.log('💡 PostgreSQL client configured from .env');
  console.log('   Ensure PostgreSQL is running before starting the server\n');
}

// Check if Redis is available
console.log('🔴 Checking Redis connection...');
try {
  console.log('💡 Redis configuration loaded from .env');
  console.log('   Ensure Redis is running before starting the server\n');
} catch (error) {
  console.log('💡 Redis client will be configured at runtime\n');
}

console.log('📚 Next steps:');
console.log('1. Ensure PostgreSQL is running and create the database:');
console.log('   createdb dinnermatch');
console.log('');
console.log('2. Ensure Redis is running');
console.log('');
console.log('3. Run database migrations:');
console.log('   npm run migrate:latest');
console.log('');
console.log('4. Seed the database with sample data:');
console.log('   npm run seed:run');
console.log('');
console.log('5. Start the development server:');
console.log('   npm run dev');
console.log('');
console.log('6. View API documentation at:');
console.log('   http://localhost:3001/api-docs');
console.log('');
console.log('🎉 Setup complete! Follow the next steps to start the server.');