/**
 * Zero Biryani - Main Application Logic
 * Interactive shopping cart, live ordering, table reservation,
 * reviews submission, order tracking, and kitchen/staff console.
 */

(function() {
  'use strict';

  // Initial Seed Dishes for instant synchronous rendering
  const DEFAULT_DISHES = [
    { id: 1, name: "Signature Chicken Biryani", category: "biryani", price: 15.99, description: "Fragrant aged basmati rice layered with spiced marinated chicken, saffron, and golden fried onions.", image: "assets/images/hero-biryani.png", badge: "Popular", spice_level: "Medium", serves: "Matka Dum Portioned", is_popular: 1 },
    { id: 2, name: "Mutton Biryani", category: "biryani", price: 18.99, description: "Rich, tender slow-cooked bone-in mutton with aromatic saffron rice and whole fragrant garam masala.", image: "assets/images/hero-biryani.png", badge: "Signature", spice_level: "Medium", serves: "4-Hour Dum Pukht", is_popular: 1 },
    { id: 3, name: "Karachi Beef Biryani", category: "biryani", price: 16.99, description: "Deep, savory spiced beef layered in traditional Karachi-style dum pot with seasoned aloo and dried plum hints.", image: "assets/images/hero-biryani.png", badge: "Karachi Spicy", spice_level: "Karachi Spicy", serves: "Dum Sealed Pot", is_popular: 0 },
    { id: 4, name: "Chicken Karahi", category: "karahi", price: 21.50, description: "Wok-cooked chicken in freshly pounded tomatoes, ginger juliennes, green chilies, and freshly cracked black pepper.", image: "assets/images/chicken-karahi.png", badge: "Chef Special", spice_level: "Medium", serves: "Cast Iron Wok", is_popular: 1 },
    { id: 5, name: "Mutton Karahi", category: "karahi", price: 26.00, description: "Succulent baby mutton simmered in cast iron karahi with crushed garlic, whole coriander, and traditional Lahori spices.", image: "assets/images/chicken-karahi.png", badge: "Desi Ghee", spice_level: "Karachi Spicy", serves: "Desi Ghee Finish", is_popular: 0 },
    { id: 6, name: "Charcoal Chicken Tikka", category: "bbq", price: 12.50, description: "Smoky, char-grilled chicken quarters marinated in Kashmiri red chili, cultured yogurt, and roasted ground spices.", image: "assets/images/bbq-platter.png", badge: "Smoky", spice_level: "Mild", serves: "Open Charcoal Pit", is_popular: 0 },
    { id: 7, name: "Seekh Kabab", category: "bbq", price: 13.99, description: "Melt-in-mouth minced beef and lamb skewers with fresh mint, coriander, ginger, and slow-roasted cumin.", image: "assets/images/bbq-platter.png", badge: "Popular", spice_level: "Medium", serves: "4 Skewers", is_popular: 1 },
    { id: 8, name: "Royal Chicken Handi", category: "karahi", price: 19.99, description: "Silky boneless chicken simmered in rich cashew and cream gravy in a traditional earthen clay pot.", image: "assets/images/chicken-karahi.png", badge: "Mild Creamy", spice_level: "Mild", serves: "Clay Pot Slow Cooked", is_popular: 0 },
    { id: 9, name: "Mixed BBQ Platter", category: "bbq", price: 34.50, description: "Generous assortment of Seekh Kababs, Chicken Tikka boti, Malai boti, served with mint chutney and warm naan.", image: "assets/images/bbq-platter.png", badge: "Feast", spice_level: "Medium", serves: "Serves 3-4", is_popular: 1 },
    { id: 10, name: "Garlic & Fresh Naan", category: "sides", price: 3.99, description: "Clay oven baked flatbreads brushed with clarified desi ghee, minced fresh garlic, and garden cilantro.", image: "assets/images/takeaway-box.png", badge: "Fresh Baked", spice_level: "Mild", serves: "Clay Oven Fresh", is_popular: 0 },
    { id: 11, name: "Fresh Raita & Kachumber Salad", category: "sides", price: 4.50, description: "Cooling roasted cumin and mint whipped yogurt accompanied by diced crisp cucumbers, red onions, and lemon.", image: "assets/images/takeaway-box.png", badge: "Cooling", spice_level: "Mild", serves: "Vegetarian Refresh", is_popular: 0 },
    { id: 12, name: "Gulab Jamun with Saffron Rabri", category: "sides", price: 6.50, description: "Warm golden dumplings steeped in cardamom sugar syrup, topped with rich thickened saffron rabri milk.", image: "assets/images/takeaway-box.png", badge: "Sweet", spice_level: "Mild", serves: "Royal Dessert", is_popular: 0 }
  ];

  // State
  const state = {
    dishes: [...DEFAULT_DISHES],
    cart: [],
    currentCategory: 'all',
    searchQuery: '',
    promoCode: null,
    discountPercent: 0,
    orderType: 'delivery',
    selectedDishForModal: null,
    currentTrackingOrder: null
  };

  // DOM Elements
  let els = {};

  function initElements() {
    els = {
      // Cart
      cartBadgeNav: document.getElementById('cart-badge-nav'),
      cartBadgeFloating: document.getElementById('cart-badge-floating'),
      cartFloatingBtn: document.getElementById('cart-floating-btn'),
      cartDrawer: document.getElementById('cart-drawer'),
      cartItemsList: document.getElementById('cart-items-list'),
      cartSubtotal: document.getElementById('cart-subtotal'),
      cartDiscountRow: document.getElementById('cart-discount-row'),
      cartDiscountVal: document.getElementById('cart-discount-val'),
      cartDeliveryFee: document.getElementById('cart-delivery-fee'),
      cartTax: document.getElementById('cart-tax'),
      cartTotal: document.getElementById('cart-total'),
      promoInput: document.getElementById('promo-input'),
      applyPromoBtn: document.getElementById('apply-promo-btn'),
      promoMessage: document.getElementById('promo-message'),
      checkoutBtn: document.getElementById('checkout-btn'),
      closeCartBtn: document.getElementById('close-cart-btn'),
      
      // Dishes & Filter
      dishesGrid: document.getElementById('dishes-grid'),
      filterButtons: document.querySelectorAll('.menu-tab-btn'),
      dishSearchInput: document.getElementById('dish-search-input'),
      
      // Dish Customizer Modal
      dishModal: document.getElementById('dish-modal'),
      dishModalImage: document.getElementById('dish-modal-image'),
      dishModalTitle: document.getElementById('dish-modal-title'),
      dishModalDesc: document.getElementById('dish-modal-desc'),
      dishModalPrice: document.getElementById('dish-modal-price'),
      dishModalSpice: document.getElementById('dish-modal-spice'),
      dishModalNotes: document.getElementById('dish-modal-notes'),
      dishModalQty: document.getElementById('dish-modal-qty'),
      dishModalAddBtn: document.getElementById('dish-modal-add-btn'),
      closeDishModalBtn: document.getElementById('close-dish-modal-btn'),

      // Checkout Modal
      checkoutModal: document.getElementById('checkout-modal'),
      closeCheckoutBtn: document.getElementById('close-checkout-btn'),
      checkoutForm: document.getElementById('checkout-form'),
      orderTypeSelect: document.getElementById('order-type-select'),
      deliveryAddressGroup: document.getElementById('delivery-address-group'),
      tableNumberGroup: document.getElementById('table-number-group'),
      checkoutSubtotal: document.getElementById('checkout-subtotal'),
      checkoutDeliveryFee: document.getElementById('checkout-delivery-fee'),
      checkoutDiscount: document.getElementById('checkout-discount'),
      checkoutTax: document.getElementById('checkout-tax'),
      checkoutTotal: document.getElementById('checkout-total'),

      // Order Success Modal
      orderSuccessModal: document.getElementById('order-success-modal'),
      successOrderNumber: document.getElementById('success-order-number'),
      successOrderTotal: document.getElementById('success-order-total'),
      trackOrderBtn: document.getElementById('track-order-btn'),
      closeSuccessBtn: document.getElementById('close-success-btn'),

      // Order Tracker Modal
      trackerModal: document.getElementById('tracker-modal'),
      closeTrackerBtn: document.getElementById('close-tracker-btn'),
      trackerOrderNum: document.getElementById('tracker-order-num'),
      trackerStatusBadge: document.getElementById('tracker-status-badge'),
      trackerTimeEst: document.getElementById('tracker-time-est'),
      trackerItemsSummary: document.getElementById('tracker-items-summary'),

      // Reservation Form & Confirmation
      reservationForm: document.getElementById('reservation-form'),
      resSuccessModal: document.getElementById('res-success-modal'),
      resCodeDisplay: document.getElementById('res-code-display'),
      resDetailsDisplay: document.getElementById('res-details-display'),
      closeResSuccessBtn: document.getElementById('close-res-success-btn'),

      // Reviews
      reviewsGrid: document.getElementById('reviews-grid'),
      writeReviewBtn: document.getElementById('write-review-btn'),
      reviewModal: document.getElementById('review-modal'),
      closeReviewModalBtn: document.getElementById('close-review-modal-btn'),
      reviewForm: document.getElementById('review-form'),
      reviewRatingDisplay: document.getElementById('review-rating-display'),

      // Contact Form
      contactForm: document.getElementById('contact-form'),

      // Admin Modal
      adminModal: document.getElementById('admin-modal'),
      adminToggleBtn: document.getElementById('admin-toggle-btn'),
      closeAdminBtn: document.getElementById('close-admin-btn'),
      adminOrdersList: document.getElementById('admin-orders-list'),
      adminResList: document.getElementById('admin-res-list'),
      adminReviewsList: document.getElementById('admin-reviews-list'),
      adminStatsGrid: document.getElementById('admin-stats-grid'),
      adminTabs: document.querySelectorAll('.admin-tab-btn'),

      // Mobile Nav
      mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
      mobileNavMenu: document.getElementById('mobile-nav-menu')
    };
  }

  // Toast Notification System
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    
    let icon = 'check_circle';
    if (type === 'error') icon = 'error';
    if (type === 'info') icon = 'info';

    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px] text-primary-fixed">${icon}</span>
        <span class="font-body-md text-[14px]">${message}</span>
      </div>
      <button class="text-outline-variant hover:text-surface-bright transition-colors">
        <span class="material-symbols-outlined text-[16px]">close</span>
      </button>
    `;

    toast.querySelector('button').addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });

    container.appendChild(toast);
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  // Load Saved Cart
  function loadCartFromStorage() {
    try {
      const saved = localStorage.getItem('zb_cart');
      if (saved) {
        state.cart = JSON.parse(saved);
        updateCartUI();
      }
    } catch(e) {}
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem('zb_cart', JSON.stringify(state.cart));
    } catch(e) {}
  }

  // CART LOGIC
  function addToCart(dish, quantity = 1, spice = null, notes = '') {
    const spiceLevel = spice || dish.spice_level || 'Medium';
    const existingIndex = state.cart.findIndex(item => item.id === dish.id && item.spice === spiceLevel && item.notes === notes);

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += quantity;
    } else {
      state.cart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        category: dish.category,
        image: dish.image,
        serves: dish.serves,
        spice: spiceLevel,
        notes: notes,
        quantity: quantity
      });
    }

    saveCartToStorage();
    updateCartUI();
    showToast(`Added <strong>${dish.name}</strong> to your order!`, 'success');
    animateCartBounce();
  }

  function updateCartItemQty(index, newQty) {
    if (newQty <= 0) {
      state.cart.splice(index, 1);
    } else {
      state.cart[index].quantity = newQty;
    }
    saveCartToStorage();
    updateCartUI();
  }

  function removeCartItem(index) {
    const removed = state.cart[index];
    state.cart.splice(index, 1);
    saveCartToStorage();
    updateCartUI();
    showToast(`Removed ${removed.name} from cart`, 'info');
  }

  function animateCartBounce() {
    if (els.cartBadgeNav) {
      els.cartBadgeNav.classList.add('badge-bounce');
      setTimeout(() => els.cartBadgeNav.classList.remove('badge-bounce'), 400);
    }
    if (els.cartBadgeFloating) {
      els.cartBadgeFloating.classList.add('badge-bounce');
      setTimeout(() => els.cartBadgeFloating.classList.remove('badge-bounce'), 400);
    }
  }

  function calculateCartTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * (state.discountPercent / 100);
    const deliveryFee = state.orderType === 'delivery' && subtotal > 0 ? 3.50 : 0.00;
    const tax = (subtotal - discount) * 0.08; // 8% sales tax
    const total = Math.max(0, subtotal - discount + deliveryFee + tax);

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      count: state.cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  function updateCartUI() {
    const totals = calculateCartTotals();

    // Badges
    if (els.cartBadgeNav) {
      els.cartBadgeNav.textContent = totals.count;
      els.cartBadgeNav.classList.toggle('hidden', totals.count === 0);
    }
    if (els.cartBadgeFloating) {
      els.cartBadgeFloating.textContent = totals.count;
    }
    if (els.cartFloatingBtn) {
      els.cartFloatingBtn.classList.toggle('hidden', totals.count === 0);
      const totalSpan = els.cartFloatingBtn.querySelector('.cart-floating-total');
      if (totalSpan) totalSpan.textContent = `$${totals.total.toFixed(2)}`;
    }

    // Drawer Items List
    if (els.cartItemsList) {
      if (state.cart.length === 0) {
        els.cartItemsList.innerHTML = `
          <div class="py-12 flex flex-col items-center justify-center text-center text-outline-variant">
            <span class="material-symbols-outlined text-[48px] text-outline-variant mb-3">shopping_bag</span>
            <p class="font-headline-md text-headline-md text-on-surface">Your Handi is Empty</p>
            <p class="font-body-md text-body-md mt-1">Explore our aromatic dum pukht biryani & live grill specials.</p>
            <a href="#menu" onclick="window.App.toggleCart(false)" class="mt-4 px-space-md py-2 bg-primary text-on-primary font-label-caps text-label-caps uppercase rounded-lg hover:bg-primary-container transition-colors">Browse Menu</a>
          </div>
        `;
        if (els.checkoutBtn) els.checkoutBtn.disabled = true;
      } else {
        els.cartItemsList.innerHTML = state.cart.map((item, idx) => `
          <div class="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl mb-3 shadow-sm border border-outline-variant/10">
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover">
            <div class="flex-1 min-w-0">
              <h4 class="font-headline-md text-[16px] text-on-surface truncate">${item.name}</h4>
              <p class="font-label-sm text-[12px] text-primary flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">local_fire_department</span> ${item.spice}
                ${item.notes ? ` • <span class="italic text-outline">${item.notes}</span>` : ''}
              </p>
              <span class="font-bold text-secondary text-[15px]">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-surface-container-highest rounded-lg px-1">
                <button onclick="window.App.updateCartQty(${idx}, ${item.quantity - 1})" class="w-7 h-7 flex items-center justify-center text-on-surface hover:text-primary transition-colors">
                  <span class="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <span class="font-bold text-[14px] w-6 text-center">${item.quantity}</span>
                <button onclick="window.App.updateCartQty(${idx}, ${item.quantity + 1})" class="w-7 h-7 flex items-center justify-center text-on-surface hover:text-primary transition-colors">
                  <span class="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>
              <button onclick="window.App.removeCartItem(${idx})" class="text-outline hover:text-error transition-colors p-1" title="Remove">
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        `).join('');

        if (els.checkoutBtn) els.checkoutBtn.disabled = false;
      }
    }

    // Totals in Drawer
    if (els.cartSubtotal) els.cartSubtotal.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (els.cartDeliveryFee) els.cartDeliveryFee.textContent = totals.deliveryFee > 0 ? `$${totals.deliveryFee.toFixed(2)}` : 'Free';
    if (els.cartTax) els.cartTax.textContent = `$${totals.tax.toFixed(2)}`;
    if (els.cartTotal) els.cartTotal.textContent = `$${totals.total.toFixed(2)}`;

    if (els.cartDiscountRow && els.cartDiscountVal) {
      if (totals.discount > 0) {
        els.cartDiscountRow.classList.remove('hidden');
        els.cartDiscountVal.textContent = `-$${totals.discount.toFixed(2)} (${state.discountPercent}%)`;
      } else {
        els.cartDiscountRow.classList.add('hidden');
      }
    }

    // Checkout Modal Totals
    if (els.checkoutSubtotal) els.checkoutSubtotal.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (els.checkoutDeliveryFee) els.checkoutDeliveryFee.textContent = totals.deliveryFee > 0 ? `$${totals.deliveryFee.toFixed(2)}` : 'Free';
    if (els.checkoutDiscount) els.checkoutDiscount.textContent = totals.discount > 0 ? `-$${totals.discount.toFixed(2)}` : '$0.00';
    if (els.checkoutTax) els.checkoutTax.textContent = `$${totals.tax.toFixed(2)}`;
    if (els.checkoutTotal) els.checkoutTotal.textContent = `$${totals.total.toFixed(2)}`;
  }

  function toggleCartDrawer(open) {
    if (!els.cartDrawer) return;
    if (open === undefined) {
      els.cartDrawer.classList.toggle('active');
    } else if (open) {
      els.cartDrawer.classList.add('active');
    } else {
      els.cartDrawer.classList.remove('active');
    }
  }

  // PROMO CODE
  function applyPromoCode() {
    const code = (els.promoInput.value || '').trim().toUpperCase();
    if (!code) return;

    if (code === 'DUM10' || code === 'ZERO10') {
      state.discountPercent = 10;
      state.promoCode = code;
      els.promoMessage.textContent = 'Promo applied! 10% discount added.';
      els.promoMessage.className = 'text-sm text-green-600 font-bold block mt-1';
      showToast('10% Discount applied with ' + code + '!', 'success');
    } else if (code === 'BIRYANI20' || code === 'HERITAGE20') {
      state.discountPercent = 20;
      state.promoCode = code;
      els.promoMessage.textContent = 'Special promo applied! 20% discount added.';
      els.promoMessage.className = 'text-sm text-green-600 font-bold block mt-1';
      showToast('20% Discount applied with ' + code + '!', 'success');
    } else {
      els.promoMessage.textContent = 'Invalid promo code. Try DUM10 or BIRYANI20';
      els.promoMessage.className = 'text-sm text-error font-bold block mt-1';
      showToast('Invalid coupon code', 'error');
    }
    updateCartUI();
  }

  // MENU RENDERING & FILTERING
  async function loadMenu() {
    try {
      const dishes = await window.DB.getMenu('all');
      state.dishes = dishes;
      renderDishes();
    } catch(e) {
      console.error("Failed to load menu", e);
    }
  }

  function renderDishes() {
    if (!els.dishesGrid) return;

    const filtered = state.dishes.filter(dish => {
      const matchesCategory = state.currentCategory === 'all' || dish.category === state.currentCategory;
      const matchesSearch = !state.searchQuery || 
        dish.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
        (dish.description && dish.description.toLowerCase().includes(state.searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      els.dishesGrid.innerHTML = `
        <div class="col-span-full py-16 text-center text-outline-variant">
          <span class="material-symbols-outlined text-[48px] mb-2">dinner_dining</span>
          <h3 class="font-headline-md text-headline-md text-on-surface">No matching dishes found</h3>
          <p class="font-body-md text-body-md">Try adjusting your search terms or filter selection.</p>
        </div>
      `;
      return;
    }

    els.dishesGrid.innerHTML = filtered.map(dish => `
      <div class="dish-item ${dish.category} bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group border border-outline-variant/10">
        <div class="relative h-56 overflow-hidden cursor-pointer" onclick="window.App.openDishModal(${dish.id})">
          <img alt="${dish.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${dish.image}">
          ${dish.badge ? `<span class="absolute top-3 left-3 bg-secondary text-on-secondary px-space-xs py-1 rounded font-label-caps text-label-caps uppercase tracking-wider shadow">${dish.badge}</span>` : ''}
          <span class="absolute bottom-3 right-3 bg-inverse-surface/85 backdrop-blur text-primary-fixed px-space-sm py-1 rounded font-headline-md text-headline-md shadow">$${dish.price.toFixed(2)}</span>
        </div>
        <div class="p-space-md flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <h3 class="font-headline-md text-headline-md text-on-surface cursor-pointer hover:text-primary transition-colors" onclick="window.App.openDishModal(${dish.id})">${dish.name}</h3>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant mt-space-2xs">${dish.description}</p>
          </div>
          <div class="mt-space-md pt-space-xs flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">local_dining</span> ${dish.serves || 'Chef Crafted'}
            </span>
            <div class="flex items-center gap-2">
              <button onclick="window.App.openDishModal(${dish.id})" class="p-1 text-outline hover:text-primary transition-colors" title="Customize">
                <span class="material-symbols-outlined text-[20px]">tune</span>
              </button>
              <button onclick="window.App.quickAddToCart(${dish.id})" class="px-space-md py-space-2xs bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-label-md text-label-md rounded transition-all flex items-center gap-1 shadow-sm btn-gold-glow">
                <span>Add</span>
                <span class="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // DISH CUSTOMIZER MODAL
  function openDishModal(dishId) {
    const dish = state.dishes.find(d => d.id === dishId);
    if (!dish) return;

    state.selectedDishForModal = dish;
    if (els.dishModalImage) els.dishModalImage.src = dish.image;
    if (els.dishModalTitle) els.dishModalTitle.textContent = dish.name;
    if (els.dishModalDesc) els.dishModalDesc.textContent = dish.description;
    if (els.dishModalPrice) els.dishModalPrice.textContent = `$${dish.price.toFixed(2)}`;
    if (els.dishModalQty) els.dishModalQty.value = 1;
    if (els.dishModalSpice) els.dishModalSpice.value = dish.spice_level || 'Medium';
    if (els.dishModalNotes) els.dishModalNotes.value = '';

    if (els.dishModal) {
      els.dishModal.classList.add('active');
    }
  }

  function closeDishModal() {
    if (els.dishModal) {
      els.dishModal.classList.remove('active');
    }
  }

  function submitDishModal() {
    if (!state.selectedDishForModal) return;
    const qty = parseInt(els.dishModalQty.value, 10) || 1;
    const spice = els.dishModalSpice.value;
    const notes = els.dishModalNotes.value.trim();

    addToCart(state.selectedDishForModal, qty, spice, notes);
    closeDishModal();
  }

  // CHECKOUT MODAL & ORDER SUBMISSION
  function openCheckoutModal() {
    if (state.cart.length === 0) {
      showToast('Your cart is empty! Add dishes to proceed.', 'error');
      return;
    }
    toggleCartDrawer(false);
    updateCartUI();
    if (els.checkoutModal) {
      els.checkoutModal.classList.add('active');
    }
  }

  function closeCheckoutModal() {
    if (els.checkoutModal) {
      els.checkoutModal.classList.remove('active');
    }
  }

  async function submitCheckout(e) {
    e.preventDefault();
    const formData = new FormData(els.checkoutForm);
    const orderType = formData.get('order_type') || 'delivery';
    const customerName = formData.get('customer_name');
    const customerPhone = formData.get('customer_phone');
    const deliveryAddress = formData.get('delivery_address') || '';
    const tableNumber = formData.get('table_number') || '';
    const notes = formData.get('notes') || '';
    const paymentMethod = formData.get('payment_method') || 'cash';

    if (!customerName || !customerPhone) {
      showToast('Please provide your name and contact phone number.', 'error');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      showToast('Please enter your delivery address.', 'error');
      return;
    }

    if (orderType === 'dine_in' && !tableNumber.trim()) {
      showToast('Please provide your table number.', 'error');
      return;
    }

    const totals = calculateCartTotals();

    const orderPayload = {
      order_type: orderType,
      table_number: tableNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      notes: notes,
      payment_method: paymentMethod,
      items: state.cart,
      subtotal: totals.subtotal,
      discount: totals.discount,
      delivery_fee: totals.deliveryFee,
      tax: totals.tax,
      total: totals.total
    };

    try {
      const placed = await window.DB.placeOrder(orderPayload);
      closeCheckoutModal();

      // Clear cart
      state.cart = [];
      state.promoCode = null;
      state.discountPercent = 0;
      saveCartToStorage();
      updateCartUI();

      // Show Success Modal
      state.currentTrackingOrder = placed;
      if (els.successOrderNumber) els.successOrderNumber.textContent = placed.order_number;
      if (els.successOrderTotal) els.successOrderTotal.textContent = `$${placed.total.toFixed(2)}`;
      if (els.orderSuccessModal) els.orderSuccessModal.classList.add('active');

      showToast(`Order ${placed.order_number} confirmed! Cooking in sealed handis now.`, 'success');
    } catch(err) {
      console.error(err);
      showToast('Failed to place order. Please try again.', 'error');
    }
  }

  // ORDER TRACKER
  async function openTracker(orderNumber) {
    const orderNum = orderNumber || (state.currentTrackingOrder ? state.currentTrackingOrder.order_number : null);
    if (!orderNum) return;

    if (els.orderSuccessModal) els.orderSuccessModal.classList.remove('active');

    try {
      const order = await window.DB.getOrder(orderNum);
      if (!order) {
        showToast('Order not found', 'error');
        return;
      }
      state.currentTrackingOrder = order;

      if (els.trackerOrderNum) els.trackerOrderNum.textContent = order.order_number;
      if (els.trackerStatusBadge) els.trackerStatusBadge.textContent = order.status;
      if (els.trackerTimeEst) {
        els.trackerTimeEst.textContent = order.status === 'Delivered' ? 'Delivered & Enjoyed' : 'Estimated: 30–35 Mins';
      }

      // Update tracker steps visually
      const steps = ['Received', 'In Dum Pukht', 'Ready / Out for Delivery', 'Delivered'];
      const currentIndex = steps.indexOf(order.status) > -1 ? steps.indexOf(order.status) : 1;

      document.querySelectorAll('.tracker-step').forEach((el, idx) => {
        const icon = el.querySelector('.step-icon');
        const text = el.querySelector('.step-text');
        if (idx <= currentIndex) {
          el.classList.add('text-primary');
          el.classList.remove('text-outline-variant');
          if (icon) icon.classList.add('bg-primary', 'text-on-primary');
        } else {
          el.classList.remove('text-primary');
          el.classList.add('text-outline-variant');
          if (icon) icon.classList.remove('bg-primary', 'text-on-primary');
        }
      });

      // Render items summary
      if (els.trackerItemsSummary) {
        const items = order.items || [];
        els.trackerItemsSummary.innerHTML = items.map(item => `
          <div class="flex justify-between text-sm py-1 border-b border-outline-variant/10">
            <span>${item.quantity}x ${item.name} (${item.spice || 'Medium'})</span>
            <span class="font-bold">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('');
      }

      if (els.trackerModal) els.trackerModal.classList.add('active');
    } catch(e) {
      console.error(e);
    }
  }

  // TABLE RESERVATION
  async function submitReservation(e) {
    e.preventDefault();
    const formData = new FormData(els.reservationForm);
    const customerName = formData.get('customer_name');
    const phone = formData.get('phone');
    const guests = formData.get('guests');
    const date = formData.get('date');
    const timeSlot = formData.get('time_slot');
    const seatingArea = formData.get('seating_area') || 'Main Dining';
    const specialRequests = formData.get('special_requests') || '';

    if (!customerName || !phone || !date) {
      showToast('Please fill in your name, contact phone, and reservation date.', 'error');
      return;
    }

    try {
      const res = await window.DB.bookReservation({
        customer_name: customerName,
        phone: phone,
        guests: guests,
        date: date,
        time_slot: timeSlot,
        seating_area: seatingArea,
        special_requests: specialRequests
      });

      if (els.resCodeDisplay) els.resCodeDisplay.textContent = res.res_code;
      if (els.resDetailsDisplay) {
        els.resDetailsDisplay.innerHTML = `
          <p><strong>Diner:</strong> ${res.customer_name}</p>
          <p><strong>Party Size:</strong> ${res.guests}</p>
          <p><strong>Date & Time:</strong> ${res.date} • ${res.time_slot}</p>
          <p><strong>Seating Area:</strong> ${res.seating_area || 'Main Dining'}</p>
        `;
      }

      if (els.resSuccessModal) els.resSuccessModal.classList.add('active');
      els.reservationForm.reset();
      showToast(`Table booked! Your reservation code is ${res.res_code}`, 'success');
    } catch(err) {
      console.error(err);
      showToast('Failed to book table. Please try again.', 'error');
    }
  }

  // REVIEWS SYSTEM
  async function loadReviews() {
    try {
      const data = await window.DB.getReviews();
      if (els.reviewsGrid && data.reviews) {
        els.reviewsGrid.innerHTML = data.reviews.map(r => `
          <div class="bg-surface-container-low p-space-xl rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-outline-variant/10">
            <div>
              <div class="flex items-center text-primary mb-space-sm">
                ${Array(r.rating).fill('<span class="material-symbols-outlined text-[18px]">star</span>').join('')}
              </div>
              <p class="font-body-lg text-body-lg text-on-surface italic">
                "${r.comment}"
              </p>
            </div>
            <div class="mt-space-lg pt-space-sm flex items-center gap-space-sm">
              <div class="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md flex items-center justify-center font-bold">${r.avatar_initials || 'ZB'}</div>
              <div>
                <h5 class="font-label-md text-label-md text-on-surface">${r.reviewer_name}</h5>
                <span class="font-label-sm text-label-sm text-outline">${r.diner_type || 'Verified Diner'}</span>
              </div>
            </div>
          </div>
        `).join('');
      }

      if (els.reviewRatingDisplay) {
        els.reviewRatingDisplay.textContent = `${data.average_rating} Rating • ${data.total_reviews}+ Verified Diners`;
      }
    } catch(e) {
      console.error("Error loading reviews", e);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    const formData = new FormData(els.reviewForm);
    const name = formData.get('reviewer_name');
    const rating = formData.get('rating') || 5;
    const comment = formData.get('comment');
    const dinerType = formData.get('diner_type') || 'Verified Diner';

    if (!name || !comment) {
      showToast('Please enter your name and review remarks.', 'error');
      return;
    }

    try {
      await window.DB.submitReview({
        reviewer_name: name,
        rating: parseInt(rating, 10),
        comment: comment,
        diner_type: dinerType
      });

      if (els.reviewModal) els.reviewModal.classList.remove('active');
      els.reviewForm.reset();
      showToast('Thank you! Your review is now live.', 'success');
      loadReviews();
    } catch(err) {
      console.error(err);
      showToast('Failed to post review. Please try again.', 'error');
    }
  }

  // CONTACT FORM
  async function submitContact(e) {
    e.preventDefault();
    const formData = new FormData(els.contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const message = formData.get('message');

    if (!name || !message) {
      showToast('Please fill in your name and message.', 'error');
      return;
    }

    try {
      await window.DB.sendInquiry({ name, email, phone, message });
      els.contactForm.reset();
      showToast('Message sent! Our head chef or catering manager will respond shortly.', 'success');
    } catch(e) {
      showToast('Failed to send message. Please call us directly.', 'error');
    }
  }

  // ADMIN DASHBOARD
  async function openAdminModal() {
    await refreshAdminData();
    if (els.adminModal) els.adminModal.classList.add('active');
  }

  async function refreshAdminData() {
    try {
      const stats = await window.DB.getStats();
      const orders = await window.DB.getOrders();
      const reservations = await window.DB.getReservations();
      const reviewData = await window.DB.getReviews();

      // Stats
      if (els.adminStatsGrid) {
        els.adminStatsGrid.innerHTML = `
          <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
            <span class="text-xs uppercase text-outline font-bold">Total Sales</span>
            <h3 class="text-2xl font-bold text-primary">$${stats.total_sales.toFixed(2)}</h3>
          </div>
          <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
            <span class="text-xs uppercase text-outline font-bold">Live Orders</span>
            <h3 class="text-2xl font-bold text-secondary">${stats.active_orders} Active</h3>
          </div>
          <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
            <span class="text-xs uppercase text-outline font-bold">Table Reservations</span>
            <h3 class="text-2xl font-bold text-on-surface">${stats.total_reservations} Booked</h3>
          </div>
          <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
            <span class="text-xs uppercase text-outline font-bold">Diner Rating</span>
            <h3 class="text-2xl font-bold text-primary-fixed-dim">★ ${stats.average_rating} (${stats.total_reviews})</h3>
          </div>
        `;
      }

      // Orders List
      if (els.adminOrdersList) {
        if (orders.length === 0) {
          els.adminOrdersList.innerHTML = '<p class="text-center py-6 text-outline">No orders placed yet.</p>';
        } else {
          els.adminOrdersList.innerHTML = orders.map(o => {
            const items = o.items || [];
            return `
              <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-primary text-base">${o.order_number}</span>
                    <span class="px-2 py-0.5 text-xs rounded bg-surface-container-highest uppercase">${o.order_type}</span>
                    <span class="text-xs text-outline">${o.created_at}</span>
                  </div>
                  <p class="text-sm font-semibold text-on-surface mt-1">${o.customer_name} • ${o.customer_phone}</p>
                  ${o.delivery_address ? `<p class="text-xs text-outline">${o.delivery_address}</p>` : ''}
                  ${o.table_number ? `<p class="text-xs text-secondary font-bold">Table: ${o.table_number}</p>` : ''}
                  <p class="text-xs text-on-surface-variant mt-1 font-mono">${items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-bold text-lg text-secondary">$${parseFloat(o.total).toFixed(2)}</span>
                  <select onchange="window.App.changeOrderStatus('${o.order_number}', this.value)" class="bg-surface-container-highest px-3 py-1.5 rounded-lg text-sm font-semibold text-on-surface focus:outline-none">
                    <option value="Received" ${o.status === 'Received' ? 'selected' : ''}>Received</option>
                    <option value="In Dum Pukht" ${o.status === 'In Dum Pukht' ? 'selected' : ''}>In Dum Pukht</option>
                    <option value="Ready / Out for Delivery" ${o.status === 'Ready / Out for Delivery' ? 'selected' : ''}>Ready / Out</option>
                    <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                  </select>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      // Reservations List
      if (els.adminResList) {
        if (reservations.length === 0) {
          els.adminResList.innerHTML = '<p class="text-center py-6 text-outline">No reservations yet.</p>';
        } else {
          els.adminResList.innerHTML = reservations.map(r => `
            <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex items-center justify-between">
              <div>
                <span class="font-bold text-primary">${r.res_code}</span>
                <h5 class="text-base font-semibold text-on-surface">${r.customer_name} (${r.guests})</h5>
                <p class="text-xs text-outline">${r.date} at ${r.time_slot} • ${r.seating_area || 'Main Dining'}</p>
                <p class="text-xs text-on-surface-variant">${r.phone} ${r.special_requests ? `• Note: ${r.special_requests}` : ''}</p>
              </div>
              <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">${r.status}</span>
            </div>
          `).join('');
        }
      }

      // Reviews List
      if (els.adminReviewsList) {
        els.adminReviewsList.innerHTML = reviewData.reviews.map(r => `
          <div class="p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 flex items-start justify-between">
            <div>
              <div class="flex items-center gap-1 text-primary">
                ${Array(r.rating).fill('★').join('')}
                <span class="text-xs text-outline ml-2">${r.created_at}</span>
              </div>
              <p class="text-sm italic text-on-surface mt-1">"${r.comment}"</p>
              <span class="text-xs font-bold text-on-surface-variant">— ${r.reviewer_name} (${r.diner_type || 'Verified'})</span>
            </div>
          </div>
        `).join('');
      }

    } catch(e) {
      console.error(e);
    }
  }

  async function changeOrderStatus(orderId, newStatus) {
    try {
      await window.DB.updateOrderStatus(orderId, newStatus);
      showToast(`Order ${orderId} updated to: ${newStatus}`, 'success');
      refreshAdminData();
    } catch(e) {
      showToast('Failed to update status', 'error');
    }
  }

  // EVENT LISTENERS BINDING
  function bindEvents() {
    // Menu Category Tabs
    if (els.filterButtons) {
      els.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          els.filterButtons.forEach(b => {
            b.classList.remove('bg-primary', 'text-on-primary');
            b.classList.add('bg-surface-container-high', 'text-on-surface');
          });
          btn.classList.remove('bg-surface-container-high', 'text-on-surface');
          btn.classList.add('bg-primary', 'text-on-primary');

          state.currentCategory = btn.getAttribute('data-filter') || 'all';
          renderDishes();
        });
      });
    }

    // Dish Search Input
    if (els.dishSearchInput) {
      els.dishSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderDishes();
      });
    }

    // Cart Drawer Toggle
    if (els.cartFloatingBtn) {
      els.cartFloatingBtn.addEventListener('click', () => toggleCartDrawer(true));
    }
    if (els.closeCartBtn) {
      els.closeCartBtn.addEventListener('click', () => toggleCartDrawer(false));
    }

    // Promo Code
    if (els.applyPromoBtn) {
      els.applyPromoBtn.addEventListener('click', applyPromoCode);
    }
    if (els.promoInput) {
      els.promoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyPromoCode();
        }
      });
    }

    // Checkout Modal
    if (els.checkoutBtn) {
      els.checkoutBtn.addEventListener('click', openCheckoutModal);
    }
    if (els.closeCheckoutBtn) {
      els.closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
    }
    if (els.checkoutForm) {
      els.checkoutForm.addEventListener('submit', submitCheckout);
    }

    // Order Type in Checkout Form
    if (els.orderTypeSelect) {
      els.orderTypeSelect.addEventListener('change', (e) => {
        state.orderType = e.target.value;
        if (state.orderType === 'delivery') {
          if (els.deliveryAddressGroup) els.deliveryAddressGroup.classList.remove('hidden');
          if (els.tableNumberGroup) els.tableNumberGroup.classList.add('hidden');
        } else if (state.orderType === 'dine_in') {
          if (els.deliveryAddressGroup) els.deliveryAddressGroup.classList.add('hidden');
          if (els.tableNumberGroup) els.tableNumberGroup.classList.remove('hidden');
        } else {
          // pickup
          if (els.deliveryAddressGroup) els.deliveryAddressGroup.classList.add('hidden');
          if (els.tableNumberGroup) els.tableNumberGroup.classList.add('hidden');
        }
        updateCartUI();
      });
    }

    // Dish Customizer Modal
    if (els.closeDishModalBtn) {
      els.dishModalAddBtn.addEventListener('click', submitDishModal);
      els.closeDishModalBtn.addEventListener('click', closeDishModal);
    }

    // Success & Tracker Modals
    if (els.closeSuccessBtn) {
      els.closeSuccessBtn.addEventListener('click', () => els.orderSuccessModal.classList.remove('active'));
    }
    if (els.trackOrderBtn) {
      els.trackOrderBtn.addEventListener('click', () => openTracker());
    }
    if (els.closeTrackerBtn) {
      els.closeTrackerBtn.addEventListener('click', () => els.trackerModal.classList.remove('active'));
    }

    // Table Reservation Form
    if (els.reservationForm) {
      els.reservationForm.addEventListener('submit', submitReservation);
    }
    if (els.closeResSuccessBtn) {
      els.closeResSuccessBtn.addEventListener('click', () => els.resSuccessModal.classList.remove('active'));
    }

    // Reviews Form & Modal
    if (els.writeReviewBtn) {
      els.writeReviewBtn.addEventListener('click', () => {
        if (els.reviewModal) els.reviewModal.classList.add('active');
      });
    }
    if (els.closeReviewModalBtn) {
      els.closeReviewModalBtn.addEventListener('click', () => {
        if (els.reviewModal) els.reviewModal.classList.remove('active');
      });
    }
    if (els.reviewForm) {
      els.reviewForm.addEventListener('submit', submitReview);
    }

    // Contact Form
    if (els.contactForm) {
      els.contactForm.addEventListener('submit', submitContact);
    }

    // Admin Dashboard
    if (els.adminToggleBtn) {
      els.adminToggleBtn.addEventListener('click', openAdminModal);
    }
    if (els.closeAdminBtn) {
      els.closeAdminBtn.addEventListener('click', () => els.adminModal.classList.remove('active'));
    }

    // Admin Tabs
    if (els.adminTabs) {
      els.adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          els.adminTabs.forEach(t => t.classList.remove('bg-primary', 'text-on-primary'));
          tab.classList.add('bg-primary', 'text-on-primary');

          const target = tab.getAttribute('data-tab');
          document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
          const activeContent = document.getElementById(`admin-tab-${target}`);
          if (activeContent) activeContent.classList.remove('hidden');
        });
      });
    }

    // Mobile Menu Toggle
    if (els.mobileMenuToggle && els.mobileNavMenu) {
      els.mobileMenuToggle.addEventListener('click', () => {
        els.mobileNavMenu.classList.toggle('hidden');
      });
    }

    // Close Modals on clicking outside or ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        toggleCartDrawer(false);
      }
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Date restriction on reservation input (cannot book in past)
    const resDateInput = document.getElementById('res-date-input');
    if (resDateInput) {
      const today = new Date().toISOString().split('T')[0];
      resDateInput.min = today;
      resDateInput.value = today;
    }
  }

  // Public API attached to window
  window.App = {
    init: async function() {
      initElements();
      bindEvents();
      loadCartFromStorage();
      renderDishes();
      try {
        await loadMenu();
        await loadReviews();
      } catch(e) {
        console.warn("Async load notice:", e);
      }
      console.log("Zero Biryani application initialized.");
    },
    toggleCart: toggleCartDrawer,
    quickAddToCart: function(dishId) {
      const dish = state.dishes.find(d => d.id === dishId);
      if (dish) addToCart(dish, 1);
    },
    updateCartQty: updateCartItemQty,
    removeCartItem: removeCartItem,
    openDishModal: openDishModal,
    openTracker: openTracker,
    openAdmin: openAdminModal,
    changeOrderStatus: changeOrderStatus,
    showToast: showToast
  };

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.App.init);
  } else {
    window.App.init();
  }

})();
