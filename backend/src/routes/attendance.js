const express = require('express');
const router = express.Router();
const { query, get, run, db } = require('../db');

// 1. Get Daily Roster by Date
router.get('/by-date', (req, res) => {
  try {
    const { date, department, type } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let sql = `
      SELECT 
        w.id as worker_id,
        w.labour_id,
        w.name,
        w.phone,
        w.worker_type,
        w.department,
        w.daily_wage as default_daily_wage,
        COALESCE(a.id, NULL) as attendance_id,
        COALESCE(a.status, 'UNMARKED') as status,
        COALESCE(a.wage_factor, 0) as wage_factor,
        COALESCE(a.effective_daily_wage, w.daily_wage) as effective_daily_wage,
        COALESCE(a.earned_amount, 0) as earned_amount,
        COALESCE(a.remarks, '') as remarks
      FROM workers w
      LEFT JOIN attendance a ON w.id = a.worker_id AND a.date = ?
      WHERE w.is_active = 1
    `;
    const params = [targetDate];

    if (department && department !== 'ALL') {
      sql += ' AND w.department = ?';
      params.push(department);
    }

    if (type && type !== 'ALL') {
      sql += ' AND w.worker_type = ?';
      params.push(type.toUpperCase());
    }

    sql += ' ORDER BY w.id ASC';

    const roster = query(sql, params);
    return res.json({ date: targetDate, roster });
  } catch (err) {
    console.error('Fetch daily attendance error:', err);
    return res.status(500).json({ error: 'Failed to fetch attendance roster' });
  }
});

// 2. Batch Save Attendance for a Date (Directly from Dashboard or Attendance screen)
router.post('/save-daily', (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Valid date and records array are required' });
    }

    const upsertStmt = db.prepare(`
      INSERT INTO attendance (worker_id, date, status, wage_factor, effective_daily_wage, earned_amount, remarks, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(worker_id, date) DO UPDATE SET
        status = excluded.status,
        wage_factor = excluded.wage_factor,
        effective_daily_wage = excluded.effective_daily_wage,
        earned_amount = excluded.earned_amount,
        remarks = excluded.remarks,
        updated_at = CURRENT_TIMESTAMP
    `);

    let savedCount = 0;
    for (const item of records) {
      if (!item.worker_id || !item.status) continue;

      let factor = 1.0;
      if (item.status === 'HALF_DAY') factor = 0.5;
      else if (item.status === 'ABSENT') factor = 0.0;

      const effectiveWage = parseFloat(item.effective_daily_wage) || 0;
      const earned = factor * effectiveWage;

      upsertStmt.run(
        item.worker_id,
        date,
        item.status,
        factor,
        effectiveWage,
        earned,
        item.remarks || ''
      );
      savedCount++;
    }

    return res.json({ message: `Successfully saved attendance for ${savedCount} workers`, date, savedCount });
  } catch (err) {
    console.error('Save attendance error:', err);
    return res.status(500).json({ error: 'Failed to save attendance' });
  }
});

// 3. Worker Attendance History (Month breakdown)
router.get('/worker-history', (req, res) => {
  try {
    const { workerId, month } = req.query; // month = YYYY-MM
    if (!workerId) {
      return res.status(400).json({ error: 'Worker ID is required' });
    }

    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const history = query(`
      SELECT date, status, wage_factor, effective_daily_wage, earned_amount, remarks
      FROM attendance
      WHERE worker_id = ? AND strftime('%Y-%m', date) = ?
      ORDER BY date ASC
    `, [workerId, targetMonth]);

    return res.json({ workerId, month: targetMonth, history });
  } catch (err) {
    console.error('Worker attendance history error:', err);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
