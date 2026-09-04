const express = require('express');
const router = express.Router();
const { query, get, run, db } = require('../db');

// 1. Monthly Payroll Summary Ledger
router.get('/monthly-ledger', (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const activeWorkers = query('SELECT * FROM workers WHERE is_active = 1 ORDER BY id ASC');

    const ledger = activeWorkers.map(w => {
      // 1. Attendance for month
      const attRecords = query(`
        SELECT status, wage_factor, effective_daily_wage, earned_amount 
        FROM attendance 
        WHERE worker_id = ? AND strftime('%Y-%m', date) = ?
      `, [w.id, targetMonth]);

      let daysPresent = 0;
      let daysHalf = 0;
      let daysAbsent = 0;
      let grossWage = 0;

      for (const att of attRecords) {
        if (att.status === 'PRESENT') {
          daysPresent++;
          grossWage += att.earned_amount;
        } else if (att.status === 'HALF_DAY') {
          daysHalf++;
          grossWage += att.earned_amount;
        } else if (att.status === 'ABSENT') {
          daysAbsent++;
        }
      }

      // 2. Advances taken in this month
      const advancesTotal = get(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM advances 
        WHERE worker_id = ? AND strftime('%Y-%m', date) = ?
      `, [w.id, targetMonth])?.total || 0;

      // 3. Active loan deduction (if any)
      const activeLoan = get(`
        SELECT id, loan_id, monthly_deduction, balance_remaining 
        FROM loans 
        WHERE worker_id = ? AND status = 'ACTIVE'
        LIMIT 1
      `, [w.id]);

      let loanDeduction = 0;
      if (activeLoan && activeLoan.monthly_deduction > 0) {
        loanDeduction = Math.min(activeLoan.monthly_deduction, activeLoan.balance_remaining);
      }

      const totalDeductions = advancesTotal + loanDeduction;
      const netPayable = Math.max(0, grossWage - totalDeductions);

      return {
        workerId: w.id,
        labourId: w.labour_id,
        name: w.name,
        phone: w.phone,
        workerType: w.worker_type,
        department: w.department,
        dailyWage: w.daily_wage,
        daysPresent,
        daysHalf,
        daysAbsent,
        totalDaysWorked: daysPresent + (daysHalf * 0.5),
        grossWage,
        advancesDeducted: advancesTotal,
        loanDeducted: loanDeduction,
        netPayable
      };
    });

    const totals = ledger.reduce((acc, row) => ({
      grossWage: acc.grossWage + row.grossWage,
      advances: acc.advances + row.advancesDeducted,
      loans: acc.loans + row.loanDeducted,
      netPayable: acc.netPayable + row.netPayable
    }), { grossWage: 0, advances: 0, loans: 0, netPayable: 0 });

    return res.json({
      month: targetMonth,
      company: 'VK Traders',
      ledger,
      totals
    });
  } catch (err) {
    console.error('Monthly ledger error:', err);
    return res.status(500).json({ error: 'Failed to compile monthly ledger' });
  }
});

// 2. CSV Export Endpoint
router.get('/export-csv', (req, res) => {
  try {
    const { month } = req.query;
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    // Reuse calculation logic
    const activeWorkers = query('SELECT * FROM workers WHERE is_active = 1 ORDER BY id ASC');

    let csvContent = 'Labour ID,Name,Phone,Type,Department,Daily Wage,Present Days,Half Days,Absent Days,Total Worked Days,Gross Wage (INR),Advances (INR),Loan Deduction (INR),Net Payable (INR)\n';

    for (const w of activeWorkers) {
      const attRecords = query(`
        SELECT status, earned_amount 
        FROM attendance 
        WHERE worker_id = ? AND strftime('%Y-%m', date) = ?
      `, [w.id, targetMonth]);

      let daysPresent = 0;
      let daysHalf = 0;
      let daysAbsent = 0;
      let gross = 0;

      for (const a of attRecords) {
        if (a.status === 'PRESENT') { daysPresent++; gross += a.earned_amount; }
        else if (a.status === 'HALF_DAY') { daysHalf++; gross += a.earned_amount; }
        else if (a.status === 'ABSENT') { daysAbsent++; }
      }

      const advances = get(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM advances 
        WHERE worker_id = ? AND strftime('%Y-%m', date) = ?
      `, [w.id, targetMonth])?.total || 0;

      const activeLoan = get(`
        SELECT monthly_deduction, balance_remaining 
        FROM loans 
        WHERE worker_id = ? AND status = 'ACTIVE' LIMIT 1
      `, [w.id]);

      const loanDeduct = activeLoan ? Math.min(activeLoan.monthly_deduction, activeLoan.balance_remaining) : 0;
      const net = Math.max(0, gross - (advances + loanDeduct));
      const totalDays = daysPresent + (daysHalf * 0.5);

      csvContent += `"${w.labour_id}","${w.name}","${w.phone}","${w.worker_type}","${w.department}",${w.daily_wage},${daysPresent},${daysHalf},${daysAbsent},${totalDays},${gross},${advances},${loanDeduct},${net}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="VK_Traders_Payroll_${targetMonth}.csv"`);
    return res.send(csvContent);
  } catch (err) {
    console.error('Export CSV error:', err);
    return res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;
