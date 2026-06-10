from flask import Flask, request, render_template_string

app = Flask(__name__)

users = {
    "1": {"name": "Alice", "role": "Student", "bio": "Learning web security."},
    "2": {"name": "Bob", "role": "Student", "bio": "Just started."},
    "3": {"name": "Admin", "role": "Admin", "bio": "FLAG{a01_easy_idor_master}"}
}

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Profile Page</title>
    <style>
        body { font-family: sans-serif; background: #333; color: white; padding: 20px; }
        .card { background: #444; padding: 20px; border-radius: 8px; max-width: 400px; margin: 0 auto; }
        h1 { color: #E74C3C; }
    </style>
</head>
<body>
    <div class="card">
        <h1>User Profile</h1>
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
        <p><strong>Bio:</strong> {{ user.bio }}</p>
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    user_id = request.args.get('id', '1')
    user = users.get(user_id)
    
    if user:
        return render_template_string(HTML_TEMPLATE, user=user)
    else:
        return "User not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
