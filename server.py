import http.server
import socketserver
import json
import sqlite3
import os
import urllib.parse
from datetime import datetime
import random
import smtplib
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ============================================================
# EMAIL CONFIGURATION
# Uses Gmail SMTP. The sender must be a Gmail account with
# an App Password (not normal password) if 2FA is enabled.
# Generate an App Password at: https://myaccount.google.com/apppasswords
# ============================================================
EMAIL_SENDER    = "mibadkhan9101162@gmail.com"   # Gmail account sending the emails
EMAIL_PASSWORD  = "YOUR_GMAIL_APP_PASSWORD_HERE"  # Replace with your Gmail App Password
EMAIL_RECEIVER  = "mibadkhan9101162@gmail.com"   # Restaurant owner email
SMTP_SERVER     = "smtp.gmail.com"
SMTP_PORT       = 587

PORT = 8000
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "restaurant.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS dishes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        badge TEXT,
        spice_level TEXT,
        serves TEXT,
        is_popular INTEGER DEFAULT 0
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        order_type TEXT NOT NULL,
        table_number TEXT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT DEFAULT '',
        delivery_address TEXT,
        notes TEXT,
        payment_method TEXT NOT NULL,
        items_json TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        delivery_fee REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        total REAL NOT NULL,
        status TEXT DEFAULT 'Received',
        created_at TEXT NOT NULL
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        res_code TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        guests TEXT NOT NULL,
        date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        seating_area TEXT,
        special_requests TEXT,
        status TEXT DEFAULT 'Confirmed',
        created_at TEXT NOT NULL
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reviewer_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        diner_type TEXT,
        avatar_initials TEXT,
        created_at TEXT NOT NULL
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    ''')
    
    # Check if dishes need seeding
    cursor.execute("SELECT COUNT(*) FROM dishes")
    if cursor.fetchone()[0] == 0:
        seed_dishes = [
            ("Signature Chicken Biryani", "biryani", 15.99, "Fragrant aged basmati rice layered with spiced marinated chicken, saffron, and golden fried onions.", "assets/images/hero-biryani.png", "Popular", "Medium", "Matka Dum Portioned", 1),
            ("Mutton Biryani", "biryani", 18.99, "Rich, tender slow-cooked bone-in mutton with aromatic saffron rice and whole fragrant garam masala.", "assets/images/hero-biryani.png", "Signature", "Medium", "4-Hour Dum Pukht", 1),
            ("Karachi Beef Biryani", "biryani", 16.99, "Deep, savory spiced beef layered in traditional Karachi-style dum pot with seasoned aloo and dried plum hints.", "assets/images/hero-biryani.png", "Karachi Spicy", "Karachi Spicy", "Dum Sealed Pot", 0),
            ("Chicken Karahi", "karahi", 21.50, "Wok-cooked chicken in freshly pounded tomatoes, ginger juliennes, green chilies, and freshly cracked black pepper.", "assets/images/chicken-karahi.png", "Chef Special", "Medium", "Cast Iron Wok", 1),
            ("Mutton Karahi", "karahi", 26.00, "Succulent baby mutton simmered in cast iron karahi with crushed garlic, whole coriander, and traditional Lahori spices.", "assets/images/chicken-karahi.png", "Desi Ghee", "Karachi Spicy", "Desi Ghee Finish", 0),
            ("Charcoal Chicken Tikka", "bbq", 12.50, "Smoky, char-grilled chicken quarters marinated in Kashmiri red chili, cultured yogurt, and roasted ground spices.", "assets/images/bbq-platter.png", "Smoky", "Mild", "Open Charcoal Pit", 0),
            ("Seekh Kabab", "bbq", 13.99, "Melt-in-mouth minced beef and lamb skewers with fresh mint, coriander, ginger, and slow-roasted cumin.", "assets/images/bbq-platter.png", "Popular", "Medium", "4 Skewers", 1),
            ("Royal Chicken Handi", "karahi", 19.99, "Silky boneless chicken simmered in rich cashew and cream gravy in a traditional earthen clay pot.", "assets/images/chicken-karahi.png", "Mild Creamy", "Mild", "Clay Pot Slow Cooked", 0),
            ("Mixed BBQ Platter", "bbq", 34.50, "Generous assortment of Seekh Kababs, Chicken Tikka boti, Malai boti, served with mint chutney and warm naan.", "assets/images/bbq-platter.png", "Feast", "Medium", "Serves 3-4", 1),
            ("Garlic & Fresh Naan", "sides", 3.99, "Clay oven baked flatbreads brushed with clarified desi ghee, minced fresh garlic, and garden cilantro.", "assets/images/takeaway-box.png", "Fresh Baked", "Mild", "Clay Oven Fresh", 0),
            ("Fresh Raita & Kachumber Salad", "sides", 4.50, "Cooling roasted cumin and mint whipped yogurt accompanied by diced crisp cucumbers, red onions, and lemon.", "assets/images/takeaway-box.png", "Cooling", "Mild", "Vegetarian Refresh", 0),
            ("Gulab Jamun with Saffron Rabri", "sides", 6.50, "Warm golden dumplings steeped in cardamom sugar syrup, topped with rich thickened saffron rabri milk.", "assets/images/takeaway-box.png", "Sweet", "Mild", "Royal Dessert", 0)
        ]
        cursor.executemany('''
        INSERT INTO dishes (name, category, price, description, image, badge, spice_level, serves, is_popular)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', seed_dishes)
    
    # Check if reviews need seeding
    cursor.execute("SELECT COUNT(*) FROM reviews")
    if cursor.fetchone()[0] == 0:
        seed_reviews = [
            ("Tariq M.", 5, "Hands down the most authentic Biryani in town. The rice grains are perfectly separated and the meat is tender enough to fall off the bone. Been coming here since 2016!", "Regular Patron • 8 Yrs", "TM", "2026-08-15 19:30"),
            ("Ayesha K.", 5, "Their Chicken Karahi and Garlic Naan together with the Biryani make the ultimate weekend family feast. Outstanding service, warm aroma, and unmistakable pride.", "Food Enthusiast", "AK", "2026-08-22 20:15"),
            ("Bilal S.", 5, "Ordered takeaway for our family party of 25 people. Everyone was raving about the BBQ platter and Mutton Biryani. Hot, fresh, and exceptionally generous portions.", "Family Host", "BS", "2026-08-29 18:45")
        ]
        cursor.executemany('''
        INSERT INTO reviews (reviewer_name, rating, comment, diner_type, avatar_initials, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', seed_reviews)

    # Check if sample reservations exist
    cursor.execute("SELECT COUNT(*) FROM reservations")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
        INSERT INTO reservations (res_code, customer_name, phone, guests, date, time_slot, seating_area, special_requests, status, created_at)
        VALUES ('ZB-RES-7104', 'Hamza Abbasi', '+92 321 8899123', '4 Persons', '2026-09-06', '7:30 PM (Dinner)', 'Family Seating', 'High chair requested', 'Confirmed', '2026-09-04 14:10')
        ''')

    # Check if sample orders exist
    cursor.execute("SELECT COUNT(*) FROM orders")
    if cursor.fetchone()[0] == 0:
        sample_items = json.dumps([
            {"id": 1, "name": "Signature Chicken Biryani", "price": 15.99, "quantity": 2, "spice": "Karachi Spicy"},
            {"id": 10, "name": "Garlic & Fresh Naan", "price": 3.99, "quantity": 2, "spice": "Mild"}
        ])
        cursor.execute('''
        INSERT INTO orders (order_number, order_type, table_number, customer_name, customer_phone, delivery_address, notes, payment_method, items_json, subtotal, discount, delivery_fee, tax, total, status, created_at)
        VALUES ('ZB-ORD-8821', 'delivery', '', 'Kamran Raza', '+92 300 5544332', 'Flat 402, Al-Razi Heights, Gulshan Block 4', 'Extra green raita please', 'cash', ?, 35.97, 0, 3.50, 4.67, 44.14, 'In Dum Pukht', '2026-09-05 12:45')
        ''', (sample_items,))
        
    conn.commit()
    conn.close()

# ============================================================
# EMAIL FUNCTIONS
# ============================================================
def send_email(to_address, subject, html_body):
    """Send an HTML email via Gmail SMTP. Runs silently on failure."""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From']    = EMAIL_SENDER
        msg['To']      = to_address
        msg.attach(MIMEText(html_body, 'html'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, to_address, msg.as_string())
        print(f"[EMAIL] Sent to {to_address}: {subject}")
    except Exception as e:
        print(f"[EMAIL ERROR] Could not send to {to_address}: {e}")


def notify_restaurant(order):
    """Send a detailed order notification email to the restaurant owner."""
    items = order.get('items', [])
    items_rows = "".join([
        f"<tr><td style='padding:6px 10px;border-bottom:1px solid #e8d5a3'>{i.get('quantity',1)}x</td>"
        f"<td style='padding:6px 10px;border-bottom:1px solid #e8d5a3'>{i.get('name','')}</td>"
        f"<td style='padding:6px 10px;border-bottom:1px solid #e8d5a3'>{i.get('spice','Medium')}</td>"
        f"<td style='padding:6px 10px;border-bottom:1px solid #e8d5a3;text-align:right'>${float(i.get('price',0))*int(i.get('quantity',1)):.2f}</td></tr>"
        for i in items
    ])

    promo_row = ""
    if float(order.get('discount', 0)) > 0:
        promo_row = f"<tr><td colspan='2' style='padding:4px 10px;color:#d97706;font-weight:bold'>Promo Discount:</td><td colspan='2' style='padding:4px 10px;text-align:right;color:#d97706'>-${float(order.get('discount',0)):.2f}</td></tr>"

    html = f"""
    <html><body style='font-family:Arial,sans-serif;background:#fdf8f0;margin:0;padding:0'>
    <div style='max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1)'>
      <div style='background:linear-gradient(135deg,#1a0a00,#3d1800);padding:24px 30px;color:#f0c050;text-align:center'>
        <h1 style='margin:0;font-size:26px;letter-spacing:2px'>🍛 NEW ORDER — ZERO BIRYANI</h1>
        <p style='margin:8px 0 0;color:#e8d5a3;font-size:14px'>Order Reference: <strong>{order['order_number']}</strong></p>
      </div>
      <div style='padding:24px 30px'>
        <table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:20px'>
          <tr><td style='color:#666;font-size:13px;padding:4px 0'>Customer Name:</td><td style='font-weight:bold;font-size:14px;text-align:right'>{order['customer_name']}</td></tr>
          <tr><td style='color:#666;font-size:13px;padding:4px 0'>Phone:</td><td style='font-weight:bold;font-size:14px;text-align:right'>{order['customer_phone']}</td></tr>
          <tr><td style='color:#666;font-size:13px;padding:4px 0'>Email:</td><td style='font-weight:bold;font-size:14px;text-align:right'>{order.get('customer_email','N/A')}</td></tr>
          <tr><td style='color:#666;font-size:13px;padding:4px 0'>Order Type:</td><td style='font-weight:bold;font-size:14px;text-align:right;text-transform:uppercase'>{order['order_type']}</td></tr>
          {'<tr><td style="color:#666;font-size:13px;padding:4px 0">Delivery Address:</td><td style="font-weight:bold;font-size:14px;text-align:right">' + str(order.get('delivery_address','')) + '</td></tr>' if order.get('delivery_address') else ''}
          {'<tr><td style="color:#666;font-size:13px;padding:4px 0">Table Number:</td><td style="font-weight:bold;font-size:14px;text-align:right">' + str(order.get('table_number','')) + '</td></tr>' if order.get('table_number') else ''}
          {'<tr><td style="color:#666;font-size:13px;padding:4px 0">Notes:</td><td style="font-size:13px;text-align:right;color:#555">' + str(order.get('notes','')) + '</td></tr>' if order.get('notes') else ''}
          <tr><td style='color:#666;font-size:13px;padding:4px 0'>Payment:</td><td style='font-weight:bold;font-size:14px;text-align:right;text-transform:uppercase'>{order['payment_method']}</td></tr>
          <tr><td style='color:#666;font-size:13px;padding:4px 0'>Ordered At:</td><td style='font-weight:bold;font-size:14px;text-align:right'>{order['created_at']}</td></tr>
        </table>

        <h3 style='color:#1a0a00;margin-bottom:8px;border-bottom:2px solid #f0c050;padding-bottom:6px'>Ordered Items</h3>
        <table width='100%' cellpadding='0' cellspacing='0' style='font-size:13px'>
          <tr style='background:#fdf8f0'>
            <th style='padding:6px 10px;text-align:left'>Qty</th>
            <th style='padding:6px 10px;text-align:left'>Item</th>
            <th style='padding:6px 10px;text-align:left'>Spice</th>
            <th style='padding:6px 10px;text-align:right'>Price</th>
          </tr>
          {items_rows}
        </table>

        <table width='100%' cellpadding='0' cellspacing='0' style='margin-top:16px;font-size:13px'>
          <tr><td colspan='2' style='padding:4px 10px'>Subtotal:</td><td colspan='2' style='padding:4px 10px;text-align:right'>${float(order['subtotal']):.2f}</td></tr>
          {promo_row}
          <tr><td colspan='2' style='padding:4px 10px'>Delivery Fee:</td><td colspan='2' style='padding:4px 10px;text-align:right'>${float(order['delivery_fee']):.2f}</td></tr>
          <tr><td colspan='2' style='padding:4px 10px'>Tax:</td><td colspan='2' style='padding:4px 10px;text-align:right'>${float(order['tax']):.2f}</td></tr>
          <tr style='font-size:16px;font-weight:bold;color:#1a0a00;background:#f0c050'>
            <td colspan='2' style='padding:8px 10px'>TOTAL DUE:</td>
            <td colspan='2' style='padding:8px 10px;text-align:right'>${float(order['total']):.2f}</td>
          </tr>
        </table>
      </div>
      <div style='background:#1a0a00;padding:14px 30px;text-align:center;color:#e8d5a3;font-size:12px'>
        Zero Biryani — Authentic Dum Pukht Pakistani Restaurant
      </div>
    </div>
    </body></html>
    """
    subject = f"🍛 New Order {order['order_number']} — {order['customer_name']} — ${float(order['total']):.2f}"
    threading.Thread(target=send_email, args=(EMAIL_RECEIVER, subject, html), daemon=True).start()


def send_delivery_notification(customer_email, customer_name, order_number, total):
    """Send the 5-minute delayed parcel delivery notification to the customer."""
    html = f"""
    <html><body style='font-family:Arial,sans-serif;background:#fdf8f0;margin:0;padding:0'>
    <div style='max-width:540px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1)'>
      <div style='background:linear-gradient(135deg,#1a0a00,#3d1800);padding:28px 30px;color:#f0c050;text-align:center'>
        <div style='font-size:48px'>🛵</div>
        <h1 style='margin:8px 0 0;font-size:22px;letter-spacing:1px'>Your Biryani is On Its Way!</h1>
      </div>
      <div style='padding:28px 30px;text-align:center'>
        <p style='font-size:16px;color:#333'>Dear <strong>{customer_name}</strong>,</p>
        <p style='font-size:15px;color:#555;line-height:1.7'>
          Great news! Your order <strong style='color:#1a0a00'>{order_number}</strong> has been carefully sealed
          in our signature dum pukht handis and is now on its way to you. 🍛
        </p>
        <div style='background:#fdf8f0;border:2px solid #f0c050;border-radius:10px;padding:18px;margin:20px 0'>
          <p style='margin:0;font-size:20px;font-weight:bold;color:#1a0a00'>Parcel will be delivered to you</p>
          <p style='margin:8px 0 0;font-size:13px;color:#666'>Estimated arrival: 30–45 minutes from order time</p>
        </div>
        <p style='font-size:13px;color:#888'>Order Total: <strong>${total:.2f}</strong></p>
        <p style='font-size:13px;color:#888'>Thank you for choosing Zero Biryani. Enjoy your meal! 🙏</p>
      </div>
      <div style='background:#1a0a00;padding:14px 30px;text-align:center;color:#e8d5a3;font-size:12px'>
        Zero Biryani — Authentic Dum Pukht Pakistani Restaurant
      </div>
    </div>
    </body></html>
    """
    subject = f"🛵 Your Order {order_number} is On Its Way — Zero Biryani"
    # Schedule to send after 5 minutes (300 seconds)
    timer = threading.Timer(300, send_email, args=(customer_email, subject, html))
    timer.daemon = True
    timer.start()
    print(f"[EMAIL] Delivery notification for {order_number} scheduled in 5 minutes to {customer_email}")

class RestaurantRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)
        
        if path.startswith("/api/"):
            self.handle_api_get(path, query)
        else:
            # Default to index.html if visiting root
            if path == "/" or path == "":
                self.path = "/index.html"
            return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        if path.startswith("/api/"):
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
            try:
                data = json.loads(body)
            except Exception:
                data = {}
            self.handle_api_post(path, data)
        else:
            self.send_error(404, "Endpoint not found")

    def do_PATCH(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
            try:
                data = json.loads(body)
            except Exception:
                data = {}
            self.handle_api_patch(path, data)
        else:
            self.send_error(404, "Endpoint not found")

    def send_json(self, status, payload):
        response_data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_data)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(response_data)

    def handle_api_get(self, path, query):
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            if path == "/api/menu":
                category = query.get("category", [None])[0]
                if category and category != "all":
                    cursor.execute("SELECT * FROM dishes WHERE category = ?", (category,))
                else:
                    cursor.execute("SELECT * FROM dishes ORDER BY is_popular DESC, id ASC")
                dishes = [dict(row) for row in cursor.fetchall()]
                self.send_json(200, {"status": "success", "data": dishes})
                
            elif path == "/api/orders":
                cursor.execute("SELECT * FROM orders ORDER BY id DESC")
                orders = []
                for row in cursor.fetchall():
                    od = dict(row)
                    try:
                        od["items"] = json.loads(od["items_json"])
                    except Exception:
                        od["items"] = []
                    orders.append(od)
                self.send_json(200, {"status": "success", "data": orders})

            elif path.startswith("/api/orders/"):
                order_num = path.replace("/api/orders/", "").strip()
                cursor.execute("SELECT * FROM orders WHERE order_number = ? OR id = ?", (order_num, order_num))
                row = cursor.fetchone()
                if row:
                    od = dict(row)
                    try:
                        od["items"] = json.loads(od["items_json"])
                    except Exception:
                        od["items"] = []
                    self.send_json(200, {"status": "success", "data": od})
                else:
                    self.send_json(404, {"status": "error", "message": "Order not found"})

            elif path == "/api/reservations":
                cursor.execute("SELECT * FROM reservations ORDER BY id DESC")
                reservations = [dict(row) for row in cursor.fetchall()]
                self.send_json(200, {"status": "success", "data": reservations})

            elif path == "/api/reviews":
                cursor.execute("SELECT * FROM reviews ORDER BY id DESC")
                reviews = [dict(row) for row in cursor.fetchall()]
                avg_rating = 4.9
                if reviews:
                    avg_rating = round(sum(r["rating"] for r in reviews) / len(reviews), 1)
                self.send_json(200, {"status": "success", "data": reviews, "average_rating": avg_rating, "total_reviews": len(reviews)})

            elif path == "/api/stats":
                cursor.execute("SELECT COUNT(*), COALESCE(SUM(total), 0) FROM orders")
                order_count, total_sales = cursor.fetchone()
                cursor.execute("SELECT COUNT(*) FROM orders WHERE status != 'Delivered'")
                active_orders = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM reservations")
                total_reservations = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*), COALESCE(AVG(rating), 4.9) FROM reviews")
                review_count, avg_rating = cursor.fetchone()
                self.send_json(200, {
                    "status": "success",
                    "stats": {
                        "total_orders": order_count,
                        "total_sales": round(total_sales, 2),
                        "active_orders": active_orders,
                        "total_reservations": total_reservations,
                        "total_reviews": review_count,
                        "average_rating": round(avg_rating, 1)
                    }
                })

            else:
                self.send_json(404, {"status": "error", "message": "Endpoint not found"})
        except Exception as e:
            self.send_json(500, {"status": "error", "message": str(e)})
        finally:
            conn.close()

    def handle_api_post(self, path, data):
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            if path == "/api/orders":
                order_num = f"ZB-ORD-{random.randint(1000, 9999)}"
                order_type = data.get("order_type", "delivery")
                table_number = data.get("table_number", "")
                customer_name = data.get("customer_name", "Guest")
                customer_phone = data.get("customer_phone", "")
                customer_email = data.get("customer_email", "")
                delivery_address = data.get("delivery_address", "")
                notes = data.get("notes", "")
                payment_method = data.get("payment_method", "cash")
                items = data.get("items", [])
                subtotal = float(data.get("subtotal", 0))
                discount = float(data.get("discount", 0))
                delivery_fee = float(data.get("delivery_fee", 0))
                tax = float(data.get("tax", 0))
                total = float(data.get("total", subtotal - discount + delivery_fee + tax))
                created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                cursor.execute('''
                INSERT INTO orders (order_number, order_type, table_number, customer_name, customer_phone, customer_email, delivery_address, notes, payment_method, items_json, subtotal, discount, delivery_fee, tax, total, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Received', ?)
                ''', (order_num, order_type, table_number, customer_name, customer_phone, customer_email, delivery_address, notes, payment_method, json.dumps(items), subtotal, discount, delivery_fee, tax, total, created_at))
                conn.commit()
                order_id = cursor.lastrowid

                # Build order dict for email
                email_order = {
                    'order_number': order_num,
                    'order_type': order_type,
                    'table_number': table_number,
                    'customer_name': customer_name,
                    'customer_phone': customer_phone,
                    'customer_email': customer_email,
                    'delivery_address': delivery_address,
                    'notes': notes,
                    'payment_method': payment_method,
                    'items': items,
                    'subtotal': subtotal,
                    'discount': discount,
                    'delivery_fee': delivery_fee,
                    'tax': tax,
                    'total': total,
                    'created_at': created_at
                }
                # Send restaurant notification immediately (in background thread)
                notify_restaurant(email_order)
                # Send customer delivery notification after 5 minutes
                if customer_email:
                    send_delivery_notification(customer_email, customer_name, order_num, total)

                self.send_json(201, {
                    "status": "success",
                    "message": "Order successfully placed!",
                    "data": {
                        "id": order_id,
                        "order_number": order_num,
                        "order_type": order_type,
                        "customer_name": customer_name,
                        "total": total,
                        "status": "Received",
                        "created_at": created_at
                    }
                })

            elif path == "/api/reservations":
                res_code = f"ZB-RES-{random.randint(1000, 9999)}"
                customer_name = data.get("customer_name", "Valued Guest")
                phone = data.get("phone", "")
                guests = data.get("guests", "2 Persons")
                date = data.get("date", datetime.now().strftime("%Y-%m-%d"))
                time_slot = data.get("time_slot", "7:30 PM (Dinner)")
                seating_area = data.get("seating_area", "Main Dining")
                special_requests = data.get("special_requests", "")
                created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                cursor.execute('''
                INSERT INTO reservations (res_code, customer_name, phone, guests, date, time_slot, seating_area, special_requests, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)
                ''', (res_code, customer_name, phone, guests, date, time_slot, seating_area, special_requests, created_at))
                conn.commit()
                res_id = cursor.lastrowid

                self.send_json(201, {
                    "status": "success",
                    "message": "Table successfully reserved!",
                    "data": {
                        "id": res_id,
                        "res_code": res_code,
                        "customer_name": customer_name,
                        "guests": guests,
                        "date": date,
                        "time_slot": time_slot,
                        "seating_area": seating_area
                    }
                })

            elif path == "/api/reviews":
                reviewer_name = data.get("reviewer_name", "Anonymous Diner").strip()
                rating = int(data.get("rating", 5))
                comment = data.get("comment", "").strip()
                diner_type = data.get("diner_type", "Verified Diner")
                initials = "".join([part[0].upper() for part in reviewer_name.split()[:2]]) or "ZB"
                created_at = datetime.now().strftime("%Y-%m-%d %H:%M")

                cursor.execute('''
                INSERT INTO reviews (reviewer_name, rating, comment, diner_type, avatar_initials, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ''', (reviewer_name, rating, comment, diner_type, initials, created_at))
                conn.commit()

                self.send_json(201, {
                    "status": "success",
                    "message": "Thank you! Your review has been published.",
                    "data": {
                        "id": cursor.lastrowid,
                        "reviewer_name": reviewer_name,
                        "rating": rating,
                        "comment": comment,
                        "diner_type": diner_type,
                        "avatar_initials": initials,
                        "created_at": created_at
                    }
                })

            elif path == "/api/contact":
                name = data.get("name", "")
                email = data.get("email", "")
                phone = data.get("phone", "")
                subject = data.get("subject", "General Inquiry")
                message = data.get("message", "")
                created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                cursor.execute('''
                INSERT INTO inquiries (name, email, phone, subject, message, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ''', (name, email, phone, subject, message, created_at))
                conn.commit()

                self.send_json(201, {
                    "status": "success",
                    "message": "Your message has been received! Our manager will contact you shortly."
                })

            elif path == "/api/orders/status":
                order_id = data.get("order_id")
                new_status = data.get("status", "In Dum Pukht")
                cursor.execute("UPDATE orders SET status = ? WHERE id = ? OR order_number = ?", (new_status, order_id, order_id))
                conn.commit()
                self.send_json(200, {"status": "success", "message": f"Order status updated to {new_status}"})

            else:
                self.send_json(404, {"status": "error", "message": "Endpoint not found"})
        except Exception as e:
            self.send_json(500, {"status": "error", "message": str(e)})
        finally:
            conn.close()

    def handle_api_patch(self, path, data):
        if "/api/orders/" in path and path.endswith("/status"):
            parts = path.split("/")
            order_id = parts[3]
            new_status = data.get("status", "In Dum Pukht")
            conn = get_db()
            cursor = conn.cursor()
            try:
                cursor.execute("UPDATE orders SET status = ? WHERE id = ? OR order_number = ?", (new_status, order_id, order_id))
                conn.commit()
                self.send_json(200, {"status": "success", "message": f"Order status updated to {new_status}"})
            except Exception as e:
                self.send_json(500, {"status": "error", "message": str(e)})
            finally:
                conn.close()
        else:
            self.send_json(404, {"status": "error", "message": "Endpoint not found"})

if __name__ == "__main__":
    init_db()
    print(f"============================================================")
    print(f" ZERO BIRYANI - RESTAURANT ENGINE & DATABASE SERVER")
    print(f" SQLite Database: {DB_FILE}")
    print(f" Web Server Running at: http://localhost:{PORT}")
    print(f"============================================================")
    
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), RestaurantRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.shutdown()
