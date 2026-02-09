import { config } from '../config/config.js';

/**
 * Place a new order via the backend API
 */
export async function placeOrder(order) {
  try {
    config.debug('Placing order:', order);
    
    const response = await fetch(config.endpoints.orders(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order),
      signal: AbortSignal.timeout(config.API_TIMEOUT)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      config.error('Backend Error Details:', errorData);
      throw new Error(`Failed to place order: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    config.log('Order placed successfully:', data.id);
    return data;
    
  } catch (error) {
    config.error('Error placing order:', error.message);
    throw error;
  }
}

/**
 * Fetch all orders from the backend API
 */
export async function getOrders() {
  try {
    config.debug('Fetching all orders');
    
    const response = await fetch(config.endpoints.orders(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(config.API_TIMEOUT)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    config.log(`Fetched ${data.length} orders`);
    return data;
    
  } catch (error) {
    config.error('Error fetching orders:', error.message);
    throw error;
  }
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId) {
  try {
    config.debug('Fetching order:', orderId);
    
    const response = await fetch(config.endpoints.order(orderId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(config.API_TIMEOUT)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        config.error(`Order ${orderId} not found`);
        return null;
      }
      throw new Error(`Failed to fetch order: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    config.log('Order loaded:', orderId);
    return data;
    
  } catch (error) {
    config.error('Error fetching order:', error.message);
    return null;
  }
}

/**
 * Delete an order by ID
 */
export async function deleteOrder(orderId) {
  try {
    config.debug('Deleting order:', orderId);
    
    const response = await fetch(config.endpoints.order(orderId), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(config.API_TIMEOUT)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        config.error(`Order ${orderId} not found`);
        return false;
      }
      throw new Error(`Failed to delete order: ${response.status} ${response.statusText}`);
    }
    
    config.log('Order deleted successfully:', orderId);
    return true;
    
  } catch (error) {
    config.error('Error deleting order:', error.message);
    return false;
  }
}
