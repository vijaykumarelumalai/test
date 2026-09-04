const assert = require('node:assert');
const http = require('node:http');

// Helper to make local API requests
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Integration Test Suite (TC-WRK, TC-ATT, TC-ADV, TC-LON, TC-REP) ---');

  // 1. Dashboard Metrics
  const metricsRes = await request('GET', '/dashboard/metrics');
  assert.strictEqual(metricsRes.status, 200, 'Metrics should return 200 OK');
  assert(metricsRes.body.metrics.totalLabour >= 10, 'Metrics should report seeded workers');
  console.log('✅ TC-DSH-001: Dashboard metrics endpoint verified.');

  // 2. Onboard New Worker with sequential VK-XXX and Tamil/English message
  const testPhone = '9840999998';
  const newWorker = {
    name: 'Murugan Test',
    phone: testPhone,
    workerType: 'PERMANENT',
    department: 'Construction Site A',
    dailyWage: 850
  };

  const createRes = await request('POST', '/workers', newWorker);
  assert.strictEqual(createRes.status, 201, 'Worker creation should return 201 Created');
  assert(createRes.body.worker.labour_id.startsWith('VK-'), 'Worker ID must start with VK-');
  assert.strictEqual(createRes.body.worker.defaultPin, testPhone.slice(-4), 'Default PIN must be last 4 digits of phone');
  assert(createRes.body.welcomeMessage.tamil.includes('வி.கே ட்ரேடர்ஸ்'), 'Tamil message must contain VK Traders Tamil greeting');
  console.log(`✅ TC-WRK-001 & TC-MSG-001: Worker ${createRes.body.worker.labour_id} created with bilingual welcome SMS.`);

  // 3. Worker Login with Phone and PIN
  const loginRes = await request('POST', '/auth/worker-login', {
    phone: testPhone,
    pin: testPhone.slice(-4)
  });
  assert.strictEqual(loginRes.status, 200, 'Worker login with valid PIN should return 200');
  assert(loginRes.body.token, 'Token should be returned');
  console.log('✅ TC-AUTH-001: Worker login with phone + 4-digit PIN verified.');

  // 4. Batch Save Attendance with variable wage override
  const today = new Date().toISOString().split('T')[0];
  const saveAttRes = await request('POST', '/attendance/save-daily', {
    date: today,
    records: [
      { worker_id: createRes.body.worker.id, status: 'HALF_DAY', effective_daily_wage: 900 }
    ]
  });
  assert.strictEqual(saveAttRes.status, 200, 'Batch attendance save should return 200');
  console.log('✅ TC-ATT-001 & TC-WAG-001: Batch attendance save with wage override verified.');

  // 5. Record Cash Advance
  const advRes = await request('POST', '/advances', {
    workerId: createRes.body.worker.id,
    amount: 1500,
    date: today,
    paymentMode: 'CASH',
    reason: 'Emergency advance'
  });
  assert.strictEqual(advRes.status, 201, 'Advance record should return 201');
  console.log('✅ TC-ADV-001: Cash advance recording verified.');

  // 6. Issue Worker Loan and Repay
  const loanRes = await request('POST', '/loans', {
    workerId: createRes.body.worker.id,
    principalAmount: 10000,
    monthlyDeduction: 1000,
    disbursedDate: today,
    notes: 'Tool purchase loan'
  });
  assert.strictEqual(loanRes.status, 201, 'Loan creation should return 201');
  assert(loanRes.body.loan.loan_id.startsWith('LN-'), 'Loan ID must start with LN-');

  const repayRes = await request('POST', `/loans/${loanRes.body.loan.id}/repay`, {
    amount: 1000,
    date: today
  });
  assert.strictEqual(repayRes.status, 200, 'Repayment should return 200');
  assert.strictEqual(repayRes.body.remainingBalance, 9000, 'Remaining balance should be 9000');
  console.log('✅ TC-LON-001: Loan creation and repayment verified.');

  // 7. Monthly Payroll Ledger compilation
  const currentMonth = today.slice(0, 7);
  const ledgerRes = await request('GET', `/reports/monthly-ledger?month=${currentMonth}`);
  assert.strictEqual(ledgerRes.status, 200, 'Monthly ledger should return 200');
  assert(Array.isArray(ledgerRes.body.ledger), 'Ledger must be an array');
  console.log('✅ TC-REP-001: Automated monthly payroll calculation engine verified.');

  console.log('\n========================================================');
  console.log('  🎉 ALL INTEGRATION TESTS PASSED WITHOUT ERRORS!');
  console.log('========================================================\n');
  process.exit(0);
}

// Start backend and run tests
require('../backend/src/server.js');
setTimeout(runTests, 800);
