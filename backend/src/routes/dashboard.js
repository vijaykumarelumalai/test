const express = require('express');
const router = express.Router();
const { query, get } = require('../db');

router.get('/metrics', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7); // YYYY-MM

    // 1. Total, Permanent, Temporary Labour
    const totalWorkers = get('SELECT count(*) as count FROM workers WHERE is_active = 1')?.count || 0;
    const permWorkers = get("SELECT count(*) as count FROM workers WHERE is_active = 1 AND worker_type = 'PERMANENT'")?.count || 0;
    const tempWorkers = get("SELECT count(*) as count FROM workers WHERE is_active = 1 AND worker_type = 'TEMPORARY'")?.count || 0;

    // 2. Gross Wages for Current Month (Σ earned_amount)
    const monthlyGross = get(`
      SELECT COALESCE(SUM(earned_amount), 0) as total 
      FROM attendance 
      WHERE strftime('%Y-%m', date) = ?
    `, [currentMonth])?.total || 0;

    // 3. Total Advances & Active Loans
    const totalAdvances = get(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM advances 
      WHERE strftime('%Y-%m', date) = ?
    `, [currentMonth])?.total || 0;

    const totalActiveLoans = get(`
      SELECT COALESCE(SUM(balance_remaining), 0) as total 
      FROM loans 
      WHERE status = 'ACTIVE'
    `)?.total || 0;

    // 4. Today's Attendance Breakdown
    const todayAttendance = query(`
      SELECT status, count(*) as count 
      FROM attendance 
      WHERE date = ? 
      GROUP BY status
    `, [today]);

    let present = 0;
    let absent = 0;
    let halfDay = 0;

    for (const row of todayAttendance) {
      if (row.status === 'PRESENT') present = row.count;
      else if (row.status === 'ABSENT') absent = row.count;
      else if (row.status === 'HALF_DAY') halfDay = row.count;
    }

    const markedCount = present + absent + halfDay;
    const unmarked = Math.max(0, totalWorkers - markedCount);

    return res.json({
      metrics: {
        totalLabour: totalWorkers,
        permanentLabour: permWorkers,
        temporaryLabour: tempWorkers,
        monthlyGrossWages: monthlyGross,
        totalAdvances: totalAdvances,
        totalActiveLoans: totalActiveLoans,
        todayAttendance: {
          total: totalWorkers,
          present,
          absent,
          halfDay,
          unmarked
        }
      }
    });
  } catch (err) {
    console.error('Dashboard metrics error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

router.get('/recent-activity', (req, res) => {
  try {
    // Recent Labour Added (last 5)
    const recentLabour = query(`
      SELECT id, labour_id, name, worker_type, department, joining_date 
      FROM workers 
      ORDER BY id DESC 
      LIMIT 5
    `);

    // Recent Payments / Advances (last 5)
    const recentAdvances = query(`
      SELECT a.id, w.name, a.amount, a.date, a.payment_mode, a.reason 
      FROM advances a
      JOIN workers w ON a.worker_id = w.id
      ORDER BY a.id DESC 
      LIMIT 5
    `);

    // Active Loans / Pending Advances (last 5)
    const activeLoans = query(`
      SELECT l.id, l.loan_id, w.name, l.principal_amount, l.balance_remaining, l.disbursed_date
      FROM loans l
      JOIN workers w ON l.worker_id = w.id
      WHERE l.status = 'ACTIVE'
      ORDER BY l.id DESC 
      LIMIT 5
    `);

    return res.json({
      recentLabour,
      recentAdvances,
      activeLoans
    });
  } catch (err) {
    console.error('Recent activity error:', err);
    return res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

module.exports = router;
