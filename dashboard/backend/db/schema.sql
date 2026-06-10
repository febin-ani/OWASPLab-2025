CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Student', 'Trainer', 'Admin'))
);

CREATE TABLE IF NOT EXISTS labs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    tier TEXT NOT NULL CHECK(tier IN ('Easy', 'Medium', 'Hard')),
    description TEXT,
    flag TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lab_id TEXT NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(lab_id) REFERENCES labs(id),
    UNIQUE(user_id, lab_id)
);

CREATE TABLE IF NOT EXISTS lab_content (
    lab_id TEXT PRIMARY KEY,
    hint1 TEXT,
    hint2 TEXT,
    hint3 TEXT,
    walkthrough TEXT,
    FOREIGN KEY(lab_id) REFERENCES labs(id)
);

-- Seed initial Admin user if not exists (password: admin123 -> hashed with bcrypt. I will generate the hash in the setup script instead to ensure correct salt)
