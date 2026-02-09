/**
 * Search Utility Module
 * 
 * Provides search and filtering functionality for products
 */

import { config } from '../../config/config.js';

/**
 * Search products by query string
 * @param {Array} products - Array of product objects
 * @param {string} query - Search query
 * @returns {Array} - Filtered products matching the query
 */
export function searchProducts(products, query) {
  if (!query || query.trim() === '') {
    return products;
  }

  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  return products.filter(product => {
    const searchableText = [
      product.name || '',
      product.description || '',
      ...(product.keywords || []),
      product.type || ''
    ].join(' ').toLowerCase();

    // Product matches if ALL search terms are found
    return searchTerms.every(term => searchableText.includes(term));
  });
}

/**
 * Search products with scoring for relevance
 * @param {Array} products - Array of product objects
 * @param {string} query - Search query
 * @returns {Array} - Products sorted by relevance
 */
export function searchProductsWithScore(products, query) {
  if (!query || query.trim() === '') {
    return products;
  }

  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  const scoredProducts = products.map(product => {
    let score = 0;
    
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const keywords = (product.keywords || []).map(k => k.toLowerCase());
    const type = (product.type || '').toLowerCase();
    
    searchTerms.forEach(term => {
      // Exact name match: highest score
      if (name === term) {
        score += 100;
      }
      // Name contains term
      else if (name.includes(term)) {
        score += 50;
      }
      
      // Keyword match: high score
      if (keywords.some(keyword => keyword === term)) {
        score += 40;
      }
      else if (keywords.some(keyword => keyword.includes(term))) {
        score += 20;
      }
      
      // Type match
      if (type === term) {
        score += 30;
      }
      else if (type.includes(term)) {
        score += 15;
      }
      
      // Description contains term
      if (description.includes(term)) {
        score += 10;
      }
    });
    
    return { product, score };
  });
  
  // Filter out products with no matches and sort by score
  return scoredProducts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}

/**
 * Filter products by category/type
 * @param {Array} products - Array of product objects
 * @param {string} category - Category to filter by
 * @returns {Array} - Filtered products
 */
export function filterByCategory(products, category) {
  if (!category || category === 'all') {
    return products;
  }
  
  return products.filter(product => 
    product.type && product.type.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Filter products by price range
 * @param {Array} products - Array of product objects
 * @param {number} minPrice - Minimum price in cents
 * @param {number} maxPrice - Maximum price in cents
 * @returns {Array} - Filtered products
 */
export function filterByPrice(products, minPrice = 0, maxPrice = Infinity) {
  return products.filter(product => {
    const price = product.priceCents || 0;
    return price >= minPrice && price <= maxPrice;
  });
}

/**
 * Filter products by rating
 * @param {Array} products - Array of product objects
 * @param {number} minRating - Minimum rating (0-5)
 * @returns {Array} - Filtered products
 */
export function filterByRating(products, minRating = 0) {
  return products.filter(product => {
    const rating = product.rating?.stars || 0;
    return rating >= minRating;
  });
}

/**
 * Sort products by various criteria
 * @param {Array} products - Array of product objects
 * @param {string} sortBy - Sort criterion ('price-low', 'price-high', 'rating', 'name')
 * @returns {Array} - Sorted products
 */
export function sortProducts(products, sortBy) {
  const sorted = [...products]; // Don't mutate original
  
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => (a.priceCents || 0) - (b.priceCents || 0));
    
    case 'price-high':
      return sorted.sort((a, b) => (b.priceCents || 0) - (a.priceCents || 0));
    
    case 'rating':
      return sorted.sort((a, b) => {
        const ratingA = a.rating?.stars || 0;
        const ratingB = b.rating?.stars || 0;
        return ratingB - ratingA;
      });
    
    case 'name':
      return sorted.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    
    default:
      return sorted;
  }
}

/**
 * Get unique categories from products
 * @param {Array} products - Array of product objects
 * @returns {Array} - Unique categories
 */
export function getCategories(products) {
  const categories = new Set();
  products.forEach(product => {
    if (product.type) {
      categories.add(product.type);
    }
  });
  return Array.from(categories).sort();
}

/**
 * Get search suggestions based on partial query
 * @param {Array} products - Array of product objects
 * @param {string} query - Partial search query
 * @param {number} limit - Maximum number of suggestions
 * @returns {Array} - Array of suggestion strings
 */
export function getSearchSuggestions(products, query, limit = 5) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();
  const suggestions = new Set();

  products.forEach(product => {
    // Add matching product names
    if (product.name && product.name.toLowerCase().includes(queryLower)) {
      suggestions.add(product.name);
    }
    
    // Add matching keywords
    if (product.keywords) {
      product.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(queryLower)) {
          suggestions.add(keyword);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Highlight search terms in text
 * @param {string} text - Text to highlight
 * @param {string} query - Search query
 * @returns {string} - HTML with highlighted terms
 */
export function highlightSearchTerms(text, query) {
  if (!query || !text) {
    return text;
  }

  const terms = query.trim().split(/\s+/);
  let result = text;

  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  });

  return result;
}

config.log('Search module loaded');
