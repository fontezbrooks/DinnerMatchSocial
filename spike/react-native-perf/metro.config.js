const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable performance optimizations
config.transformer.minifierConfig = {
  keep_fnames: false,
  mangle: {
    keep_fnames: false,
  },
};

// Optimize for performance testing
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;