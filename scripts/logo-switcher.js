const LOGO_PATHS = {
  light: {
    desktop: "images/bazaar-baba-logo.png",
    mobile:  "images/bazaar-baba-mobile.png",
    orders:  "images/your-orders-logo.png"
  },
  dark: {
    desktop: "images/bazaar-baba-logo-neon.png",
    mobile:  "images/bazaar-baba-mobile-neon.png",
    orders:  "images/your-orders-neon.png"
  }
};
function updateLogos() {
  const dataTheme = document.documentElement.getAttribute('data-theme');
  const localStorageTheme = localStorage.getItem('theme');
  const isDark = dataTheme === 'dark' || localStorageTheme === 'dark';
  const desktopImg = document.getElementById('desktop-logo');
  const mobileImg  = document.getElementById('mobile-logo');
  const ordersImg  = document.getElementById('orders-logo');
  const mode = isDark ? 'dark' : 'light';
  if (desktopImg) {
    desktopImg.src = LOGO_PATHS[mode].desktop;
  }
  if (mobileImg) {
    mobileImg.src = LOGO_PATHS[mode].mobile;
  }
  if (ordersImg) {
    ordersImg.src = LOGO_PATHS[mode].orders;
  }
}
function initialize() {
  updateLogos();
  setTimeout(updateLogos, 100);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
      updateLogos();
    }
  });
});
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme']
});
window.addEventListener('storage', (e) => {
  if (e.key === 'theme') {
    updateLogos();
  }
});
