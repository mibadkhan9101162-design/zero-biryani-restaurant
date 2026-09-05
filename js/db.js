/**
 * Zero Biryani - Unified Data Layer
 * Automatically detects whether the Python SQLite REST API is available.
 * If server is available, performs full ACID queries on SQLite database.
 * If running offline / file://, provides complete localStorage fallback with identical API.
 */

const DB = (function() {
  const API_BASE = '/api';
  let isServerAvailable = null;

  // Fallback initial seed datasets for localStorage mode
  const SEED_DISHES = [
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

  const SEED_REVIEWS = [
    { id: 1, reviewer_name: "Tariq M.", rating: 5, comment: "Hands down the most authentic Biryani in town. The rice grains are perfectly separated and the meat is tender enough to fall off the bone. Been coming here since 2016!", diner_type: "Regular Patron • 8 Yrs", avatar_initials: "TM", created_at: "2026-08-15 19:30" },
    { id: 2, reviewer_name: "Ayesha K.", rating: 5, comment: "Their Chicken Karahi and Garlic Naan together with the Biryani make the ultimate weekend family feast. Outstanding service, warm aroma, and unmistakable pride.", diner_type: "Food Enthusiast", avatar_initials: "AK", created_at: "2026-08-22 20:15" },
    { id: 3, reviewer_name: "Bilal S.", rating: 5, comment: "Ordered takeaway for our family party of 25 people. Everyone was raving about the BBQ platter and Mutton Biryani. Hot, fresh, and exceptionally generous portions.", diner_type: "Family Host", avatar_initials: "BS", created_at: "2026-08-29 18:45" }
  ];

  // Helper for localStorage initial seed
  function getLocal(key, defaultVal) {
    try {
      const stored = localStorage.getItem('zb_' + key);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch(e) {
      return defaultVal;
    }
  }

  function setLocal(key, val) {
    try {
      localStorage.setItem('zb_' + key, JSON.stringify(val));
    } catch(e) {}
  }

  // Check server connectivity
  async function checkServer() {
    if (isServerAvailable !== null) return isServerAvailable;
    if (window.location.protocol === 'file:') {
      isServerAvailable = false;
      return false;
    }
    try {
      const res = await fetch(`${API_BASE}/menu`, { method: 'GET', cache: 'no-cache' });
      isServerAvailable = res.ok;
    } catch (e) {
      isServerAvailable = false;
    }
    return isServerAvailable;
  }

  return {
    async isOnline() {
      return await checkServer();
    },

    // MENU
    async getMenu(category = 'all') {
      const online = await checkServer();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/menu${category && category !== 'all' ? '?category=' + category : ''}`);
          const json = await res.json();
          return json.data || [];
        } catch (e) {
          console.warn("Server fetch failed, falling back to local dataset:", e);
        }
      }
      
      const dishes = getLocal('dishes', SEED_DISHES);
      if (category && category !== 'all') {
        return dishes.filter(d => d.category === category);
      }
      return dishes;
    },

    // ORDERS
    async placeOrder(orderData) {
      const online = await checkServer();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
          const json = await res.json();
          if (res.ok) return json.data;
        } catch (e) {
          console.warn("Server order placement failed, falling back to local storage:", e);
        }
      }

      // Local fallback
      const orders = getLocal('orders', []);
      const orderNumber = `ZB-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newOrder = {
        id: orders.length + 1,
        order_number: orderNumber,
        status: 'Received',
        created_at: now,
        ...orderData
      };
      orders.unshift(newOrder);
      setLocal('orders', orders);
      return newOrder;
    },

    async getOrders() {
      const online = await checkServer();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/orders`);
          const json = await res.json();
          return json.data || [];
        } catch(e) {}
      }
      return getLocal('orders', []);
    },

    async getOrder(orderNum) {
      const online = await checkServer();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/orders/${orderNum}`);
          const json = await res.json();
          if (res.ok) return json.data;
        } catch(e) {}
      }
      const orders = getLocal('orders', []);
      return orders.find(o => o.order_number === orderNum || o.id == orderNum) || null;
    },

    async updateOrderStatus(orderId, status) {
      const online = await checkServer();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/orders/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, status: status })
          });
          if (res.ok) return true;
        } catch(e) {}
      }
      const orders = getLocal('orders', []);
      const target = orders.find(o => o.id == orderId || o.order_number == orderId);
      if (target) {
        target.status = status;
        setLocal('orders', orders);
        return true;
      }
      return false;
    },

    // RESERVATIONS
    async bookReservation(resData) {
      const online = await checkServer();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resData)
          });
          const json = await res.json();
          if (res.ok) return json.data;
        } catch (e) {
          console.warn("Reservation API failed, using local storage:", e);
        }
      }

      const reservations = getLocal('reservations', []);
      const resCode = `ZB-RES-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newRes = {
        id: reservations.length + 1,
        res_code: resCode,
        status: 'Confirmed',
        created_at: now,
        ...resData
      };
      reservations.unshift(newRes);
      setLocal('reservations', reservations);
      return newRes;
    },

    async getReservations() {
      const online = await checkServer();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/reservations`);
          const json = await res.json();
          return json.data || [];
        } catch(e) {}
      }
      return getLocal('reservations', []);
    },

    // REVIEWS
    async getReviews() {
      const online = await checkServer();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/reviews`);
          const json = await res.json();
          return {
            reviews: json.data || [],
            average_rating: json.average_rating || 4.9,
            total_reviews: json.total_reviews || (json.data ? json.data.length : 0)
          };
        } catch(e) {}
      }
      const reviews = getLocal('reviews', SEED_REVIEWS);
      const avg = reviews.length ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1) : 4.9;
      return { reviews, average_rating: parseFloat(avg), total_reviews: reviews.length };
    },

    async submitReview(reviewData) {
      const online = await checkServer();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
          });
          const json = await res.json();
          if (res.ok) return json.data;
        } catch(e) {}
      }
      const reviews = getLocal('reviews', SEED_REVIEWS);
      const initials = (reviewData.reviewer_name || 'ZB').split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);
      const newReview = {
        id: reviews.length + 1,
        reviewer_name: reviewData.reviewer_name,
        rating: parseInt(reviewData.rating, 10) || 5,
        comment: reviewData.comment,
        diner_type: reviewData.diner_type || "Verified Diner",
        avatar_initials: initials,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      reviews.unshift(newReview);
      setLocal('reviews', reviews);
      return newReview;
    },

    // CONTACT / INQUIRIES
    async sendInquiry(inquiryData) {
      const online = await checkServer();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inquiryData)
          });
          const json = await res.json();
          if (res.ok) return json;
        } catch(e) {}
      }
      const inquiries = getLocal('inquiries', []);
      inquiries.push({ ...inquiryData, created_at: new Date().toISOString() });
      setLocal('inquiries', inquiries);
      return { status: 'success', message: 'Inquiry saved successfully!' };
    },

    // STATS
    async getStats() {
      const online = await checkServer();
      if (online) {
        try {
          const res = await fetch(`${API_BASE}/stats`);
          const json = await res.json();
          if (res.ok) return json.stats;
        } catch(e) {}
      }
      const orders = getLocal('orders', []);
      const reservations = getLocal('reservations', []);
      const reviews = getLocal('reviews', SEED_REVIEWS);
      const totalSales = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      const active = orders.filter(o => o.status !== 'Delivered').length;
      const avg = reviews.length ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1) : 4.9;

      return {
        total_orders: orders.length,
        total_sales: parseFloat(totalSales.toFixed(2)),
        active_orders: active,
        total_reservations: reservations.length,
        total_reviews: reviews.length,
        average_rating: parseFloat(avg)
      };
    }
  };
})();

// Export globally
window.DB = DB;
