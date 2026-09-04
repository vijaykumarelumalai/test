const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');

function generateNextLoanId() {
  const latest = query("SELECT loan_id FROM loans WHERE loan_id LIKE 'LN-%' ORDER BY id DESC LIMIT 1");
  if (!latest || latest.length === 0) return 'LN-001';
  const match = latest[0].loan_id.match(/LN-(\d+)/);
  if (match) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `LN-${String(nextNum).padStart(3, '0')}`;
  }
  return 'LN-001';
}

// 1. Get Loans List with S.No, loan_provided_from, principal, interest, total, and balance
router.get('/', (req, res) => {
  try {
    const { status, workerId } = req.query;
    let sql = `
      SELECT 
        l.id,
        l.loan_id,
        l.worker_id,
        w.labour_id,
        w.name as worker_name,
        w.phone as worker_phone,
        w.worker_type,
        COALESCE(l.loan_provided_from, 'VK Traders') as loan_provided_from,
        l.principal_amount,
        COALESCE(l.interest_amount, 0) as interest_amount,
        COALESCE(l.total_payable, l.principal_amount) as total_payable,
        l.disbursed_date,
        l.monthly_deduction,
        l.balance_remaining,
        l.status,
        l.notes,
        l.created_at
      FROM loans l
      JOIN workers w ON l.worker_id = w.id
      WHERE 1 = 1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND l.status = ?';
      params.push(status);
    }

    if (workerId) {
      sql += ' AND l.worker_id = ?';
      params.push(workerId);
    }

    sql += ' ORDER BY l.id ASC';
    const rawLoans = query(sql, params);

    // Add auto-generated sequential S.No (1, 2, 3...)
    const loans = rawLoans.map((loan, idx) => ({
      ...loan,
      s_no: idx + 1
    }));

    const totalActiveBalance = loans
      .filter(l => l.status === 'ACTIVE')
      .reduce((sum, l) => sum + (parseFloat(l.balance_remaining) || 0), 0);

    const totalPrincipal = loans.reduce((sum, l) => sum + (parseFloat(l.principal_amount) || 0), 0);
    const totalInterest = loans.reduce((sum, l) => sum + (parseFloat(l.interest_amount) || 0), 0);

    return res.json({ 
      loans, 
      totalActiveBalance,
      totalPrincipal,
      totalInterest
    });
  } catch (err) {
    console.error('Fetch loans error:', err);
    return res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// 2. Add Loan (Renamed from Issue Loan per client requirement)
router.post('/', (req, res) => {
  try {
    const { 
      workerId, 
      loanProvidedFrom, 
      principalAmount, 
      interestAmount, 
      disbursedDate, 
      monthlyDeduction, 
      notes 
    } = req.body;

    if (!workerId || !principalAmount || parseFloat(principalAmount) <= 0) {
      return res.status(400).json({ error: 'Worker and principal amount are required' });
    }

    const worker = get('SELECT id, name FROM workers WHERE id = ?', [workerId]);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const loanId = generateNextLoanId();
    const principal = parseFloat(principalAmount);
    const interest = parseFloat(interestAmount) || 0;
    const totalPayable = principal + interest;
    const deduction = parseFloat(monthlyDeduction) || 0;
    const date = disbursedDate || new Date().toISOString().split('T')[0];
    const source = (loanProvidedFrom && loanProvidedFrom.trim()) || 'VK Traders';

    run(`
      INSERT INTO loans (
        worker_id, 
        loan_id, 
        loan_provided_from, 
        principal_amount, 
        interest_amount, 
        total_payable, 
        disbursed_date, 
        monthly_deduction, 
        balance_remaining, 
        status, 
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `, [
      workerId, 
      loanId, 
      source, 
      principal, 
      interest, 
      totalPayable, 
      date, 
      deduction, 
      totalPayable, 
      notes || ''
    ]);

    const createdLoan = get('SELECT * FROM loans WHERE loan_id = ?', [loanId]);
    return res.status(201).json({ loan: createdLoan, message: `Loan ${loanId} added successfully` });
  } catch (err) {
    console.error('Add loan error:', err);
    return res.status(500).json({ error: 'Failed to add loan' });
  }
});

// 3. Record Loan Repayment
router.post('/:id/repay', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date, notes } = req.body;

    const loan = get('SELECT * FROM loans WHERE id = ?', [id]);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const repayAmount = parseFloat(amount);
    if (!repayAmount || repayAmount <= 0) {
      return res.status(400).json({ error: 'Valid repayment amount is required' });
    }

    const newBalance = Math.max(0, loan.balance_remaining - repayAmount);
    const newStatus = newBalance === 0 ? 'PAID_OFF' : 'ACTIVE';
    const repDate = date || new Date().toISOString().split('T')[0];

    run(`
      INSERT INTO loan_repayments (loan_id, date, amount_deducted, remaining_after, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [id, repDate, repayAmount, newBalance, notes || '']);

    run(`
      UPDATE loans
      SET balance_remaining = ?, status = ?
      WHERE id = ?
    `, [newBalance, newStatus, id]);

    return res.json({ message: 'Repayment recorded successfully', remainingBalance: newBalance, status: newStatus });
  } catch (err) {
    console.error('Repay loan error:', err);
    return res.status(500).json({ error: 'Failed to process repayment' });
  }
});

module.exports = router;
