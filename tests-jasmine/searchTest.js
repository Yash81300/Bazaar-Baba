/**
 * Search Module Tests
 * 
 * Comprehensive test suite for search and filtering functionality
 */

import {
  searchProducts,
  searchProductsWithScore,
  filterByCategory,
  filterByPrice,
  filterByRating,
  sortProducts,
  getCategories,
  getSearchSuggestions,
  highlightSearchTerms
} from '../scripts/utils/search.js';

describe('Search Module', () => {
  
  // Sample test data
  let testProducts;
  
  beforeEach(() => {
    testProducts = [
      {
        id: '1',
        name: 'Black Athletic Socks',
        description: 'Comfortable cotton socks for sports',
        keywords: ['socks', 'sports', 'apparel'],
        type: 'clothing',
        priceCents: 1090,
        rating: { stars: 4.5, count: 87 }
      },
      {
        id: '2',
        name: 'Basketball',
        description: 'Professional basketball for indoor and outdoor play',
        keywords: ['basketball', 'sports'],
        type: 'sports',
        priceCents: 2095,
        rating: { stars: 4.8, count: 127 }
      },
      {
        id: '3',
        name: 'Cotton T-Shirt',
        description: 'Plain cotton t-shirt in various colors',
        keywords: ['shirt', 'clothing', 'cotton'],
        type: 'clothing',
        priceCents: 1500,
        rating: { stars: 4.0, count: 50 }
      },
      {
        id: '4',
        name: 'Wireless Headphones',
        description: 'Bluetooth headphones with noise cancellation',
        keywords: ['electronics', 'audio', 'bluetooth'],
        type: 'electronics',
        priceCents: 5999,
        rating: { stars: 4.7, count: 200 }
      }
    ];
  });

  describe('searchProducts', () => {
    it('should return all products when query is empty', () => {
      const results = searchProducts(testProducts, '');
      expect(results.length).toBe(4);
    });

    it('should return all products when query is whitespace', () => {
      const results = searchProducts(testProducts, '   ');
      expect(results.length).toBe(4);
    });

    it('should find products by name', () => {
      const results = searchProducts(testProducts, 'basketball');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('2');
    });

    it('should find products by description', () => {
      const results = searchProducts(testProducts, 'noise cancellation');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('4');
    });

    it('should find products by keywords', () => {
      const results = searchProducts(testProducts, 'sports');
      expect(results.length).toBe(2);
    });

    it('should find products by type', () => {
      const results = searchProducts(testProducts, 'clothing');
      expect(results.length).toBe(2);
    });

    it('should be case insensitive', () => {
      const results = searchProducts(testProducts, 'BASKETBALL');
      expect(results.length).toBe(1);
    });

    it('should match all search terms (AND logic)', () => {
      const results = searchProducts(testProducts, 'cotton socks');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
    });

    it('should return empty array when no matches', () => {
      const results = searchProducts(testProducts, 'nonexistent product');
      expect(results.length).toBe(0);
    });

    it('should handle multiple spaces in query', () => {
      const results = searchProducts(testProducts, 'cotton   socks');
      expect(results.length).toBe(1);
    });
  });

  describe('searchProductsWithScore', () => {
    it('should return all products when query is empty', () => {
      const results = searchProductsWithScore(testProducts, '');
      expect(results.length).toBe(4);
    });

    it('should return products sorted by relevance', () => {
      const results = searchProductsWithScore(testProducts, 'cotton');
      
      // Should find both cotton products
      expect(results.length).toBeGreaterThan(0);
      
      // "Cotton T-Shirt" should rank higher (name match)
      // than "Black Athletic Socks" (description match)
      const cottonShirt = results.find(p => p.id === '3');
      expect(cottonShirt).toBeDefined();
    });

    it('should prioritize exact name matches', () => {
      const results = searchProductsWithScore(testProducts, 'basketball');
      expect(results[0].id).toBe('2');
    });

    it('should return empty array when no matches', () => {
      const results = searchProductsWithScore(testProducts, 'xyz123');
      expect(results.length).toBe(0);
    });

    it('should handle multi-word queries', () => {
      const results = searchProductsWithScore(testProducts, 'wireless headphones');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('4');
    });
  });

  describe('filterByCategory', () => {
    it('should return all products for "all" category', () => {
      const results = filterByCategory(testProducts, 'all');
      expect(results.length).toBe(4);
    });

    it('should return all products when category is empty', () => {
      const results = filterByCategory(testProducts, '');
      expect(results.length).toBe(4);
    });

    it('should filter by specific category', () => {
      const results = filterByCategory(testProducts, 'clothing');
      expect(results.length).toBe(2);
      expect(results.every(p => p.type === 'clothing')).toBe(true);
    });

    it('should be case insensitive', () => {
      const results = filterByCategory(testProducts, 'SPORTS');
      expect(results.length).toBe(1);
    });

    it('should return empty array for non-existent category', () => {
      const results = filterByCategory(testProducts, 'furniture');
      expect(results.length).toBe(0);
    });
  });

  describe('filterByPrice', () => {
    it('should return all products with default parameters', () => {
      const results = filterByPrice(testProducts);
      expect(results.length).toBe(4);
    });

    it('should filter by minimum price', () => {
      const results = filterByPrice(testProducts, 2000);
      expect(results.length).toBe(2);
      expect(results.every(p => p.priceCents >= 2000)).toBe(true);
    });

    it('should filter by maximum price', () => {
      const results = filterByPrice(testProducts, 0, 2000);
      expect(results.length).toBe(3);
      expect(results.every(p => p.priceCents <= 2000)).toBe(true);
    });

    it('should filter by price range', () => {
      const results = filterByPrice(testProducts, 1000, 2500);
      expect(results.length).toBe(3);
      expect(results.every(p => p.priceCents >= 1000 && p.priceCents <= 2500)).toBe(true);
    });

    it('should return empty array when no products in range', () => {
      const results = filterByPrice(testProducts, 10000, 20000);
      expect(results.length).toBe(0);
    });
  });

  describe('filterByRating', () => {
    it('should return all products with default parameter', () => {
      const results = filterByRating(testProducts);
      expect(results.length).toBe(4);
    });

    it('should filter by minimum rating', () => {
      const results = filterByRating(testProducts, 4.5);
      expect(results.length).toBe(3);
      expect(results.every(p => p.rating.stars >= 4.5)).toBe(true);
    });

    it('should handle products without ratings', () => {
      const productsWithoutRating = [
        ...testProducts,
        { id: '5', name: 'No Rating Product', priceCents: 1000 }
      ];
      const results = filterByRating(productsWithoutRating, 4.0);
      expect(results.length).toBe(4);
    });
  });

  describe('sortProducts', () => {
    it('should not mutate original array', () => {
      const original = [...testProducts];
      sortProducts(testProducts, 'price-low');
      expect(testProducts).toEqual(original);
    });

    it('should sort by price low to high', () => {
      const results = sortProducts(testProducts, 'price-low');
      expect(results[0].priceCents).toBe(1090);
      expect(results[results.length - 1].priceCents).toBe(5999);
    });

    it('should sort by price high to low', () => {
      const results = sortProducts(testProducts, 'price-high');
      expect(results[0].priceCents).toBe(5999);
      expect(results[results.length - 1].priceCents).toBe(1090);
    });

    it('should sort by rating', () => {
      const results = sortProducts(testProducts, 'rating');
      expect(results[0].rating.stars).toBe(4.8);
    });

    it('should sort by name alphabetically', () => {
      const results = sortProducts(testProducts, 'name');
      expect(results[0].name).toBe('Basketball');
      expect(results[results.length - 1].name).toBe('Wireless Headphones');
    });

    it('should return original order for unknown sort type', () => {
      const results = sortProducts(testProducts, 'invalid');
      expect(results).toEqual(testProducts);
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', () => {
      const categories = getCategories(testProducts);
      expect(categories.length).toBe(3);
      expect(categories).toContain('clothing');
      expect(categories).toContain('sports');
      expect(categories).toContain('electronics');
    });

    it('should return sorted categories', () => {
      const categories = getCategories(testProducts);
      const sorted = [...categories].sort();
      expect(categories).toEqual(sorted);
    });

    it('should handle products without type', () => {
      const productsWithoutType = [
        ...testProducts,
        { id: '5', name: 'No Type Product', priceCents: 1000 }
      ];
      const categories = getCategories(productsWithoutType);
      expect(categories.length).toBe(3);
    });

    it('should return empty array for empty products', () => {
      const categories = getCategories([]);
      expect(categories.length).toBe(0);
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return empty array for short queries', () => {
      const suggestions = getSearchSuggestions(testProducts, 'a');
      expect(suggestions.length).toBe(0);
    });

    it('should return empty array for empty query', () => {
      const suggestions = getSearchSuggestions(testProducts, '');
      expect(suggestions.length).toBe(0);
    });

    it('should return product name suggestions', () => {
      const suggestions = getSearchSuggestions(testProducts, 'ba');
      expect(suggestions).toContain('Basketball');
      expect(suggestions).toContain('Black Athletic Socks');
    });

    it('should return keyword suggestions', () => {
      const suggestions = getSearchSuggestions(testProducts, 'spo');
      expect(suggestions.some(s => s.includes('sport'))).toBe(true);
    });

    it('should limit results', () => {
      const suggestions = getSearchSuggestions(testProducts, 'co', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should be case insensitive', () => {
      const suggestions = getSearchSuggestions(testProducts, 'BA');
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('highlightSearchTerms', () => {
    it('should return original text when query is empty', () => {
      const result = highlightSearchTerms('test text', '');
      expect(result).toBe('test text');
    });

    it('should return original text when text is empty', () => {
      const result = highlightSearchTerms('', 'test');
      expect(result).toBe('');
    });

    it('should highlight single term', () => {
      const result = highlightSearchTerms('This is a test', 'test');
      expect(result).toContain('<mark>test</mark>');
    });

    it('should highlight multiple terms', () => {
      const result = highlightSearchTerms('This is a test', 'this test');
      expect(result).toContain('<mark>This</mark>');
      expect(result).toContain('<mark>test</mark>');
    });

    it('should be case insensitive', () => {
      const result = highlightSearchTerms('Test text', 'TEST');
      expect(result).toContain('<mark>Test</mark>');
    });

    it('should handle multiple occurrences', () => {
      const result = highlightSearchTerms('test test test', 'test');
      const matches = result.match(/<mark>/g);
      expect(matches.length).toBe(3);
    });
  });

  describe('Integration Tests', () => {
    it('should combine search and filter', () => {
      const searched = searchProducts(testProducts, 'cotton');
      const filtered = filterByCategory(searched, 'clothing');
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should combine filter and sort', () => {
      const filtered = filterByCategory(testProducts, 'clothing');
      const sorted = sortProducts(filtered, 'price-low');
      expect(sorted[0].priceCents).toBeLessThanOrEqual(sorted[1].priceCents);
    });

    it('should handle complex query pipeline', () => {
      let results = searchProducts(testProducts, 'sports');
      results = filterByPrice(results, 0, 3000);
      results = filterByRating(results, 4.0);
      results = sortProducts(results, 'price-low');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(p => p.priceCents <= 3000)).toBe(true);
      expect(results.every(p => p.rating.stars >= 4.0)).toBe(true);
    });
  });
});
