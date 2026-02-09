import { loadProducts, getProduct } from '../data/products.js';
import { getOrders } from '../data/orders.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { cart } from '../data/cart.js';
const params = new URLSearchParams(window.location.search);
const orderId = params.get('orderId');
updateCartQuantity();
updateHomeHeader();
loadTrackingPage();
let currentOrder = null;
let updateInterval = null;
async function loadTrackingPage() {
  await loadProducts();
  const orders = await getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    document.querySelector('.js-order-tracking').innerHTML = `
      <p>Order not found. <a href="orders.html">Back to orders</a></p>
    `;
    return;
  }
  currentOrder = order;
  renderTrackingUI();
  updateInterval = setInterval(() => {
    updateProgressBar();
  }, 5000);
  updateProgressBar();
}
function renderTrackingUI() {
  const deliveryDate = dayjs(currentOrder.orderTime)
    .add(5, 'days')
    .format('dddd, MMMM D');
  document.querySelector('.js-order-tracking').innerHTML = `
    <a class="back-to-orders-link link-primary" href="orders.html">
      View all orders
    </a>
    <div class="order-tracking">
      <div class="delivery-date">
        Arriving on ${deliveryDate}
      </div>
      <div class="order-details-grid">
        ${currentOrder.products.map(orderItem => {
          const product = getProduct(orderItem.productId);
          return `
            <div class="product-row">
              <img class="product-image" src="${product?.image || ''}">
              <div class="product-info">
                <div class="product-name">
                  ${product?.name || 'Unknown Product'}
                </div>
                <div class="product-quantity">
                  Quantity: ${orderItem.quantity}
                </div>
              </div>
            </div>
          `;
        }).join('')}
        <div class="progress-container">
          <div class="progress-bar-background">
            <div class="progress-bar js-progress-bar" style="width: 0%;"></div>
          </div>
          <div class="progress-icons js-progress-icons">
            <div class="status-check-icon" data-status="0">
              <span class="icon-content">✓</span>
            </div>
            <div class="status-check-icon" data-status="1">
              <span class="icon-content">2</span>
            </div>
            <div class="status-check-icon" data-status="2">
              <span class="icon-content">3</span>
            </div>
            <div class="status-check-icon" data-status="3">
              <span class="icon-content">4</span>
            </div>
          </div>
          <div class="progress-labels-container js-progress-labels">
            <div class="progress-label" data-label="0">
              Order placed
            </div>
            <div class="progress-label" data-label="1">
              Shipped
            </div>
            <div class="progress-label" data-label="2">
              Out for delivery
            </div>
            <div class="progress-label" data-label="3">
              Delivered
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
function updateProgressBar() {
  if (!currentOrder) return;
  const orderTime = dayjs(currentOrder.orderTime);
  const deliveryTime = orderTime.add(5, 'days');
  const now = dayjs();
  const totalTime = deliveryTime.diff(orderTime);
  const elapsedTime = now.diff(orderTime);
  let progressPercent = (elapsedTime / totalTime) * 100;
  progressPercent = Math.max(0, Math.min(100, progressPercent));
  let currentStatus = 0;
  if (progressPercent >= 75) {
    currentStatus = 3;
  } else if (progressPercent >= 50) {
    currentStatus = 2;
  } else if (progressPercent >= 25) {
    currentStatus = 1;
  } else {
    currentStatus = 0;
  }
  const progressBar = document.querySelector('.js-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }
  const icons = document.querySelectorAll('.status-check-icon');
  icons.forEach((icon, index) => {
    icon.classList.remove('current-status-icon', 'completed-status-icon');
    if (index < currentStatus) {
      icon.classList.add('completed-status-icon');
      icon.querySelector('.icon-content').textContent = '✓';
    } else if (index === currentStatus) {
      icon.classList.add('current-status-icon');
      if (index === 0) {
        icon.querySelector('.icon-content').textContent = '✓';
      } else {
        icon.querySelector('.icon-content').textContent = '✓';
      }
    } else {
      icon.querySelector('.icon-content').textContent = index + 1;
    }
  });
  const labels = document.querySelectorAll('.progress-label');
  labels.forEach((label, index) => {
    label.classList.remove('progress-label-current', 'current-status', 'completed-label');
    if (index < currentStatus) {
      label.classList.add('completed-label');
    } else if (index === currentStatus) {
      label.classList.add('current-status');
    }
  });
  if (progressPercent >= 100) {
    clearInterval(updateInterval);
  }
}
function updateCartQuantity() {
  let quantity = 0;
  cart.forEach(item => quantity += Number(item.quantity));
  const quantityEl = document.querySelector('.js-cart-quantity');
  if (quantityEl) quantityEl.innerHTML = quantity;
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
window.addEventListener('beforeunload', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});
