const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');

// 1. Get Advances List
router.get('/', (req, res) => {
  try {
    const { workerId, month, status } = req.query;
    let sql = `
      SELECT 
        a.id,
        a.worker_id,
        w.labour_id,
        w.name as worker_name,
        w.worker_type,
        a.date,
        a.amount,
        a.payment_mode,
        a.reason,
        a.status,
        a.created_at
      FROM advances a
      JOIN workers w ON a.worker_id = w.id
      WHERE 1 = 1
    `;
    const params = [];

    if (workerId) {
      sql += ' AND a.worker_id = ?';
      params.push(workerId);
    }

    if (month) {
      sql += " AND strftime('%Y-%m', a.date) = ?";
      params.push(month);
    }

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY a.id DESC';
    const advances = query(sql, params);

    const totalAmount = advances.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    return res.json({ advances, totalAmount });
  } catch (err) {
    console.error('Fetch advances error:', err);
    return res.status(500).json({ error: 'Failed to fetch advances' });
  }
});

// 2. Record New Advance
router.post('/', (req, res) => {
  try {
    const { workerId, amount, date, paymentMode, reason } = req.body;

    if (!workerId || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid worker and advance amount are required' });
    }

    const worker = get('SELECT id, name, labour_id FROM workers WHERE id = ?', [workerId]);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const advanceDate = date || new Date().toISOString().split('T')[0];
    const mode = paymentMode || 'CASH';

    run(`
      INSERT INTO advances (worker_id, date, amount, payment_mode, reason, status)
      VALUES (?, ?, ?, ?, ?, 'PENDING')
    `, [workerId, advanceDate, parseFloat(amount), mode, reason || '']);

    return res.status(201).json({ message: 'Advance successfully recorded' });
  } catch (err) {
    console.error('Record advance error:', err);
    return res.status(500).json({ error: 'Failed to record advance' });
  }
});

// 3. Edit Advance
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMode, reason, date, status } = req.body;

    const existing = get('SELECT * FROM advances WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Advance record not found' });
    }

    run(`
      UPDATE advances
      SET amount = COALESCE(?, amount),
          payment_mode = COALESCE(?, payment_mode),
          reason = COALESCE(?, reason),
          date = COALESCE(?, date),
          status = COALESCE(?, status)
      WHERE id = ?
    `, [amount, paymentMode, reason, date, status, id]);

    return res.json({ message: 'Advance updated successfully' });
  } catch (err) {
    console.error('Update advance error:', err);
    return res.status(500).json({ error: 'Failed to update advance' });
  }
});

// 4. Delete Advance
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    run('DELETE FROM advances WHERE id = ?', [id]);
    return res.json({ message: 'Advance deleted successfully' });
  } catch (err) {
    console.error('Delete advance error:', err);
    return res.status(500).json({ error: 'Failed to delete advance' });
  }
});

module.exports = router;
