const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production';

// Middleware to authenticate and extract user
const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get all labs
router.get('/', authenticate, (req, res) => {
    db.all('SELECT id, title, category, tier, description FROM labs', (err, labs) => {
        if (err) return res.status(500).json({ error: 'Internal server error' });

        // Get user progress
        db.all('SELECT lab_id, completed_at FROM progress WHERE user_id = ?', [req.user.id], (err, progress) => {
            if (err) return res.status(500).json({ error: 'Internal server error' });

            const completedLabs = progress.map(p => p.lab_id);
            const labsWithProgress = labs.map(lab => ({
                ...lab,
                completed: completedLabs.includes(lab.id)
            }));

            res.json(labsWithProgress);
        });
    });
});

// Get specific lab info (including hints if Trainer/Admin)
router.get('/:id', authenticate, (req, res) => {
    const labId = req.params.id;
    
    db.get('SELECT id, title, category, tier, description FROM labs WHERE id = ?', [labId], (err, lab) => {
        if (err) return res.status(500).json({ error: 'Internal server error' });
        if (!lab) return res.status(404).json({ error: 'Lab not found' });

        if (req.user.role === 'Student') {
            return res.json(lab); // Students don't get hints
        }

        // Trainer/Admin get hints and walkthrough
        db.get('SELECT hint1, hint2, hint3, walkthrough FROM lab_content WHERE lab_id = ?', [labId], (err, content) => {
            if (err) return res.status(500).json({ error: 'Internal server error' });
            res.json({ ...lab, content: content || {} });
        });
    });
});

// Submit flag
router.post('/:id/submit', authenticate, (req, res) => {
    const labId = req.params.id;
    const { flag } = req.body;

    if (!flag) return res.status(400).json({ error: 'Flag is required' });

    db.get('SELECT flag FROM labs WHERE id = ?', [labId], (err, lab) => {
        if (err) return res.status(500).json({ error: 'Internal server error' });
        if (!lab) return res.status(404).json({ error: 'Lab not found' });

        if (lab.flag === flag) {
            // Correct flag, record progress
            db.run('INSERT OR IGNORE INTO progress (user_id, lab_id) VALUES (?, ?)', [req.user.id, labId], (err) => {
                if (err) return res.status(500).json({ error: 'Internal server error' });
                res.json({ success: true, message: 'Correct flag! Lab completed.' });
            });
        } else {
            res.json({ success: false, message: 'Incorrect flag. Keep trying!' });
        }
    });
});

module.exports = router;
