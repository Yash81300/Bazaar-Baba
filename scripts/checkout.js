import { renderOrderSummary } from './checkout/orderSummary.js';
import { renderPaymentSummary } from './checkout/paymentSummary.js';
import { loadProducts } from '../data/products.js';
import { loadFromStorage } from '../data/cart.js';
import { showLoadingOverlay, hideLoadingOverlay } from './utils/loading.js';

async function loadPage() {
  showLoadingOverlay('Loading your cart...');
  
  try {
    await loadProducts();
    loadFromStorage();
    renderOrderSummary();
    renderPaymentSummary();
  } catch (error) {
    console.error('Error loading page:', error);
    // Show error message to user
    const mainContent = document.querySelector('.main');
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-message">Unable to load cart</div>
          <div class="empty-state-submessage">Please refresh the page or try again later</div>
        </div>
      `;
    }
  } finally {
    hideLoadingOverlay();
  }
}

loadPage();
