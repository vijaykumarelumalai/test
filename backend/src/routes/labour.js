const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { query, get } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'vk_traders_secret_key_2026';

// Middleware to extract worker auth
function requireLabourAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Worker authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'LABOUR' && decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.workerId = decoded.workerId || req.query.workerId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// 1. Worker Mobile Summary
router.get('/my-summary', requireLabourAuth, (req, res) => {
  try {
    const workerId = req.workerId || req.query.workerId;
    const { month } = req.query;
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const worker = get('SELECT id, labour_id, name, phone, worker_type, department, daily_wage, joining_date FROM workers WHERE id = ?', [workerId]);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Attendance breakdown for target month
    const attendanceRecords = query(`
      SELECT date, status, wage_factor, effective_daily_wage, earned_amount, remarks
      FROM attendance
      WHERE worker_id = ? AND strftime('%Y-%m', date) = ?
      ORDER BY date ASC
    `, [workerId, targetMonth]);

    let daysPresent = 0;
    let daysHalf = 0;
    let daysAbsent = 0;
    let grossWage = 0;

    for (const a of attendanceRecords) {
      if (a.status === 'PRESENT') {
        daysPresent++;
        grossWage += a.earned_amount;
      } else if (a.status === 'HALF_DAY') {
        daysHalf++;
        grossWage += a.earned_amount;
      } else if (a.status === 'ABSENT') {
        daysAbsent++;
      }
    }

    // Advances taken
    const advances = query(`
      SELECT id, date, amount, payment_mode, reason, status
      FROM advances
      WHERE worker_id = ? AND strftime('%Y-%m', date) = ?
      ORDER BY date DESC
    `, [workerId, targetMonth]);

    const totalAdvances = advances.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    // Active loan (if any)
    const activeLoan = get(`
      SELECT loan_id, principal_amount, monthly_deduction, balance_remaining, status
      FROM loans
      WHERE worker_id = ? AND status = 'ACTIVE'
      LIMIT 1
    `, [workerId]);

    const loanDeduction = activeLoan ? Math.min(activeLoan.monthly_deduction, activeLoan.balance_remaining) : 0;
    const netPayable = Math.max(0, grossWage - (totalAdvances + loanDeduction));

    return res.json({
      worker,
      month: targetMonth,
      summary: {
        daysPresent,
        daysHalf,
        daysAbsent,
        totalWorkedDays: daysPresent + (daysHalf * 0.5),
        grossWage,
        totalAdvances,
        loanDeduction,
        netPayable
      },
      attendanceRecords,
      advances,
      loan: activeLoan || null
    });
  } catch (err) {
    console.error('Worker summary error:', err);
    return res.status(500).json({ error: 'Failed to fetch worker summary' });
  }
});

module.exports = router;
