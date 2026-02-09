/**
 * Shopping Cart Module
 * 
 * Manages the shopping cart with localStorage persistence.
 * Uses functional programming approach for simplicity and testability.
 */

import { config } from '../config/config.js';

// Constants
const CART_STORAGE_KEY = 'cart';
const DEFAULT_DELIVERY_OPTION_ID = '1';

// Default cart items (for first-time users)
const DEFAULT_CART_ITEMS = [
  {
    productId: 'e43638ce-6aa0-4b85-b27f-e1d07eb678c6',
    quantity: 2,
    deliveryOptionId: '1'
  },
  {
    productId: '15b6fc6f-327a-4ec4-896f-486349e85a3d',
    quantity: 1,
    deliveryOptionId: '2'
  }
];

/**
 * The cart array - holds all cart items
 * Each item: { productId: string, quantity: number, deliveryOptionId: string }
 */
export let cart;

/**
 * Initialize cart from localStorage
 */
export function loadFromStorage() {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    cart = storedCart ? JSON.parse(storedCart) : [...DEFAULT_CART_ITEMS];
    config.debug(`Cart loaded: ${cart.length} items`);
  } catch (error) {
    config.error('Error loading cart from storage:', error);
    cart = [...DEFAULT_CART_ITEMS];
  }
}

/**
 * Save cart to localStorage
 */
function saveToStorage() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    config.debug(`Cart saved: ${cart.length} items`);
  } catch (error) {
    config.error('Error saving cart to storage:', error);
  }
}

/**
 * Clear all items from cart
 */
export function resetCart() {
  cart = [];
  saveToStorage();
  config.log('Cart reset');
}

/**
 * Add a product to the cart
 * @param {string} productId - The product ID to add
 * @param {number} quantity - Quantity to add (default: 1)
 */
export function addToCart(productId, quantity = 1) {
  if (!productId) {
    config.error('addToCart: productId is required');
    return;
  }

  if (quantity <= 0) {
    config.error('addToCart: quantity must be positive');
    return;
  }

  // Find existing item
  const matchingItem = cart.find(item => item.productId === productId);
  
  if (matchingItem) {
    // Update existing item
    matchingItem.quantity += quantity;
    config.debug(`Updated cart item ${productId}: quantity = ${matchingItem.quantity}`);
  } else {
    // Add new item with default or first item's delivery option
    const deliveryOptionId = cart.length > 0 
      ? cart[0].deliveryOptionId 
      : DEFAULT_DELIVERY_OPTION_ID;
    
    cart.push({
      productId,
      quantity,
      deliveryOptionId
    });
    config.debug(`Added new item to cart: ${productId}`);
  }
  
  saveToStorage();
}

/**
 * Remove a product from the cart
 * @param {string} productId - The product ID to remove
 * @returns {boolean} - True if item was removed, false otherwise
 */
export function removeFromCart(productId) {
  const initialLength = cart.length;
  cart = cart.filter(item => item.productId !== productId);
  
  const wasRemoved = cart.length < initialLength;
  if (wasRemoved) {
    saveToStorage();
    config.debug(`Removed item from cart: ${productId}`);
  } else {
    config.debug(`Item not found in cart: ${productId}`);
  }
  
  return wasRemoved;
}

/**
 * Update quantity for a cart item
 * @param {string} productId - The product ID
 * @param {number} newQuantity - The new quantity
 * @returns {boolean} - True if updated successfully
 */
export function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    config.error('updateQuantity: quantity must be positive');
    return false;
  }

  const item = cart.find(cartItem => cartItem.productId === productId);
  
  if (item) {
    item.quantity = newQuantity;
    saveToStorage();
    config.debug(`Updated quantity for ${productId}: ${newQuantity}`);
    return true;
  }
  
  config.debug(`Item not found in cart: ${productId}`);
  return false;
}

/**
 * Update delivery option for all items in cart
 * @param {string} deliveryOptionId - The delivery option ID to set
 */
export function updateAllDeliveryOptions(deliveryOptionId) {
  cart.forEach(item => {
    item.deliveryOptionId = deliveryOptionId;
  });
  saveToStorage();
  config.debug(`Updated all delivery options to: ${deliveryOptionId}`);
}

/**
 * Update delivery option for a specific product
 * @param {string} productId - The product ID
 * @param {string} deliveryOptionId - The delivery option ID
 * @returns {boolean} - True if updated successfully
 */
export function updateDeliveryOption(productId, deliveryOptionId) {
  const item = cart.find(cartItem => cartItem.productId === productId);
  
  if (item) {
    item.deliveryOptionId = deliveryOptionId;
    saveToStorage();
    config.debug(`Updated delivery option for ${productId}: ${deliveryOptionId}`);
    return true;
  }
  
  config.debug(`Item not found in cart: ${productId}`);
  return false;
}

/**
 * Get total number of items in cart
 * @returns {number} - Total quantity of all items
 */
export function getCartQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Check if a product is in the cart
 * @param {string} productId - The product ID to check
 * @returns {boolean} - True if product is in cart
 */
export function isInCart(productId) {
  return cart.some(item => item.productId === productId);
}

/**
 * Get cart item by product ID
 * @param {string} productId - The product ID
 * @returns {Object|null} - Cart item or null if not found
 */
export function getCartItem(productId) {
  return cart.find(item => item.productId === productId) || null;
}

// Initialize cart on module load
loadFromStorage();

