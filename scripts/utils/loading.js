/**
 * Loading States Utilities
 * Provides functions to show/hide various loading indicators
 */

// ============= OVERLAY LOADER =============

/**
 * Show full-screen loading overlay
 * @param {string} message - Optional loading message
 */
export function showLoadingOverlay(message = 'Loading...') {
  // Remove existing overlay if present
  hideLoadingOverlay();
  
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'global-loading-overlay';
  overlay.innerHTML = `
    <div class="loading-overlay-content">
      <div class="spinner spinner-large"></div>
      <div class="loading-overlay-text">${message}</div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

/**
 * Hide full-screen loading overlay
 */
export function hideLoadingOverlay() {
  const overlay = document.getElementById('global-loading-overlay');
  if (overlay) {
    overlay.remove();
    document.body.style.overflow = '';
  }
}


// ============= INLINE LOADERS =============

/**
 * Show spinner in a specific container
 * @param {string|HTMLElement} container - Container selector or element
 * @param {string} size - 'small', 'medium', or 'large'
 */
export function showSpinner(container, size = 'medium') {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  if (!element) return;
  
  const sizeClass = size === 'small' ? 'spinner-small' : 
                    size === 'large' ? 'spinner-large' : '';
  
  element.innerHTML = `
    <div class="loading-center">
      <div class="spinner ${sizeClass}"></div>
    </div>
  `;
}

/**
 * Show dots loader in a container
 * @param {string|HTMLElement} container - Container selector or element
 */
export function showDotsLoader(container) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  if (!element) return;
  
  element.innerHTML = `
    <div class="dots-loader">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
}


// ============= SKELETON LOADERS =============

/**
 * Generate product card skeleton HTML
 * @param {number} count - Number of skeleton cards
 * @returns {string} HTML string
 */
export function generateProductSkeletons(count = 6) {
  let html = '<div class="products-grid-skeleton">';
  
  for (let i = 0; i < count; i++) {
    html += `
      <div class="product-card-skeleton">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-rating"></div>
        <div class="skeleton skeleton-price"></div>
        <div class="skeleton skeleton-button"></div>
      </div>
    `;
  }
  
  html += '</div>';
  return html;
}

/**
 * Show product skeletons in container
 * @param {string|HTMLElement} container - Container selector or element
 * @param {number} count - Number of skeletons
 */
export function showProductSkeletons(container, count = 6) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  if (!element) return;
  
  element.innerHTML = generateProductSkeletons(count);
}

/**
 * Generate table row skeletons
 * @param {number} rows - Number of skeleton rows
 * @param {number} columns - Number of columns per row
 * @returns {string} HTML string
 */
export function generateTableSkeletons(rows = 5, columns = 4) {
  let html = '';
  
  for (let i = 0; i < rows; i++) {
    html += '<div class="table-row-skeleton">';
    for (let j = 0; j < columns; j++) {
      html += '<div class="skeleton skeleton-cell"></div>';
    }
    html += '</div>';
  }
  
  return html;
}

/**
 * Generate order details skeleton
 * @returns {string} HTML string
 */
export function generateOrderSkeleton() {
  return `
    <div class="order-details-skeleton">
      <div class="skeleton skeleton-header"></div>
      <div class="skeleton skeleton-info"></div>
      <div class="skeleton skeleton-info"></div>
      <div class="skeleton skeleton-info"></div>
    </div>
  `;
}


// ============= BUTTON LOADING STATE =============

/**
 * Set button to loading state
 * @param {string|HTMLElement} button - Button selector or element
 * @param {string} originalText - Text to restore later (optional)
 */
export function setButtonLoading(button, originalText = null) {
  const element = typeof button === 'string' 
    ? document.querySelector(button) 
    : button;
  
  if (!element) return;
  
  // Store original text if not provided
  if (!originalText && !element.dataset.originalText) {
    element.dataset.originalText = element.textContent;
  }
  
  element.classList.add('loading');
  element.disabled = true;
}

/**
 * Remove loading state from button
 * @param {string|HTMLElement} button - Button selector or element
 */
export function removeButtonLoading(button) {
  const element = typeof button === 'string' 
    ? document.querySelector(button) 
    : button;
  
  if (!element) return;
  
  element.classList.remove('loading');
  element.disabled = false;
  
  // Restore original text if it was stored
  if (element.dataset.originalText) {
    element.textContent = element.dataset.originalText;
    delete element.dataset.originalText;
  }
}


// ============= PROGRESS BAR =============

/**
 * Show progress bar
 * @param {string|HTMLElement} container - Container selector or element
 * @param {number} progress - Progress percentage (0-100), or null for indeterminate
 */
export function showProgressBar(container, progress = null) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  if (!element) return;
  
  const isIndeterminate = progress === null || progress === undefined;
  
  element.innerHTML = `
    <div class="progress-bar-container">
      ${isIndeterminate 
        ? '<div class="progress-bar-indeterminate"></div>'
        : `<div class="progress-bar" style="width: ${progress}%"></div>`
      }
    </div>
  `;
}

/**
 * Update progress bar value
 * @param {string|HTMLElement} container - Container selector or element
 * @param {number} progress - Progress percentage (0-100)
 */
export function updateProgressBar(container, progress) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  if (!element) return;
  
  const bar = element.querySelector('.progress-bar');
  if (bar) {
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }
}


// ============= CART LOADING =============

/**
 * Show cart loading state
 * @param {string|HTMLElement} container - Container selector or element
 */
export function showCartLoading(container) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  if (!element) return;
  
  element.innerHTML = `
    <div class="cart-loading">
      <div class="spinner"></div>
      <div class="cart-loading-text">Loading your cart...</div>
    </div>
  `;
}


// ============= EMPTY STATE =============

/**
 * Show empty state message
 * @param {string|HTMLElement} container - Container selector or element
 * @param {string} message - Main message
 * @param {string} submessage - Optional submessage
 */
export function showEmptyState(container, message = 'No items found', submessage = '') {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  if (!element) return;
  
  element.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📦</div>
      <div class="empty-state-message">${message}</div>
      ${submessage ? `<div class="empty-state-submessage">${submessage}</div>` : ''}
    </div>
  `;
}


// ============= UTILITY FUNCTIONS =============

/**
 * Wrap async function with loading overlay
 * @param {Function} asyncFn - Async function to execute
 * @param {string} message - Loading message
 * @returns {Promise} Result of async function
 */
export async function withLoadingOverlay(asyncFn, message = 'Loading...') {
  showLoadingOverlay(message);
  try {
    return await asyncFn();
  } finally {
    hideLoadingOverlay();
  }
}

/**
 * Wrap async function with spinner in container
 * @param {string|HTMLElement} container - Container selector or element
 * @param {Function} asyncFn - Async function to execute
 * @param {string} size - Spinner size
 * @returns {Promise} Result of async function
 */
export async function withSpinner(container, asyncFn, size = 'medium') {
  showSpinner(container, size);
  try {
    return await asyncFn();
  } finally {
    // Container will be replaced by asyncFn result
  }
}

/**
 * Add fade-in animation to element
 * @param {string|HTMLElement} element - Element selector or element
 */
export function fadeIn(element) {
  const el = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;
  
  if (el) {
    el.classList.add('fade-in');
  }
}

/**
 * Simulate loading progress
 * @param {string|HTMLElement} container - Container selector or element
 * @param {number} duration - Duration in milliseconds
 * @returns {Promise} Resolves when complete
 */
export function simulateProgress(container, duration = 2000) {
  return new Promise((resolve) => {
    showProgressBar(container, 0);
    
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let current = 0;
    
    const timer = setInterval(() => {
      current += (100 / steps);
      updateProgressBar(container, current);
      
      if (current >= 100) {
        clearInterval(timer);
        resolve();
      }
    }, interval);
  });
}

// Export all functions as default object
export default {
  showLoadingOverlay,
  hideLoadingOverlay,
  showSpinner,
  showDotsLoader,
  generateProductSkeletons,
  showProductSkeletons,
  generateTableSkeletons,
  generateOrderSkeleton,
  setButtonLoading,
  removeButtonLoading,
  showProgressBar,
  updateProgressBar,
  showCartLoading,
  showEmptyState,
  withLoadingOverlay,
  withSpinner,
  fadeIn,
  simulateProgress
};
