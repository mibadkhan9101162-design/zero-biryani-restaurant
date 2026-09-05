# 🍚 Zero Biryani — Authentic Pakistani Cuisine Web Application

> **10+ Years of Flavor. One Signature Biryani.**  
> A full-stack interactive restaurant website featuring slow-cooked Dum Pukht cuisine, online food ordering, live shopping cart, table reservation engine, verified diner reviews, and a zero-dependency Python SQLite backend.

---

## ✨ Features

- 🛒 **Interactive Shopping Cart & Ordering**:
  - Slide-over cart drawer with quantity adjustments and coupon codes (`DUM10`, `BIRYANI20`).
  - Dish customizer modal with spice level selector (*Mild, Medium, Karachi Spicy, Extra Fiery*).
  - Multi-mode checkout: **Home Delivery**, **Express Takeaway**, and **Dine-In Table Ordering**.
  - Generated order references (e.g. `ZB-ORD-9961`) and simulated 4-step live order tracking.
- 📅 **Table Reservation Engine**:
  - Interactive booking form with date restriction (today onwards), guest party size, and seating area options (*Main Dining, Family Booth, Terrace*).
  - Generates a unique reservation code (e.g. `ZB-RES-1113`).
- ⭐ **Customer Reviews & Testimonials**:
  - Dynamically loaded from database with aggregate star ratings.
  - Interactive modal with 5-star rating selector to submit verified diner feedback.
- 👨‍🍳 **Kitchen & Staff Admin Console**:
  - Access via the shield/admin icon in the header.
  - Real-time sales statistics, active incoming orders, order status changer (*Received -> In Dum Pukht -> Out for Delivery -> Delivered*), and reservation lists.
- 💾 **Dual-Mode Persistence (SQLite + Offline Fallback)**:
  - When running with `server.py`, all transactions are persisted in `restaurant.db` (SQLite).
  - Seamless fallback to `localStorage` if opened directly as a static file.

---

## 📁 Project Structure

```
├── assets/
│   └── images/               # High-resolution local imagery
│       ├── logo.png
│       ├── hero-biryani.png
│       ├── chicken-karahi.png
│       ├── bbq-platter.png
│       ├── takeaway-box.png
│       └── restaurant-interior.png
├── css/
│   └── style.css             # Custom animations, transitions, modals, glowing accents
├── js/
│   ├── app.js                # Master frontend application logic & UI controllers
│   └── db.js                 # Universal data layer (SQLite REST + LocalStorage sync)
├── index.html                # Main web application entrypoint
├── server.py                 # Zero-dependency Python 3.12 + SQLite HTTP backend
├── start_server.bat          # One-click Windows server launcher
└── restaurant.db             # Local SQLite database file
```

---

## 🚀 Getting Started

### Method 1: Double-Click Launcher (Windows)
Double-click **`start_server.bat`** in the project folder. It will start the server and automatically launch `http://localhost:8000` in your default browser.

### Method 2: Command Line
Ensure Python 3 is installed:
```powershell
python server.py
```
Open your browser and navigate to:
```
http://localhost:8000
```

### Method 3: Static Offline Mode
You can also directly double-click `index.html` to open it in any browser — the client-side data layer (`js/db.js`) will seamlessly manage the cart, reservations, and reviews offline.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3, TailwindCSS (CDN), Google Material Symbols.
- **Backend**: Python 3.12 Standard Library (`http.server`, `socketserver`, `json`, `urllib`).
- **Database**: SQLite 3 (built-in, zero configuration required).
- **Design System**: Authentic Heritage & Culinary Grandeur (Playfair Display & Plus Jakarta Sans).
