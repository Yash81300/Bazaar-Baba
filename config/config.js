/**
 * Frontend Configuration
 * 
 * This file centralizes all environment-specific configuration.
 * In production, these values should be set via environment variables
 * or a build-time configuration process.
 */

// Determine the environment
const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging'
};

// Auto-detect environment based on hostname
function getEnvironment() {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return ENV.DEVELOPMENT;
  } else if (hostname.includes('staging')) {
    return ENV.STAGING;
  } else {
    return ENV.PRODUCTION;
  }
}

const currentEnv = getEnvironment();

// Environment-specific configurations
const configs = {
  [ENV.DEVELOPMENT]: {
    API_BASE_URL: 'http://127.0.0.1:8000',
    API_TIMEOUT: 5000,
    ENABLE_LOGGING: true,
    ENABLE_DEBUG: true
  },
  
  [ENV.STAGING]: {
    API_BASE_URL: 'https://staging-api.bazaarbaba.com',
    API_TIMEOUT: 10000,
    ENABLE_LOGGING: true,
    ENABLE_DEBUG: false
  },
  
  [ENV.PRODUCTION]: {
    API_BASE_URL: 'https://api.bazaarbaba.com',
    API_TIMEOUT: 10000,
    ENABLE_LOGGING: false,
    ENABLE_DEBUG: false
  }
};

// Export the configuration for the current environment
export const config = {
  ENV: currentEnv,
  ...configs[currentEnv],
  
  // API endpoint builders
  endpoints: {
    products: () => `${configs[currentEnv].API_BASE_URL}/products`,
    product: (id) => `${configs[currentEnv].API_BASE_URL}/products/${id}`,
    orders: () => `${configs[currentEnv].API_BASE_URL}/orders`,
    order: (id) => `${configs[currentEnv].API_BASE_URL}/orders/${id}`,
    health: () => `${configs[currentEnv].API_BASE_URL}/health`
  },
  
  // Helper to log only in appropriate environments
  log: (...args) => {
    if (configs[currentEnv].ENABLE_LOGGING) {
      console.log('[Bazaar Baba]', ...args);
    }
  },
  
  // Helper to log errors
  error: (...args) => {
    console.error('[Bazaar Baba ERROR]', ...args);
  },
  
  // Helper to debug
  debug: (...args) => {
    if (configs[currentEnv].ENABLE_DEBUG) {
      console.debug('[Bazaar Baba DEBUG]', ...args);
    }
  }
};

// Optional: Override with window.ENV_CONFIG if provided (for build-time injection)
if (window.ENV_CONFIG) {
  Object.assign(config, window.ENV_CONFIG);
  config.log('Configuration overridden by window.ENV_CONFIG');
}

config.log('Environment:', currentEnv);
config.log('API Base URL:', configs[currentEnv].API_BASE_URL);
