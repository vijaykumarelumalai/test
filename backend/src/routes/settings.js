const express = require('express');
const router = express.Router();
const { query, run, db } = require('../db');

// 1. Get All Settings
router.get('/', (req, res) => {
  try {
    const rows = query('SELECT * FROM system_settings');
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    return res.json({ settings });
  } catch (err) {
    console.error('Fetch settings error:', err);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// 2. Update Settings
router.put('/', (req, res) => {
  try {
    const { settings, adminEmail } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }

    const upsertStmt = db.prepare(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    for (const [key, value] of Object.entries(settings)) {
      upsertStmt.run(key, String(value));
    }

    // Log the change in audit_logs
    try {
      const email = adminEmail || settings.super_admin_email || 'admin@vktraders.com';
      run(`
        INSERT INTO audit_logs (action, module, details, user_email)
        VALUES (?, ?, ?, ?)
      `, ['SETTINGS_UPDATED', 'Settings', `System settings updated (${Object.keys(settings).length} parameters changed)`, email]);
    } catch (auditErr) {
      console.error('Failed to write audit log:', auditErr);
    }

    return res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// 3. Get Audit Logs
router.get('/audit-logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const logs = query(`
      SELECT * FROM audit_logs 
      ORDER BY id DESC 
      LIMIT ?
    `, [limit]);
    return res.json({ auditLogs: logs, logs });
  } catch (err) {
    console.error('Fetch audit logs error:', err);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// 4. Clear/Reset Audit Logs
router.delete('/audit-logs', (req, res) => {
  try {
    run('DELETE FROM audit_logs');
    run(`
      INSERT INTO audit_logs (action, module, details, user_email)
      VALUES ('LOGS_CLEARED', 'Settings', 'Audit trail cleared by Super Admin', 'admin@vktraders.com')
    `);
    return res.json({ message: 'Audit logs cleared' });
  } catch (err) {
    console.error('Clear audit logs error:', err);
    return res.status(500).json({ error: 'Failed to clear audit logs' });
  }
});

// 5. Purge Static / Mock Data (Reset Database to clean operational state)
router.post('/purge-mock-data', (req, res) => {
  try {
    db.exec('PRAGMA foreign_keys = OFF;');
    run('DELETE FROM attendance');
    run('DELETE FROM loan_repayments');
    run('DELETE FROM loans');
    run('DELETE FROM advances');
    run('DELETE FROM monthly_payrolls');
    run('DELETE FROM workers');
    run('DELETE FROM notifications');
    try {
      run("DELETE FROM sqlite_sequence WHERE name IN ('attendance', 'loan_repayments', 'loans', 'advances', 'monthly_payrolls', 'workers', 'notifications')");
    } catch (e) {}
    db.exec('PRAGMA foreign_keys = ON;');

    run(`
      INSERT INTO audit_logs (action, module, details, user_email)
      VALUES (?, ?, ?, ?)
    `, ['PURGE_STATIC_DATA', 'Settings', 'All static mock records purged. Clean operational database state.', 'admin@vktraders.com']);

    return res.json({ message: 'All static data purged successfully. Database is clean.' });
  } catch (err) {
    console.error('Purge mock data error:', err);
    return res.status(500).json({ error: 'Failed to purge mock data' });
  }
});

module.exports = router;

