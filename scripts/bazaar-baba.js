import { cart, addToCart, getCartQuantity } from '../data/cart.js';
import { products, loadProducts } from '../data/products.js';
import { formatCurrency } from './utils/money.js';
import { searchProductsWithScore } from './utils/search.js';
import { config } from '../config/config.js';
import { 
  showProductSkeletons, 
  fadeIn,
  setButtonLoading,
  removeButtonLoading,
  showEmptyState
} from './utils/loading.js';

// Current search state
let currentSearchQuery = '';

/**
 * Render products grid with optional filtering
 */
async function renderProductsGrid(filteredProducts = null) {
  const gridContainer = document.querySelector('.js-products-grid');
  
  // Show skeleton loaders while loading
  if (!filteredProducts) {
    showProductSkeletons(gridContainer, 12);
  }
  
  try {
    await loadProducts();
    
    const productsToDisplay = filteredProducts || products;
    
    let productsHTML = '';
    
    if (productsToDisplay.length === 0) {
      if (currentSearchQuery) {
        showEmptyState(
          gridContainer,
          'No products found',
          `Try different keywords or <a href="bazaar-baba.html">browse all products</a>`
        );
      } else {
        showEmptyState(
          gridContainer,
          'No products available',
          'Please check back later'
        );
      }
      updateResultsCount(0);
      return;
    }
    
    productsToDisplay.forEach((product) => {
      productsHTML += `
        <div class="product-container fade-in">
          <div class="product-image-container">
            <a href="product-details.html?productId=${product.id}">
              <img class="product-image" src="${product.image}">
            </a>
            <button class="add-to-cart-button js-add-to-cart"
              data-product-id="${product.id}">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-top: -2px;">
                <path d="M9 20C9 21.1 8.1 22 7 22C5.9 22 5 21.1 5 20C5 18.9 5.9 18 7 18C8.1 18 9 18.9 9 20ZM17 20C17 21.1 16.1 22 15 22C13.9 22 13 21.1 13 20C13 18.9 13.9 18 15 18C16.1 18 17 18.9 17 20ZM7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L21.16 4.96L19.42 4H19.41L18.31 6L15.55 11H8.53L8.4 10.73L6.16 6L5.21 4L4.27 2H1V4H3L6.6 11.59L5.25 14.03C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75Z" fill="white"/>
              </svg>
              Add To Cart
            </button>
          </div>
          <div class="product-info-container">
            <div class="product-name limit-text-to-2-lines">
              <a href="product-details.html?productId=${product.id}" style="text-decoration: none; color: inherit;">
                ${product.name}
              </a>
            </div>
            <div class="product-price">
              $${formatCurrency(product.priceCents)}
            </div>
          </div>
        </div>
      `;
    });
    
    gridContainer.innerHTML = productsHTML;
    updateCartQuantity();
    attachCartButtonListeners();
    updateResultsCount(productsToDisplay.length);
    
  } catch (error) {
    config.error('Error rendering products:', error);
    showEmptyState(
      gridContainer,
      'Unable to load products',
      'Please refresh the page or try again later'
    );
  }
}

/**
 * Attach click listeners to "Add to Cart" buttons
 */
function attachCartButtonListeners() {
  document.querySelectorAll('.js-add-to-cart')
    .forEach((button) => {
      button.addEventListener('click', async () => {
        const productId = button.dataset.productId;
        
        // Show loading state
        const originalHTML = button.innerHTML;
        button.innerHTML = '<span class="spinner-inline"></span>Adding...';
        button.disabled = true;
        
        // Simulate slight delay for better UX (optional)
        await new Promise(resolve => setTimeout(resolve, 300));
        
        addToCart(productId);
        updateCartQuantity();
        
        // Show success state
        button.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
          </svg>
          Added
        `;
        button.disabled = false;
        
        // Reset to original state after 1 second
        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, 1000);
      });
    });
}

/**
 * Update cart quantity display
 */
function updateCartQuantity() {
  const cartQuantityEl = document.querySelector('.js-cart-quantity');
  if (cartQuantityEl) {
    cartQuantityEl.innerHTML = getCartQuantity();
  }
}

/**
 * Update search results count
 */
function updateResultsCount(count) {
  let resultsEl = document.querySelector('.js-search-results-count');
  
  if (!resultsEl) {
    // Create results count element if it doesn't exist
    const main = document.querySelector('.main');
    resultsEl = document.createElement('div');
    resultsEl.className = 'search-results-count js-search-results-count';
    main.insertBefore(resultsEl, main.firstChild);
  }
  
  if (currentSearchQuery) {
    resultsEl.innerHTML = `
      <p>Found ${count} product${count !== 1 ? 's' : ''} for "${currentSearchQuery}"
        <button class="clear-search-btn js-clear-search">Clear</button>
      </p>
    `;
    resultsEl.style.display = 'block';
    
    // Add clear button listener
    const clearBtn = document.querySelector('.js-clear-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearSearch);
    }
  } else {
    resultsEl.style.display = 'none';
  }
}

/**
 * Handle search
 */
function handleSearch() {
  const searchInput = document.querySelector('.search-bar');
  const query = searchInput.value.trim();
  
  config.log('Searching for:', query);
  currentSearchQuery = query;
  
  if (query) {
    const results = searchProductsWithScore(products, query);
    config.log(`Found ${results.length} results`);
    renderProductsGrid(results);
  } else {
    // Show all products if search is empty
    renderProductsGrid();
  }
}

/**
 * Clear search and show all products
 */
function clearSearch() {
  const searchInput = document.querySelector('.search-bar');
  searchInput.value = '';
  currentSearchQuery = '';
  renderProductsGrid();
}

/**
 * Initialize search functionality
 */
function initializeSearch() {
  const searchInput = document.querySelector('.search-bar');
  const searchButton = document.querySelector('.search-button');
  
  // Search on button click
  if (searchButton) {
    searchButton.addEventListener('click', handleSearch);
  }
  
  // Search on Enter key
  if (searchInput) {
    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    });
    
    // Optional: Real-time search as user types (debounced)
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        handleSearch();
      }, 500); // Wait 500ms after user stops typing
    });
  }
  
  config.log('Search initialized');
}

/**
 * Update home header styling
 */
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

// Initialize page
updateHomeHeader();
renderProductsGrid();
initializeSearch();

