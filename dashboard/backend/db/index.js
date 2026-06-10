const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'owasplab.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schemaSql, async (err) => {
        if (err) {
            console.error('Error executing schema', err.message);
        } else {
            console.log('Database schema initialized.');
            await seedAdminUser();
            await seedLabs();
        }
    });
}

async function seedAdminUser() {
    db.get(`SELECT id FROM users WHERE username = ?`, ['admin'], async (err, row) => {
        if (err) return console.error(err.message);
        if (!row) {
            const hash = await bcrypt.hash('admin123', 10);
            db.run(`INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
                ['admin', hash, 'Admin'], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log(`A row has been inserted with rowid ${this.lastID}`);
            });
        }
    });
}

function seedLabs() {
    // Seed initial A01-Easy lab
    db.get(`SELECT id FROM labs WHERE id = ?`, ['a01-easy'], (err, row) => {
        if (err) return console.error(err.message);
        if (!row) {
            db.run(`INSERT INTO labs (id, title, category, tier, description, flag) VALUES (?, ?, ?, ?, ?, ?)`,
                ['a01-easy', 'Broken Access Control', 'A01', 'Easy', 'Access another user''s profile page via IDOR', 'FLAG{a01_easy_idor_master}'], (err) => {
                if (err) return console.error(err.message);
                console.log('Seeded a01-easy lab.');
            });
            
            db.run(`INSERT INTO lab_content (lab_id, hint1, hint2, hint3, walkthrough) VALUES (?, ?, ?, ?, ?)`,
                ['a01-easy', 'Look at how the user ID is passed when viewing a profile.', 'Try changing the ID parameter in the URL.', 'If you are user 1, try accessing the profile for user 2 or user 3. The flag is in user 3''s profile.', 'To exploit this IDOR, simply modify the `id` parameter in the URL from your own ID to another user''s ID, such as `id=3`. You will see the admin user''s flag.'], (err) => {
                if (err) return console.error(err.message);
                console.log('Seeded a01-easy lab content.');
            });
        }
    });
}

module.exports = db;
