import os
import sqlite3
from flask import Flask, request, render_template_string

app = Flask(__name__)
DB_FILE = 'vulnerable.db'

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE products (name TEXT, description TEXT, price REAL)")
    cursor.execute("CREATE TABLE flags (flag TEXT)")
    
    cursor.executemany("INSERT INTO products VALUES (?, ?, ?)", [
        ("Secure Keyboard", "Mechanical keyboard with military-grade encryption keys.", 99.99),
        ("Privacy Screen", "A screen filter that blocks side angles from snooping.", 24.99),
        ("Cybersecurity Guide", "A book explaining basic security concepts for beginners.", 14.50),
        ("Encrypted USB Drive", "Hardware-encrypted flash drive with fingerprint scanner.", 49.99)
    ])
    cursor.execute("INSERT INTO flags VALUES ('FLAG{a05_easy_sql_injection_master}')")
    conn.commit()
    conn.close()

# Initialize the database on startup
init_db()

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>CyberSecurity Shop</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #6366f1; text-align: center; margin-bottom: 30px; }
        .search-box { display: flex; gap: 10px; margin-bottom: 30px; }
        .search-input { background: #1e293b; border: 1px solid #334155; border-radius: 8px; color: white; padding: 12px; flex: 1; font-size: 1rem; }
        .search-input:focus { outline: none; border-color: #6366f1; }
        .btn-search { background: #6366f1; color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer; font-weight: 600; font-size: 1rem; }
        .btn-search:hover { background: #4f46e5; }
        .product-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin-bottom: 15px; }
        .product-title { font-size: 1.2rem; font-weight: 700; color: #f8fafc; margin: 0 0 8px 0; }
        .product-desc { color: #94a3b8; font-size: 0.95rem; margin: 0 0 12px 0; line-height: 1.5; }
        .product-price { color: #10b981; font-weight: 700; }
        .error-box { background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); color: #f43f5e; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-family: monospace; }
        .no-results { text-align: center; color: #64748b; font-style: italic; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>CyberSecurity Gear Shop</h1>
        
        <form method="GET" action="" class="search-box">
            <input 
                type="text" 
                name="search" 
                class="search-input" 
                placeholder="Search products (e.g. keyboard, guide...)" 
                value="{{ search }}"
            />
            <button type="submit" class="btn-search">Search</button>
        </form>

        {% if error %}
            <div class="error-box">
                <strong>Database Error:</strong> {{ error }}
            </div>
        {% endif %}

        <div class="products-list">
            {% if products %}
                {% for prod in products %}
                    <div class="product-card">
                        <div class="product-title">{{ prod.name }}</div>
                        <div class="product-desc">{{ prod.description }}</div>
                        <div class="product-price">${{ prod.price }}</div>
                    </div>
                {% endfor %}
            {% elif search and not error %}
                <div class="no-results">No products found matching your search.</div>
            {% endif %}
        </div>
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    search = request.args.get('search', '')
    products = []
    error = None
    
    if search:
        conn = get_db()
        cursor = conn.cursor()
        # Vulnerable SQL concatenation
        sql = f"SELECT name, description, price FROM products WHERE name LIKE '%{search}%'"
        try:
            cursor.execute(sql)
            products = cursor.fetchall()
        except Exception as e:
            error = str(e)
        finally:
            conn.close()
            
    return render_template_string(HTML_TEMPLATE, search=search, products=products, error=error)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
