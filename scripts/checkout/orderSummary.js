import { cart, removeFromCart, updateAllDeliveryOptions } from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import { deliveryOptions } from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
export function renderOrderSummary() {
  const container = document.querySelector('.js-order-summary');
  const deliveryContainer = document.querySelector('.js-delivery-summary');
  const deliveryTitle = document.querySelector('.delivery-section-title');
  const cartHeader = document.querySelector('.cart-header');
  if (cart.length === 0) {
    container.innerHTML = '<div style="padding: 20px;">Your cart is empty.</div>';
    deliveryContainer.innerHTML = '';
    if (deliveryTitle) deliveryTitle.style.display = 'none';
    if (cartHeader) cartHeader.style.display = 'none';
    renderPaymentSummary();
    return;
  }
  if (deliveryTitle) deliveryTitle.style.display = 'block';
  if (cartHeader) cartHeader.style.display = 'grid';
  let cartHTML = '';
  cart.forEach(cartItem => {
    const product = getProduct(cartItem.productId);
    
    // Skip if product not found (might not have loaded yet)
    if (!product) {
      console.error(`Product not found: ${cartItem.productId}`);
      return;
    }
    
    const subtotal = product.priceCents * cartItem.quantity;
    const displayQty = cartItem.quantity < 10 ? `0${cartItem.quantity}` : cartItem.quantity;
    cartHTML += `
      <div class="cart-item-container">
        <div class="product-col-wrapper">
          <div style="position:relative; width:50px;">
            <a href="product-details.html?productId=${product.id}" style="display: block;">
              <img src="${product.image}" style="width:100%; cursor: pointer;">
            </a>
            <button class="js-delete" data-id="${product.id}" style="position:absolute; top:-5px; left:-5px;">X</button>
          </div>
          <a href="product-details.html?productId=${product.id}" class="product-name-link">
            <span class="product-info-text">${product.name}</span>
          </a>
        </div>
        <div>$${formatCurrency(product.priceCents)}</div>
        <div class="quantity-wrapper">
          <span>${displayQty}</span>
          <div style="display:flex; flex-direction:column; gap:2px;">
            <button class="qty-btn js-plus" data-id="${product.id}">˄</button>
            <button class="qty-btn js-left" data-id="${product.id}">˅</button>
          </div>
        </div>
        <div>$${formatCurrency(subtotal)}</div>
      </div>
    `;
  });
  
  // Show message if no valid products found
  if (cartHTML === '') {
    container.innerHTML = '<div style="padding: 20px;">Loading cart items...</div>';
    deliveryContainer.innerHTML = '';
    if (deliveryTitle) deliveryTitle.style.display = 'none';
    renderPaymentSummary();
    return;
  }
  
  container.innerHTML = cartHTML;
  const currentDeliveryOptionId = cart[0].deliveryOptionId;
  let deliveryHTML = `
    <div class="delivery-card">
      <div class="delivery-card-header">
        <span>Choose Shipping Method</span>
      </div>
      <div class="delivery-options-grid">
        ${deliveryOptionsHTML(currentDeliveryOptionId)}
      </div>
    </div>
  `;
  deliveryContainer.innerHTML = deliveryHTML;
  setupListeners();
}
function deliveryOptionsHTML(currentDeliveryOptionId) {
  return deliveryOptions.map(opt => {
    const date = dayjs().add(opt.deliveryDays, 'days').format('dddd, MMM D');
    const price = opt.priceCents === 0 ? 'FREE' : `$${formatCurrency(opt.priceCents)}`;
    const isChecked = opt.id === currentDeliveryOptionId;
    return `
      <div class="delivery-option js-delivery-option"
           data-delivery-option-id="${opt.id}">
        <input type="radio"
               ${isChecked ? 'checked' : ''}
               name="delivery-option-global">
        <div>
          <div style="font-weight:600; font-size:14px;">${price} Shipping</div>
          <div style="font-size:12px; color:#555;">Arrives ${date}</div>
        </div>
      </div>
    `;
  }).join('');
}
function setupListeners() {
  document.querySelectorAll('.js-plus').forEach(btn => {
    btn.onclick = () => {
      const item = cart.find(i => i.productId === btn.dataset.id);
      item.quantity++;
      saveAndRender();
    };
  });
  document.querySelectorAll('.js-left').forEach(btn => {
    btn.onclick = () => {
      const item = cart.find(i => i.productId === btn.dataset.id);
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        removeFromCart(btn.dataset.id);
      }
      saveAndRender();
    };
  });
  document.querySelectorAll('.js-delete').forEach(btn => {
    btn.onclick = () => {
      removeFromCart(btn.dataset.id);
      saveAndRender();
    };
  });
  document.querySelectorAll('.js-delivery-option').forEach(element => {
    element.addEventListener('click', () => {
      const { deliveryOptionId } = element.dataset;
      updateAllDeliveryOptions(deliveryOptionId);
      saveAndRender();
    });
  });
}
function saveAndRender() {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderOrderSummary();
  renderPaymentSummary();
}