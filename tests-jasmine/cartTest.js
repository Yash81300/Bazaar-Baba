/**
 * Cart Module Tests
 * 
 * Comprehensive test suite for the shopping cart functionality
 */

import {
  cart,
  loadFromStorage,
  resetCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  updateAllDeliveryOptions,
  updateDeliveryOption,
  getCartQuantity,
  isInCart,
  getCartItem
} from '../data/cart.js';

describe('Cart Module', () => {
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset cart to empty state
    resetCart();
  });

  describe('loadFromStorage', () => {
    it('should load an empty cart when localStorage is empty', () => {
      localStorage.removeItem('cart');
      loadFromStorage();
      // Should load default items
      expect(cart.length).toBeGreaterThan(0);
    });

    it('should load cart from localStorage when data exists', () => {
      const testCart = [
        { productId: 'test-1', quantity: 2, deliveryOptionId: '1' }
      ];
      localStorage.setItem('cart', JSON.stringify(testCart));
      
      loadFromStorage();
      
      expect(cart.length).toBe(1);
      expect(cart[0].productId).toBe('test-1');
      expect(cart[0].quantity).toBe(2);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('cart', 'invalid-json');
      
      loadFromStorage();
      
      // Should fall back to default cart
      expect(cart).toBeDefined();
      expect(Array.isArray(cart)).toBe(true);
    });
  });

  describe('resetCart', () => {
    it('should clear all items from cart', () => {
      addToCart('product-1');
      addToCart('product-2');
      expect(cart.length).toBeGreaterThan(0);
      
      resetCart();
      
      expect(cart.length).toBe(0);
    });

    it('should persist empty cart to localStorage', () => {
      resetCart();
      
      const stored = JSON.parse(localStorage.getItem('cart'));
      expect(stored.length).toBe(0);
    });
  });

  describe('addToCart', () => {
    beforeEach(() => {
      resetCart();
    });

    it('should add a new product to empty cart', () => {
      addToCart('product-1');
      
      expect(cart.length).toBe(1);
      expect(cart[0].productId).toBe('product-1');
      expect(cart[0].quantity).toBe(1);
    });

    it('should add multiple items with default quantity of 1', () => {
      addToCart('product-1');
      addToCart('product-2');
      
      expect(cart.length).toBe(2);
      expect(cart[0].quantity).toBe(1);
      expect(cart[1].quantity).toBe(1);
    });

    it('should add product with custom quantity', () => {
      addToCart('product-1', 5);
      
      expect(cart[0].quantity).toBe(5);
    });

    it('should increment quantity if product already exists', () => {
      addToCart('product-1', 2);
      addToCart('product-1', 3);
      
      expect(cart.length).toBe(1);
      expect(cart[0].quantity).toBe(5);
    });

    it('should not add product with invalid productId', () => {
      const initialLength = cart.length;
      addToCart(null);
      
      expect(cart.length).toBe(initialLength);
    });

    it('should not add product with negative quantity', () => {
      const initialLength = cart.length;
      addToCart('product-1', -5);
      
      expect(cart.length).toBe(initialLength);
    });

    it('should not add product with zero quantity', () => {
      const initialLength = cart.length;
      addToCart('product-1', 0);
      
      expect(cart.length).toBe(initialLength);
    });

    it('should set delivery option to default for first item', () => {
      resetCart();
      addToCart('product-1');
      
      expect(cart[0].deliveryOptionId).toBe('1');
    });

    it('should use first item delivery option for subsequent items', () => {
      resetCart();
      addToCart('product-1');
      cart[0].deliveryOptionId = '3'; // Change first item
      addToCart('product-2');
      
      expect(cart[1].deliveryOptionId).toBe('3');
    });

    it('should persist cart to localStorage', () => {
      addToCart('product-1', 3);
      
      const stored = JSON.parse(localStorage.getItem('cart'));
      expect(stored.length).toBe(1);
      expect(stored[0].productId).toBe('product-1');
      expect(stored[0].quantity).toBe(3);
    });
  });

  describe('removeFromCart', () => {
    beforeEach(() => {
      resetCart();
      addToCart('product-1');
      addToCart('product-2');
      addToCart('product-3');
    });

    it('should remove an existing product', () => {
      const result = removeFromCart('product-2');
      
      expect(result).toBe(true);
      expect(cart.length).toBe(2);
      expect(cart.find(item => item.productId === 'product-2')).toBeUndefined();
    });

    it('should return false for non-existent product', () => {
      const result = removeFromCart('product-999');
      
      expect(result).toBe(false);
      expect(cart.length).toBe(3);
    });

    it('should persist changes to localStorage', () => {
      removeFromCart('product-1');
      
      const stored = JSON.parse(localStorage.getItem('cart'));
      expect(stored.length).toBe(2);
      expect(stored.find(item => item.productId === 'product-1')).toBeUndefined();
    });
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      resetCart();
      addToCart('product-1', 5);
    });

    it('should update quantity for existing product', () => {
      const result = updateQuantity('product-1', 10);
      
      expect(result).toBe(true);
      expect(cart[0].quantity).toBe(10);
    });

    it('should return false for non-existent product', () => {
      const result = updateQuantity('product-999', 5);
      
      expect(result).toBe(false);
    });

    it('should not allow zero quantity', () => {
      const result = updateQuantity('product-1', 0);
      
      expect(result).toBe(false);
      expect(cart[0].quantity).toBe(5);
    });

    it('should not allow negative quantity', () => {
      const result = updateQuantity('product-1', -3);
      
      expect(result).toBe(false);
      expect(cart[0].quantity).toBe(5);
    });

    it('should persist changes to localStorage', () => {
      updateQuantity('product-1', 7);
      
      const stored = JSON.parse(localStorage.getItem('cart'));
      expect(stored[0].quantity).toBe(7);
    });
  });

  describe('updateAllDeliveryOptions', () => {
    beforeEach(() => {
      resetCart();
      addToCart('product-1');
      addToCart('product-2');
      addToCart('product-3');
    });

    it('should update delivery option for all items', () => {
      updateAllDeliveryOptions('3');
      
      cart.forEach(item => {
        expect(item.deliveryOptionId).toBe('3');
      });
    });

    it('should persist changes to localStorage', () => {
      updateAllDeliveryOptions('2');
      
      const stored = JSON.parse(localStorage.getItem('cart'));
      stored.forEach(item => {
        expect(item.deliveryOptionId).toBe('2');
      });
    });
  });

  describe('updateDeliveryOption', () => {
    beforeEach(() => {
      resetCart();
      addToCart('product-1');
      addToCart('product-2');
    });

    it('should update delivery option for specific product', () => {
      const result = updateDeliveryOption('product-1', '3');
      
      expect(result).toBe(true);
      expect(cart[0].deliveryOptionId).toBe('3');
      expect(cart[1].deliveryOptionId).not.toBe('3');
    });

    it('should return false for non-existent product', () => {
      const result = updateDeliveryOption('product-999', '3');
      
      expect(result).toBe(false);
    });

    it('should persist changes to localStorage', () => {
      updateDeliveryOption('product-1', '2');
      
      const stored = JSON.parse(localStorage.getItem('cart'));
      expect(stored[0].deliveryOptionId).toBe('2');
    });
  });

  describe('getCartQuantity', () => {
    beforeEach(() => {
      resetCart();
    });

    it('should return 0 for empty cart', () => {
      expect(getCartQuantity()).toBe(0);
    });

    it('should return correct total for single item', () => {
      addToCart('product-1', 5);
      
      expect(getCartQuantity()).toBe(5);
    });

    it('should return sum of all item quantities', () => {
      addToCart('product-1', 3);
      addToCart('product-2', 7);
      addToCart('product-3', 2);
      
      expect(getCartQuantity()).toBe(12);
    });
  });

  describe('isInCart', () => {
    beforeEach(() => {
      resetCart();
      addToCart('product-1');
      addToCart('product-2');
    });

    it('should return true for existing product', () => {
      expect(isInCart('product-1')).toBe(true);
    });

    it('should return false for non-existent product', () => {
      expect(isInCart('product-999')).toBe(false);
    });
  });

  describe('getCartItem', () => {
    beforeEach(() => {
      resetCart();
      addToCart('product-1', 5);
    });

    it('should return cart item for existing product', () => {
      const item = getCartItem('product-1');
      
      expect(item).not.toBeNull();
      expect(item.productId).toBe('product-1');
      expect(item.quantity).toBe(5);
    });

    it('should return null for non-existent product', () => {
      const item = getCartItem('product-999');
      
      expect(item).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex cart operations', () => {
      resetCart();
      
      // Add multiple products
      addToCart('product-1', 2);
      addToCart('product-2', 3);
      addToCart('product-3', 1);
      expect(getCartQuantity()).toBe(6);
      
      // Update quantity
      updateQuantity('product-1', 5);
      expect(getCartQuantity()).toBe(9);
      
      // Remove one item
      removeFromCart('product-2');
      expect(cart.length).toBe(2);
      expect(getCartQuantity()).toBe(6);
      
      // Update delivery options
      updateAllDeliveryOptions('3');
      expect(cart[0].deliveryOptionId).toBe('3');
      expect(cart[1].deliveryOptionId).toBe('3');
      
      // Verify persistence
      const stored = JSON.parse(localStorage.getItem('cart'));
      expect(stored.length).toBe(2);
    });

    it('should survive page reload', () => {
      resetCart();
      addToCart('product-1', 5);
      addToCart('product-2', 3);
      
      // Simulate page reload
      loadFromStorage();
      
      expect(cart.length).toBe(2);
      expect(getCartQuantity()).toBe(8);
      expect(cart[0].productId).toBe('product-1');
    });
  });
});
