import { products, loadProducts } from '../data/products.js';
import { addToCart, cart } from '../data/cart.js';
let selectedColor = null;
let selectedSize = null;
let currentProduct = null;
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
      <img
        id="orders-logo"
        class="your-orders-icon"
        src="images/your-orders-logo.png"
        alt="Your Orders"
        style="height: 37.5px; width: auto; object-fit: contain;"
      >
    `;
  }
}
async function initProductPage() {
  updateHomeHeader();
  await loadProducts();
  updateCartQuantity();
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('productId');
  const product = products.find(product => product.id === productId);
  if (!product) {
    document.querySelector('.main-container').innerHTML =
      '<h1>Product not found</h1>';
    return;
  }
  currentProduct = product;
  renderProductDetails(product);
  renderColorOptions(product);
  renderSizeOptions(product);
  initInteractivity(product);
}
function updateCartQuantity() {
  let cartQuantity = 0;
  cart.forEach(item => {
    cartQuantity += item.quantity;
  });
  const quantityElement = document.querySelector('.js-cart-quantity');
  if (quantityElement) {
    quantityElement.innerHTML = cartQuantity;
  }
}
function renderProductDetails(product) {
  const mainImage = document.querySelector('.js-product-image');
  if (mainImage) mainImage.src = product.image;
  document.querySelectorAll('.thumbnail').forEach(t => {
    t.src = product.image;
  });
  document.querySelectorAll('.js-product-name').forEach(el => {
    el.innerText = product.name;
  });
  const priceEl = document.querySelector('.js-product-price');
  if (priceEl) {
    priceEl.innerText = `$${(product.priceCents / 100).toFixed(2)}`;
  }
  const descEl = document.querySelector('.js-product-description');
  if (descEl) {
    descEl.innerText = product.description || generateDescription(product);
  }
  const ratingStars = document.querySelector('.js-rating-stars');
  const ratingCount = document.querySelector('.js-rating-count');
  if (ratingStars) {
    ratingStars.src = `images/ratings/rating-${product.rating.stars * 10}.png`;
  }
  if (ratingCount) {
    ratingCount.innerText = `(${product.rating.count} Reviews)`;
  }
  const addToCartBtn = document.querySelector('.js-add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const quantityInput = document.querySelector('.js-quantity-selector');
      const quantity = Math.max(1, Number(quantityInput.value) || 1);
      addToCart(product.id, quantity);
      updateCartQuantity();
      const originalText = addToCartBtn.innerText;
      addToCartBtn.innerText = '✓ Added';
      addToCartBtn.style.background = '#00D632';
      setTimeout(() => {
        addToCartBtn.innerText = originalText;
        addToCartBtn.style.background = '';
      }, 1000);
    });
  }
}
function renderColorOptions(product) {
  const colorSection = document.querySelector('.js-color-section');
  const colorOptionsContainer = document.querySelector('.js-color-options');
  if (!colorSection || !colorOptionsContainer) return;
  if (product.colors && product.colors.length > 0) {
    colorSection.style.display = 'block';
    let colorHTML = '';
    product.colors.forEach((color, index) => {
      const isSelected = index === 0 ? 'selected' : '';
      const borderStyle = color.hex === '#FFFFFF' || color.hex.toLowerCase() === '#ffffff'
        ? 'border: 2px solid #ddd;'
        : '';
      colorHTML += `
        <button
          class="color-swatch ${isSelected}"
          data-color="${color.name}"
          data-hex="${color.hex}"
          style="background-color: ${color.hex}; ${borderStyle}"
          title="${color.name}"
        ></button>
      `;
    });
    colorOptionsContainer.innerHTML = colorHTML;
    selectedColor = product.colors[0].name;
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => {
          s.classList.remove('selected');
        });
        swatch.classList.add('selected');
        selectedColor = swatch.getAttribute('data-color');
        console.log('Selected color:', selectedColor);
      });
    });
  } else {
    colorSection.style.display = 'none';
  }
}
function renderSizeOptions(product) {
  const sizeSection = document.querySelector('.js-size-section');
  const sizeOptionsContainer = document.querySelector('.js-size-options');
  if (!sizeSection || !sizeOptionsContainer) return;
  if (product.sizes && product.sizes.length > 0) {
    sizeSection.style.display = 'block';
    let sizeHTML = '';
    product.sizes.forEach((size, index) => {
      const isSelected = index === 0 ? 'selected' : '';
      sizeHTML += `
        <button class="size-option ${isSelected}" data-size="${size}">
          ${size}
        </button>
      `;
    });
    sizeOptionsContainer.innerHTML = sizeHTML;
    selectedSize = product.sizes[0];
    document.querySelectorAll('.size-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.size-option').forEach(o => {
          o.classList.remove('selected');
        });
        option.classList.add('selected');
        selectedSize = option.getAttribute('data-size');
        console.log('Selected size:', selectedSize);
      });
    });
  } else {
    sizeSection.style.display = 'none';
  }
}
function generateDescription(product) {
  const category = product.keywords?.[0] || 'product';
  return `High-quality ${category} delivered straight to your door. Premium materials, durable construction, and modern design. Trusted by ${product.rating.count}+ customers.`;
}
function initInteractivity(product) {
  const mainImage = document.querySelector('.js-product-image');
  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach(t => {
    t.addEventListener('click', () => {
      thumbnails.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      if (mainImage) mainImage.src = t.src;
    });
  });
  const qtyMinus = document.querySelector('.qty-minus');
  const qtyPlus = document.querySelector('.qty-plus');
  const qtyValue = document.querySelector('.qty-value');
  if (qtyMinus && qtyValue) {
    qtyMinus.addEventListener('click', () => {
      qtyValue.value = Math.max(1, Number(qtyValue.value) - 1);
    });
  }
  if (qtyPlus && qtyValue) {
    qtyPlus.addEventListener('click', () => {
      qtyValue.value = Number(qtyValue.value) + 1;
    });
  }
  const wishlistBtn = document.querySelector('.wishlist-btn');
  if (wishlistBtn) {
    let isWishlisted = false;
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      const wishlist = JSON.parse(savedWishlist);
      isWishlisted = wishlist.includes(product.id);
      if (isWishlisted) {
        wishlistBtn.innerHTML = '♥';
        wishlistBtn.style.color = '#DB4444';
      }
    }
    wishlistBtn.addEventListener('click', () => {
      isWishlisted = !isWishlisted;
      let wishlist = [];
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
      }
      if (isWishlisted) {
        wishlistBtn.innerHTML = '♥';
        wishlistBtn.style.color = '#DB4444';
        wishlistBtn.style.borderColor = '#DB4444';
        if (!wishlist.includes(product.id)) {
          wishlist.push(product.id);
        }
        wishlistBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
          wishlistBtn.style.transform = 'scale(1)';
        }, 200);
      } else {
        wishlistBtn.innerHTML = '♡';
        wishlistBtn.style.color = '';
        wishlistBtn.style.borderColor = '';
        wishlist = wishlist.filter(id => id !== product.id);
      }
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    });
  }
}
initProductPage();
