/**
 * ChicSac — Timeless Elegance
 * Unified Luxury Interaction Controller
 * Handles Navigation, Search, VIP Portal, Cart Drawer, Gallery, Order Checkout, Currency Conversion
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const BASE_PRICE_USD = 40.0;
  let cartQuantity = 1;
  let selectedColorName = 'Cognac Tan';
  let selectedColorImage = 'assets/images/bag-front.jpg';
  let promoDiscountPercent = 0; // 10% when CHIC10 is applied
  let activeCurrencyCode = 'USD';

  const currencyMap = {
    USD: { symbol: '$', rate: 1.0, isPrefix: true, decimals: 2 },
    EUR: { symbol: '€', rate: 0.95, isPrefix: true, decimals: 2 },
    GBP: { symbol: '£', rate: 0.80, isPrefix: true, decimals: 2 },
    AED: { symbol: ' AED', rate: 3.75, isPrefix: false, decimals: 0 },
    SAR: { symbol: ' SAR', rate: 3.75, isPrefix: false, decimals: 0 }
  };

  // Toast Notification Helper
  const toastEl = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl || !toastText) return;
    toastText.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  // Price Calculation & Formatting
  function formatAmount(baseAmountUsd) {
    const config = currencyMap[activeCurrencyCode] || currencyMap.USD;
    const discountedUsd = baseAmountUsd * (1 - promoDiscountPercent / 100);
    const converted = discountedUsd * config.rate;

    if (config.decimals === 0) {
      const rounded = Math.round(converted);
      return config.isPrefix ? `${config.symbol}${rounded}` : `${rounded}${config.symbol}`;
    } else {
      const valStr = converted.toFixed(config.decimals);
      return config.isPrefix ? `${config.symbol}${valStr}` : `${valStr}${config.symbol}`;
    }
  }

  // Update All Prices Across Page, Drawer, and Modals
  function refreshPriceDisplays() {
    const unitFormatted = formatAmount(BASE_PRICE_USD);
    const totalFormatted = formatAmount(BASE_PRICE_USD * cartQuantity);

    // Main showcase price
    const displayPrice = document.getElementById('display-price');
    if (displayPrice) displayPrice.textContent = unitFormatted;

    // Nav CTA price display
    document.querySelectorAll('.nav-price-display').forEach(el => {
      el.textContent = unitFormatted;
    });

    // Cart Drawer prices
    const drawerItemPrice = document.getElementById('drawer-item-price');
    if (drawerItemPrice) drawerItemPrice.textContent = unitFormatted;

    const drawerSubtotal = document.getElementById('drawer-subtotal-val');
    if (drawerSubtotal) drawerSubtotal.textContent = totalFormatted;

    const drawerTotal = document.getElementById('drawer-total-val');
    if (drawerTotal) drawerTotal.textContent = totalFormatted;

    const drawerBtnPrice = document.getElementById('drawer-btn-price');
    if (drawerBtnPrice) drawerBtnPrice.textContent = totalFormatted;

    // Order Checkout Modal prices
    const summarySubtotal = document.getElementById('summary-subtotal');
    if (summarySubtotal) summarySubtotal.textContent = totalFormatted;

    const summaryTotal = document.getElementById('summary-total');
    if (summaryTotal) summaryTotal.textContent = totalFormatted;

    const submitOrderBtn = document.getElementById('submit-order-btn');
    if (submitOrderBtn) submitOrderBtn.textContent = `CONFIRM ORDER (${totalFormatted})`;
  }

  // Update Cart Badges
  function refreshCartBadges() {
    const topBadge = document.getElementById('top-cart-badge');
    const heroBadge = document.getElementById('live-cart-counter');
    const mobileBadge = document.getElementById('mobile-cart-badge');
    const drawerCount = document.getElementById('drawer-items-count');

    [topBadge, heroBadge, mobileBadge].forEach(badge => {
      if (badge) {
        badge.textContent = cartQuantity;
        badge.classList.add('bump');
        setTimeout(() => badge.classList.remove('bump'), 300);
      }
    });

    if (drawerCount) drawerCount.textContent = cartQuantity;
    const drawerQtyVal = document.getElementById('drawer-qty-val');
    if (drawerQtyVal) drawerQtyVal.textContent = cartQuantity;

    const modalQtyVal = document.getElementById('qty-value');
    if (modalQtyVal) modalQtyVal.textContent = cartQuantity;
  }

  // ==========================================
  // CURRENCY SELECTOR
  // ==========================================
  const currencyToggleBtn = document.getElementById('currency-toggle-btn');
  const currencyDropdown = document.getElementById('currency-dropdown-menu');
  const activeCurrencyText = document.getElementById('active-currency-text');
  const currencyItems = document.querySelectorAll('.currency-option-item');

  if (currencyToggleBtn && currencyDropdown) {
    currencyToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currencyDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!currencyToggleBtn.contains(e.target) && !currencyDropdown.contains(e.target)) {
        currencyDropdown.classList.remove('active');
      }
    });
  }

  currencyItems.forEach(item => {
    item.addEventListener('click', () => {
      const selectedCurr = item.dataset.curr;
      if (selectedCurr && currencyMap[selectedCurr]) {
        activeCurrencyCode = selectedCurr;
        currencyItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        if (activeCurrencyText) {
          activeCurrencyText.textContent = `${selectedCurr} (${currencyMap[selectedCurr].symbol.trim()})`;
        }
        if (currencyDropdown) {
          currencyDropdown.classList.remove('active');
        }

        refreshPriceDisplays();
        showToast(`Currency updated to ${selectedCurr}`);
      }
    });
  });

  // Hero lang hotspot
  const langHotspot = document.getElementById('lang-selector') || document.getElementById('contact-lang-btn');
  if (langHotspot && currencyToggleBtn) {
    langHotspot.addEventListener('click', () => {
      currencyToggleBtn.click();
    });
  }

  // ==========================================
  // SEARCH OVERLAY MODAL
  // ==========================================
  const searchModal = document.getElementById('search-modal-backdrop');
  const navSearchBtn = document.getElementById('nav-search-btn');
  const heroSearchBtn = document.getElementById('btn-search-trigger');
  const closeSearchBtn = document.getElementById('close-search-modal');
  const searchInput = document.getElementById('search-keyword-input');
  const searchTagChips = document.querySelectorAll('.search-tag-chip');
  const searchResultItems = document.querySelectorAll('.search-result-item');

  function openSearchModal() {
    if (!searchModal) return;
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 150);
  }

  function closeSearchModal() {
    if (!searchModal) return;
    searchModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navSearchBtn) navSearchBtn.addEventListener('click', openSearchModal);
  if (heroSearchBtn) heroSearchBtn.addEventListener('click', openSearchModal);
  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearchModal);

  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearchModal();
    });
  }

  // Filter on typing
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      searchResultItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Click tag chips
  searchTagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.search;
      if (searchInput) {
        searchInput.value = tag;
        searchInput.dispatchEvent(new Event('input'));
      }
    });
  });

  // Click search result item
  searchResultItems.forEach(item => {
    item.addEventListener('click', () => {
      const color = item.dataset.color;
      if (color) {
        selectedColorName = color;
        const colorBtn = document.querySelector(`.color-option-btn[data-color="${color}"]`);
        if (colorBtn) colorBtn.click();
      }

      closeSearchModal();

      const target = document.getElementById('product-showcase');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = 'index.html#product-showcase';
      }
    });
  });

  // ==========================================
  // VIP MEMBER & ORDER TRACKING MODAL
  // ==========================================
  const accountModal = document.getElementById('account-modal-backdrop');
  const navAccountBtn = document.getElementById('nav-account-btn');
  const heroAccountBtn = document.getElementById('btn-account-trigger');
  const contactAccountBtn = document.getElementById('contact-account-btn');
  const closeAccountBtn = document.getElementById('close-account-modal');

  const tabVipSignin = document.getElementById('tab-vip-signin');
  const tabOrderTrack = document.getElementById('tab-order-track');
  const paneVipSignin = document.getElementById('pane-vip-signin');
  const paneOrderTrack = document.getElementById('pane-order-track');

  const vipAuthForm = document.getElementById('vip-auth-form');
  const trackShipmentForm = document.getElementById('track-shipment-form');
  const trackingResultBox = document.getElementById('tracking-result-box');

  function openAccountModal() {
    if (!accountModal) return;
    accountModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeAccountModal() {
    if (!accountModal) return;
    accountModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navAccountBtn) navAccountBtn.addEventListener('click', openAccountModal);
  if (heroAccountBtn) heroAccountBtn.addEventListener('click', openAccountModal);
  if (contactAccountBtn) contactAccountBtn.addEventListener('click', openAccountModal);
  if (closeAccountBtn) closeAccountBtn.addEventListener('click', closeAccountModal);

  if (accountModal) {
    accountModal.addEventListener('click', (e) => {
      if (e.target === accountModal) closeAccountModal();
    });
  }

  // Switch tabs
  if (tabVipSignin && tabOrderTrack) {
    tabVipSignin.addEventListener('click', () => {
      tabVipSignin.classList.add('active');
      tabOrderTrack.classList.remove('active');
      if (paneVipSignin) paneVipSignin.style.display = 'block';
      if (paneOrderTrack) paneOrderTrack.style.display = 'none';
    });

    tabOrderTrack.addEventListener('click', () => {
      tabOrderTrack.classList.add('active');
      tabVipSignin.classList.remove('active');
      if (paneVipSignin) paneVipSignin.style.display = 'none';
      if (paneOrderTrack) paneOrderTrack.style.display = 'block';
    });
  }

  // VIP sign in submit
  if (vipAuthForm) {
    vipAuthForm.addEventListener('submit', (e) => {
      e.preventDefault();
      promoDiscountPercent = 10;
      refreshPriceDisplays();
      showToast('Welcome VIP Member! 10% discount activated (Code: CHIC10)');
      setTimeout(() => closeAccountModal(), 1200);
    });
  }

  // Order tracking submit
  if (trackShipmentForm) {
    trackShipmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const refInput = document.getElementById('track-shipment-id');
      const refVal = refInput ? refInput.value.trim() : '#CS-98421';
      if (trackingResultBox) {
        trackingResultBox.style.display = 'block';
        showToast(`Tracking status retrieved for ${refVal}`);
      }
    });
  }

  // ==========================================
  // CART SLIDE-OUT DRAWER
  // ==========================================
  const cartDrawer = document.getElementById('cart-drawer-overlay');
  const navCartBtn = document.getElementById('nav-cart-btn');
  const heroCartBtn = document.getElementById('btn-cart-trigger');
  const mobileCartBtn = document.getElementById('mobile-cart-trigger');
  const closeCartDrawerBtn = document.getElementById('close-cart-drawer-btn');
  const cartDrawerBackdrop = document.getElementById('cart-drawer-backdrop');

  const drawerMinusBtn = document.getElementById('drawer-minus-btn');
  const drawerPlusBtn = document.getElementById('drawer-plus-btn');
  const drawerRemoveBtn = document.getElementById('drawer-remove-item-btn');
  const drawerPromoBtn = document.getElementById('drawer-promo-apply-btn');
  const drawerPromoInput = document.getElementById('drawer-promo-input');
  const drawerPromoMsg = document.getElementById('drawer-promo-msg');
  const drawerCheckoutBtn = document.getElementById('drawer-checkout-btn');

  function openCartDrawer() {
    if (!cartDrawer) return;
    refreshPriceDisplays();
    refreshCartBadges();
    cartDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navCartBtn) navCartBtn.addEventListener('click', openCartDrawer);
  if (heroCartBtn) heroCartBtn.addEventListener('click', openCartDrawer);
  if (mobileCartBtn) mobileCartBtn.addEventListener('click', openCartDrawer);
  if (closeCartDrawerBtn) closeCartDrawerBtn.addEventListener('click', closeCartDrawer);
  if (cartDrawerBackdrop) cartDrawerBackdrop.addEventListener('click', closeCartDrawer);

  // Stepper inside drawer
  if (drawerMinusBtn) {
    drawerMinusBtn.addEventListener('click', () => {
      if (cartQuantity > 1) {
        cartQuantity--;
        refreshCartBadges();
        refreshPriceDisplays();
      }
    });
  }

  if (drawerPlusBtn) {
    drawerPlusBtn.addEventListener('click', () => {
      if (cartQuantity < 10) {
        cartQuantity++;
        refreshCartBadges();
        refreshPriceDisplays();
      }
    });
  }

  if (drawerRemoveBtn) {
    drawerRemoveBtn.addEventListener('click', () => {
      showToast('Minimum order is 1 signature tote. Quantity set to 1.');
      cartQuantity = 1;
      refreshCartBadges();
      refreshPriceDisplays();
    });
  }

  // Promo code
  if (drawerPromoBtn && drawerPromoInput) {
    drawerPromoBtn.addEventListener('click', () => {
      const code = drawerPromoInput.value.trim().toUpperCase();
      if (code === 'CHIC10') {
        promoDiscountPercent = 10;
        refreshPriceDisplays();
        if (drawerPromoMsg) {
          drawerPromoMsg.style.display = 'block';
          drawerPromoMsg.textContent = '✓ 10% VIP Discount Applied!';
        }
        showToast('Promo code CHIC10 applied: 10% OFF');
      } else if (code) {
        showToast('Invalid code. Use CHIC10 for 10% VIP discount.');
      }
    });
  }

  // Cart Proceed to Checkout -> Opens Order Modal
  if (drawerCheckoutBtn) {
    drawerCheckoutBtn.addEventListener('click', () => {
      closeCartDrawer();
      openOrderModal();
    });
  }

  // ==========================================
  // CRAFTSMANSHIP STORY MODAL
  // ==========================================
  const craftsmanshipModal = document.getElementById('craftsmanship-modal-backdrop');
  const navCraftBtn = document.getElementById('nav-craftsmanship-btn');
  const mobileCraftLink = document.getElementById('mobile-craft-link');
  const closeCraftBtn = document.getElementById('close-craftsmanship-modal');
  const btnCraftShop = document.getElementById('btn-craftsmanship-shop');

  function openCraftsmanshipModal() {
    if (!craftsmanshipModal) return;
    craftsmanshipModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCraftsmanshipModal() {
    if (!craftsmanshipModal) return;
    craftsmanshipModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (navCraftBtn) navCraftBtn.addEventListener('click', openCraftsmanshipModal);
  if (mobileCraftLink) mobileCraftLink.addEventListener('click', () => {
    closeMobileNav();
    openCraftsmanshipModal();
  });
  if (closeCraftBtn) closeCraftBtn.addEventListener('click', closeCraftsmanshipModal);

  if (craftsmanshipModal) {
    craftsmanshipModal.addEventListener('click', (e) => {
      if (e.target === craftsmanshipModal) closeCraftsmanshipModal();
    });
  }

  if (btnCraftShop) {
    btnCraftShop.addEventListener('click', () => {
      closeCraftsmanshipModal();
      const showcase = document.getElementById('product-showcase');
      if (showcase) {
        showcase.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ==========================================
  // MOBILE NAVIGATION DRAWER
  // ==========================================
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileHamburgerBtn = document.getElementById('mobile-hamburger-btn');
  const closeMobileNavBtn = document.getElementById('close-mobile-nav-btn');
  const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
  const mobileDrawerOrderBtn = document.getElementById('mobile-drawer-order-btn');

  function openMobileNav() {
    if (!mobileNavDrawer) return;
    mobileNavDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (!mobileNavDrawer) return;
    mobileNavDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileHamburgerBtn) mobileHamburgerBtn.addEventListener('click', openMobileNav);
  if (closeMobileNavBtn) closeMobileNavBtn.addEventListener('click', closeMobileNav);
  if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeMobileNav);

  if (mobileDrawerOrderBtn) {
    mobileDrawerOrderBtn.addEventListener('click', () => {
      closeMobileNav();
      openOrderModal();
    });
  }

  // ==========================================
  // TOP BAR ORDER CTA BUTTON
  // ==========================================
  const navOrderCtaBtn = document.getElementById('nav-order-cta-btn');
  if (navOrderCtaBtn) {
    navOrderCtaBtn.addEventListener('click', () => {
      openOrderModal();
    });
  }

  // ==========================================
  // MAIN PRODUCT GALLERY & THUMBNAILS (index.html)
  // ==========================================
  const mainProductImg = document.getElementById('main-product-image');
  const thumbItems = document.querySelectorAll('.thumb-item');
  const galleryDots = document.querySelectorAll('.gallery-dot');
  const galleryPrev = document.getElementById('gallery-prev');
  const galleryNext = document.getElementById('gallery-next');

  const galleryList = [
    { src: 'assets/images/bag-front.jpg', title: 'Cognac Tan - Front View' },
    { src: 'assets/images/bag-side.jpg', title: 'Side Profile' },
    { src: 'assets/images/bag-colors.jpg', title: 'Both Color Options' },
    { src: 'assets/images/bag-stitch-detail.jpg', title: 'Stitching Detail' },
    { src: 'assets/images/bag-interior-pocket.jpg', title: 'Interior Zipper Pocket' }
  ];
  let currentGalleryIdx = 0;

  function setGalleryImage(idx) {
    if (!mainProductImg) return;
    if (idx < 0) idx = galleryList.length - 1;
    if (idx >= galleryList.length) idx = 0;
    currentGalleryIdx = idx;

    mainProductImg.style.opacity = '0.35';
    setTimeout(() => {
      mainProductImg.src = galleryList[currentGalleryIdx].src;
      mainProductImg.style.opacity = '1';
    }, 120);

    thumbItems.forEach((t, i) => {
      if (i === currentGalleryIdx) t.classList.add('active');
      else t.classList.remove('active');
    });

    galleryDots.forEach((d, i) => {
      if (i === currentGalleryIdx) d.classList.add('active');
      else d.classList.remove('active');
    });
  }

  thumbItems.forEach(t => {
    t.addEventListener('click', () => {
      const idx = parseInt(t.dataset.index, 10);
      setGalleryImage(idx);
    });
  });

  galleryDots.forEach(d => {
    d.addEventListener('click', () => {
      const idx = parseInt(d.dataset.index, 10);
      setGalleryImage(idx);
    });
  });

  if (galleryPrev) {
    galleryPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      setGalleryImage(currentGalleryIdx - 1);
    });
  }

  if (galleryNext) {
    galleryNext.addEventListener('click', (e) => {
      e.stopPropagation();
      setGalleryImage(currentGalleryIdx + 1);
    });
  }

  // Color Swatches Interactivity
  const colorSwatchBtns = document.querySelectorAll('.color-swatch-btn');
  const activeColorName = document.getElementById('active-color-name');
  colorSwatchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorSwatchBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const colorName = btn.dataset.color;
      const imgIdx = parseInt(btn.dataset.imgIndex, 10);
      if (activeColorName && colorName) {
        activeColorName.textContent = colorName;
      }
      if (!isNaN(imgIdx)) {
        setGalleryImage(imgIdx);
      }
    });
  });

  // ==========================================
  // BOTTOM 6 DETAILED VIEWS STRIP (RIGHT TO LEFT)
  // ==========================================
  const detailCards = document.querySelectorAll('.detail-view-card');
  detailCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.dataset.img;
      const title = card.dataset.title || 'Detail View';
      if (!imgSrc) return;

      if (mainProductImg) {
        mainProductImg.style.opacity = '0.35';
        setTimeout(() => {
          mainProductImg.src = imgSrc;
          mainProductImg.style.opacity = '1';
        }, 120);

        // Highlight matching thumbnail if exists
        let matchIdx = -1;
        thumbItems.forEach((t, idx) => {
          if (t.dataset.img === imgSrc) {
            matchIdx = idx;
            t.classList.add('active');
          } else {
            t.classList.remove('active');
          }
        });

        // Smooth scroll up to showcase if viewer is off screen
        const showcaseBox = document.getElementById('product-order');
        if (showcaseBox) {
          const rect = showcaseBox.getBoundingClientRect();
          if (rect.top < -50 || rect.top > window.innerHeight) {
            showcaseBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }

      showToast(`Selected view: ${title}`);
    });
  });

  // ==========================================
  // HD IMAGE LIGHTBOX MODAL
  // ==========================================
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeLightboxBtn = document.getElementById('close-lightbox-btn');

  function openLightbox(src) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mainProductImg) {
    mainProductImg.addEventListener('click', () => {
      openLightbox(mainProductImg.src);
    });
  }

  if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // ==========================================
  // ORDER CHECKOUT MODAL
  // ==========================================
  const orderModal = document.getElementById('order-modal-overlay');
  const openOrderBtn = document.getElementById('open-order-modal-btn');
  const closeOrderBtn = document.getElementById('close-order-modal-btn');
  const orderFormContainer = document.getElementById('order-form-container');
  const orderSuccessPane = document.getElementById('order-success-pane');
  const orderForm = document.getElementById('order-form');
  const btnDoneOrder = document.getElementById('btn-done-order');
  const modalBagThumb = document.getElementById('modal-bag-thumb');

  const colorOptions = document.querySelectorAll('.color-option-btn');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');

  function openOrderModal() {
    if (!orderModal) return;
    refreshPriceDisplays();
    refreshCartBadges();
    if (orderFormContainer) orderFormContainer.style.display = 'block';
    if (orderSuccessPane) orderSuccessPane.style.display = 'none';
    orderModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeOrderModal() {
    if (!orderModal) return;
    orderModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (openOrderBtn) openOrderBtn.addEventListener('click', openOrderModal);
  if (closeOrderBtn) closeOrderBtn.addEventListener('click', closeOrderModal);

  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) closeOrderModal();
    });
  }

  // Color selection
  colorOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      colorOptions.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColorName = btn.dataset.color || 'Cognac Tan';
      selectedColorImage = btn.dataset.img || 'assets/images/bag-front.jpg';

      if (modalBagThumb) modalBagThumb.src = selectedColorImage;
      const drawerImg = document.getElementById('drawer-product-img');
      if (drawerImg) drawerImg.src = selectedColorImage;
      const drawerColor = document.getElementById('drawer-product-color');
      if (drawerColor) drawerColor.textContent = selectedColorName;

      // Sync with main image if on index
      if (mainProductImg && selectedColorImage) {
        mainProductImg.src = selectedColorImage;
      }

      showToast(`Selected Color: ${selectedColorName}`);
    });
  });

  // Modal quantity +/-
  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => {
      if (cartQuantity > 1) {
        cartQuantity--;
        refreshCartBadges();
        refreshPriceDisplays();
      }
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => {
      if (cartQuantity < 10) {
        cartQuantity++;
        refreshCartBadges();
        refreshPriceDisplays();
      }
    });
  }

  // Handle Order Submit
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const orderId = '#CS-' + Math.floor(10000 + Math.random() * 90000);
      const successRef = document.getElementById('success-order-id');
      if (successRef) successRef.textContent = orderId;

      if (orderFormContainer) orderFormContainer.style.display = 'none';
      if (orderSuccessPane) orderSuccessPane.style.display = 'block';

      refreshCartBadges();
      showToast(`Order ${orderId} confirmed successfully!`);
    });
  }

  if (btnDoneOrder) {
    btnDoneOrder.addEventListener('click', () => {
      closeOrderModal();
    });
  }

  // ==========================================
  // CONTACT PAGE INTERACTIVE FORMS
  // ==========================================
  const desktopContactForm = document.getElementById('desktop-contact-form');
  if (desktopContactForm) {
    desktopContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your message has been sent to our concierge.');
      desktopContactForm.reset();
    });
  }

  const mobileContactForm = document.getElementById('mobile-contact-form');
  if (mobileContactForm) {
    mobileContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your message has been sent to our concierge.');
      mobileContactForm.reset();
    });
  }

  // Newsletter
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (newsletterEmail && newsletterEmail.value.trim()) {
        newsletterEmail.value = '';
        showToast('Subscribed! 10% VIP coupon sent to your inbox.');
      }
    });
  }

  // Hero Carousel Prev / Next Hotspots (Lookbook slide demo)
  const heroPrev = document.getElementById('hero-prev');
  const heroNext = document.getElementById('hero-next');
  if (heroPrev) {
    heroPrev.addEventListener('click', () => {
      showToast('Lookbook: Handcrafted Elegance in Natural Light');
    });
  }
  if (heroNext) {
    heroNext.addEventListener('click', () => {
      showToast('Lookbook: Modern Architecture & ChicSac Tote');
    });
  }

  // Smooth scroll for hash links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Initial Price & Badge Setup
  refreshPriceDisplays();
  refreshCartBadges();
});
