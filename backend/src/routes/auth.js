const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { get } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'vk_traders_secret_key_2026';

function hashPin(pin) {
  return crypto.createHash('sha256').update(`vktraders_salt_${pin}`).digest('hex');
}

// 1. Super Admin Login
router.post('/admin-login', (req, res) => {
  const { email, password, googleToken } = req.body;

  // Google OAuth verification bypass/mock for development or password check
  if (googleToken) {
    // In production, verify with Google OAuth client library
    const token = jwt.sign(
      { role: 'SUPER_ADMIN', email: 'admin@vktraders.com', name: 'Super Admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({
      token,
      user: { role: 'SUPER_ADMIN', name: 'Super Admin', email: 'admin@vktraders.com' }
    });
  }

  // Check credentials against system_settings first, then fallback to environment variables
  const dbEmail = get("SELECT value FROM system_settings WHERE key = 'super_admin_email'")?.value;
  const dbPass = get("SELECT value FROM system_settings WHERE key = 'super_admin_password'")?.value;
  const dbName = get("SELECT value FROM system_settings WHERE key = 'super_admin_name'")?.value || 'Super Admin';

  const expectedEmail = dbEmail || process.env.ADMIN_EMAIL || 'admin@vktraders.com';
  const expectedPass = dbPass || process.env.ADMIN_PASSWORD || 'admin123';

  if (email === expectedEmail && password === expectedPass) {
    const token = jwt.sign(
      { role: 'SUPER_ADMIN', email, name: dbName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({
      token,
      user: { role: 'SUPER_ADMIN', name: dbName, email }
    });
  }

  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// 2. Labour Worker Login (Phone + 4-digit PIN)
router.post('/worker-login', (req, res) => {
  const { phone, pin } = req.body;

  if (!phone || !pin) {
    return res.status(400).json({ error: 'Phone number and PIN are required' });
  }

  const worker = get('SELECT * FROM workers WHERE phone = ? AND is_active = 1', [phone.trim()]);
  if (!worker) {
    return res.status(404).json({ error: 'No active worker found with this phone number' });
  }

  const hashed = hashPin(pin.trim());
  if (worker.pin_hash !== hashed) {
    return res.status(401).json({ error: 'Incorrect 4-digit PIN' });
  }

  const token = jwt.sign(
    { role: 'LABOUR', workerId: worker.id, labourId: worker.labour_id, name: worker.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return res.json({
    token,
    worker: {
      id: worker.id,
      labourId: worker.labour_id,
      name: worker.name,
      phone: worker.phone,
      workerType: worker.worker_type,
      department: worker.department,
      dailyWage: worker.daily_wage
    }
  });
});

module.exports = router;
