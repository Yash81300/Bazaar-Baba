import { cart, resetCart } from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { getDeliveryOption } from '../../data/deliveryOptions.js';
import { placeOrder } from '../../data/orders.js';
import { formatCurrency } from '../utils/money.js';
export function renderPaymentSummary() {
  let productPriceCents = 0;
  let shippingPriceCents = 0;
  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    
    // Skip if product not found
    if (!product) {
      console.error(`Product not found in payment summary: ${cartItem.productId}`);
      return;
    }
    
    productPriceCents += product.priceCents * cartItem.quantity;
    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    shippingPriceCents += deliveryOption.priceCents;
  });
  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const taxCents = totalBeforeTaxCents * 0.1;
  const totalCents = totalBeforeTaxCents + taxCents;
  const paymentSummaryHTML = `
    <div class="payment-summary">
      <div class="payment-summary-title">Order Summary</div>
      <div class="payment-summary-row">
        <div>Items (${cart.length}):</div>
        <div class="payment-summary-money">$${formatCurrency(productPriceCents)}</div>
      </div>
      <div class="payment-summary-row">
        <div>Shipping & handling:</div>
        <div class="payment-summary-money">
          ${shippingPriceCents === 0 ? 'Free' : '$' + formatCurrency(shippingPriceCents)}
        </div>
      </div>
      <div class="payment-summary-row">
        <div>Total before tax:</div>
        <div class="payment-summary-money">$${formatCurrency(totalBeforeTaxCents)}</div>
      </div>
      <div class="payment-summary-row">
        <div>Estimated tax (10%):</div>
        <div class="payment-summary-money">$${formatCurrency(taxCents)}</div>
      </div>
      <div class="payment-summary-row total-row">
        <div>Order total:</div>
        <div class="payment-summary-money">$${formatCurrency(totalCents)}</div>
      </div>
      <button class="place-order-button button-primary js-place-order">
        Place Your Order
      </button>
    </div>
  `;
  document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;
  document.querySelector('.js-place-order')
    .addEventListener('click', async () => {
      if (cart.length === 0) {
        alert('Cart is empty!');
        return;
      }
      try {
        const order = {
          id: crypto.randomUUID(),
          orderTime: new Date().toISOString(),
          products: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            deliveryOptionId: item.deliveryOptionId
          })),
          totalCostCents: Math.round(totalCents)
        };
        await placeOrder(order);
        resetCart();
        window.location.href = 'orders.html';
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order. Check if the backend is running.');
      }
    });
}