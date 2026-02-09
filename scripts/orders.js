import { getOrders } from '../data/orders.js';
import { getProduct, loadProducts } from '../data/products.js';
import { addToCart, cart } from '../data/cart.js';
import { formatCurrency } from './utils/money.js';
import { 
  showLoadingOverlay, 
  hideLoadingOverlay,
  generateOrderSkeleton,
  showEmptyState,
  setButtonLoading,
  removeButtonLoading
} from './utils/loading.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

loadOrdersPage();
updateCartQuantity();
updateHomeHeader();

async function loadOrdersPage() {
  const container = document.querySelector('.js-orders-grid');
  
  // Show loading skeleton
  container.innerHTML = `
    <div class="page-header-wrapper">
      <div class="breadcrumb-container">
        <a href="bazaar-baba.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Orders</span>
      </div>
      <div class="page-title">Your Orders</div>
    </div>
    ${generateOrderSkeleton()}
    ${generateOrderSkeleton()}
    ${generateOrderSkeleton()}
  `;
  
  try {
    await loadProducts();
    const orders = await getOrders();
    
    orders.sort((a, b) => {
      const dateA = new Date(a.orderTime).getTime();
      const dateB = new Date(b.orderTime).getTime();
      return dateB - dateA;
    });
    
    renderOrders(orders);
  } catch (error) {
    console.error('Error loading orders page:', error);
    container.innerHTML = `
      <div class="page-header-wrapper">
        <div class="breadcrumb-container">
          <a href="bazaar-baba.html" class="breadcrumb-link">Home</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Orders</span>
        </div>
        <div class="page-title">Your Orders</div>
      </div>
    `;
    showEmptyState(
      container,
      'Unable to load orders',
      'Please refresh the page or try again later'
    );
  }
}
function updateCartQuantity() {
  let quantity = 0;
  cart.forEach(item => {
    quantity += Number(item.quantity);
  });
  const cartQuantityEl = document.querySelector('.js-cart-quantity');
  if (cartQuantityEl) {
    cartQuantityEl.innerHTML = quantity;
  }
}
function updateHomeHeader() {
  const ordersLink = document.querySelector('a[href="orders.html"]');
  if (ordersLink) {
    ordersLink.style.display = 'flex';
    ordersLink.style.alignItems = 'center';
    ordersLink.style.height = '100%';
    ordersLink.style.textDecoration = 'none';
    ordersLink.style.transform = 'translateX(25px)';
    ordersLink.style.borderRight = '1.5px solid #bcbcbc';
    ordersLink.style.padding = '0 8px 0 10px';
    ordersLink.style.marginRight = '32px';
    ordersLink.innerHTML = `
      <img id="orders-logo"
           class="your-orders-icon"
           src="images/your-orders-logo.png"
           alt="Your Orders"
           style="height: 37.5px; width: auto; object-fit: contain;">
    `;
  }
}
function renderOrders(orders) {
  const container = document.querySelector('.js-orders-grid');
  let html = `
    <div class="page-header-wrapper">
      <div class="breadcrumb-container">
        <a href="bazaar-baba.html" class="breadcrumb-link">Home</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Orders</span>
      </div>
      <div class="page-title">Your Orders</div>
    </div>
  `;
  if (!orders || orders.length === 0) {
    html += '<p class="empty-orders-message">You have no orders yet.</p>';
    container.innerHTML = html;
    return;
  }
  orders.forEach(order => {
    const orderDate = dayjs(order.orderTime).format('MMMM D, YYYY');
    const orderId = order.id;
    const totalCostCents = order.totalCostCents;
    const orderProducts = order.products || [];
    const hasMultipleItems = orderProducts.length > 1;
    const collapsedClass = hasMultipleItems ? 'collapsed' : '';
    html += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order placed</div>
              <div>${orderDate}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Order total</div>
              <div>$${formatCurrency(totalCostCents)}</div>
            </div>
          </div>
          <div class="order-header-right-section">
            <div class="order-header-label">Order ID</div>
            <div>${orderId}</div>
          </div>
        </div>
        <div class="order-details-grid">
          <div class="product-list-wrapper">
            <div class="product-list ${collapsedClass} js-list-${orderId}">
              ${renderOrderItems(orderProducts)}
              ${hasMultipleItems ? `<div class="product-list-fade js-fade-${orderId}"></div>` : ''}
            </div>
          </div>
          <div class="order-actions">
            <a href="tracking.html?orderId=${orderId}">
              <button class="track-package-button button-secondary">
                Track package
              </button>
            </a>
            <button class="buy-again-button button-primary js-buy-again"
              data-order-id="${orderId}">
              <span class="buy-again-message">Buy Order Again</span>
            </button>
          </div>
          ${hasMultipleItems ? `
            <div class="expand-order-btn js-show-more" data-order-id="${orderId}">
              <span class="chevron-icon">v</span>
            </div>` : ''
          }
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
  attachEventListeners(orders);
}
function renderOrderItems(orderProducts) {
  let html = '';
  orderProducts.forEach(item => {
    const product = getProduct(item.productId);
    if (!product) return;
    html += `
      <div class="product-item-container">
        <div class="product-image-container">
          <a href="product-details.html?productId=${product.id}">
            <img src="${product.image}" style="cursor: pointer;">
          </a>
        </div>
        <div class="product-details">
          <a href="product-details.html?productId=${product.id}" class="product-name-link">
            <div class="product-name">${product.name}</div>
          </a>
          <div class="product-quantity">
            Quantity: ${item.quantity}
          </div>
        </div>
      </div>
    `;
  });
  return html;
}
function attachEventListeners(orders) {
  document.querySelectorAll('.js-buy-again').forEach(button => {
    button.addEventListener('click', async () => {
      const orderId = button.dataset.orderId;
      const order = orders.find(o => o.id === orderId);
      
      if (order) {
        // Show loading state
        setButtonLoading(button);
        
        try {
          // Add all items to cart
          order.products.forEach(item => addToCart(item.productId, item.quantity));
          updateCartQuantity();
          
          // Small delay for UX
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Redirect to checkout
          window.location.href = 'checkout.html';
        } catch (error) {
          console.error('Error adding items to cart:', error);
          removeButtonLoading(button);
          // Could show an error message here
        }
      }
    });
  });
  
  document.querySelectorAll('.js-show-more').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.orderId;
      const listContainer = document.querySelector(`.js-list-${orderId}`);
      const fadeOverlay = document.querySelector(`.js-fade-${orderId}`);
      const isCollapsed = listContainer.classList.contains('collapsed');
      if (isCollapsed) {
        listContainer.classList.remove('collapsed');
        if (fadeOverlay) fadeOverlay.style.display = 'none';
        btn.classList.add('expanded');
      } else {
        listContainer.classList.add('collapsed');
        if (fadeOverlay) fadeOverlay.style.display = 'block';
        btn.classList.remove('expanded');
      }
    });
  });
}
