from flask import Flask, jsonify, render_template_string

app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Dev Portal - Under Construction</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155; }
        h1 { color: #f59e0b; margin-top: 0; }
        p { color: #94a3b8; line-height: 1.6; }
        .badge { background: #334155; color: #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-family: monospace; }
        .footer { margin-top: 20px; font-size: 0.8rem; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Internal Dev Portal</h1>
        <p>This staging portal is currently under active construction. The production launch is scheduled for Q4 2026.</p>
        <p>Debug mode is currently <span class="badge">ENABLED</span> for rapid testing.</p>
        <div style="margin: 20px 0; border-top: 1px solid #334155; padding-top: 20px;">
            <p style="font-size: 0.9rem; color: #94a3b8;">Common paths configured on server:</p>
            <span class="badge">/</span> &nbsp; <span class="badge">/status</span>
        </div>
        <div class="footer">Confidential Internal System - Do Not Share</div>
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/status')
def status():
    return jsonify({"status": "running", "environment": "staging", "debug": True})

# Leaked configuration endpoint
@app.route('/debug')
def debug():
    return jsonify({
        "debug_mode": True,
        "database": {
            "type": "sqlite",
            "path": "/app/dev.db",
            "status": "connected"
        },
        "system_variables": {
            "DB_USER": "dev_admin",
            "DB_PASS": "DevSecretPassword2026",
            "FLAG": "FLAG{a02_easy_dotenv_leak}"
        }
    })

# Exposed raw .env file route
@app.route('/.env')
def serve_env():
    env_content = (
        "DEBUG=True\n"
        "ENVIRONMENT=staging\n"
        "DB_HOST=127.0.0.1\n"
        "DB_USER=dev_admin\n"
        "DB_PASS=DevSecretPassword2026\n"
        "FLAG=FLAG{a02_easy_dotenv_leak}\n"
    )
    return env_content, 200, {'Content-Type': 'text/plain'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
