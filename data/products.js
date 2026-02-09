import { config } from '../config/config.js';

export let products = [];
let isLoading = false;
let loadError = null;

/**
 * Check if products are currently loading
 */
export function isProductsLoading() {
  return isLoading;
}

/**
 * Get last load error if any
 */
export function getLoadError() {
  return loadError;
}

/**
 * Load all products from the backend API
 */
export async function loadProducts() {
  isLoading = true;
  loadError = null;
  
  try {
    products = await getProducts();
    return products;
  } catch (error) {
    loadError = error;
    throw error;
  } finally {
    isLoading = false;
  }
}

/**
 * Fetch products from the backend with proper error handling
 */
export async function getProducts() {
  try {
    config.debug('Fetching products from:', config.endpoints.products());
    
    const response = await fetch(config.endpoints.products(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(config.API_TIMEOUT)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch products`);
    }
    
    const data = await response.json();
    config.log(`Loaded ${data.length} products from backend`);
    return data;
    
  } catch (error) {
    config.error('Error loading products from backend:', error.message);
    
    // Return empty array as fallback
    return [];
  }
}

/**
 * Get a single product by ID from the loaded products
 */
export function getProduct(productId) {
  return products.find(product => product.id === productId);
}

/**
 * Fetch a single product directly from the API (useful for product details page)
 */
export async function getProductById(productId) {
  try {
    config.debug('Fetching product:', productId);
    
    const response = await fetch(config.endpoints.product(productId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(config.API_TIMEOUT)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        config.error(`Product ${productId} not found`);
        return null;
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch product`);
    }
    
    const data = await response.json();
    config.log('Product loaded:', data.name);
    return data;
    
  } catch (error) {
    config.error('Error loading product:', error.message);
    return null;
  }
}
