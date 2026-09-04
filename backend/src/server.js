require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const cron = require('node-cron');
const { query, run, get } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Register API Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/workers', require('./routes/workers'));
app.use('/api/v1/attendance', require('./routes/attendance'));
app.use('/api/v1/advances', require('./routes/advances'));
app.use('/api/v1/loans', require('./routes/loans'));
app.use('/api/v1/reports', require('./routes/reports'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/labour', require('./routes/labour'));
app.use('/api/v1/settings', require('./routes/settings'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), system: 'VK Traders API' });
});

// Serve frontend static build in production
const frontendBuildPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  const indexPath = path.join(frontendBuildPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) next();
  });
});

// -------------------------------------------------------------
// CRON SCHEDULER ENGINE
// -------------------------------------------------------------

// 1. Morning Attendance Reminder (9:00 AM every day)
cron.schedule('0 9 * * *', () => {
  console.log('[CRON] Executing Morning Attendance Reminder check at 09:00 AM...');
  try {
    const today = new Date().toISOString().split('T')[0];
    const totalWorkers = get('SELECT count(*) as count FROM workers WHERE is_active = 1')?.count || 0;
    const marked = get('SELECT count(*) as count FROM attendance WHERE date = ?', [today])?.count || 0;
    const unmarked = totalWorkers - marked;

    if (unmarked > 0) {
      run(`
        INSERT INTO notifications (type, title, message, tamil_message, is_read)
        VALUES ('ATTENDANCE_REMINDER', 'Morning Attendance Reminder (9:00 AM)', ?, ?, 0)
      `, [
        `Good Morning! ${unmarked} worker attendance entries are pending for today. Please mark on time.`,
        `காலை வணக்கம்! இன்று ${unmarked} தொழிலாளர்களின் வருகைப் பதிவு நிலுவையில் உள்ளது. சரியான நேரத்தில் பதிவு செய்யவும்.`
      ]);
      console.log(`[CRON] Morning alert emitted for ${unmarked} unmarked workers.`);
    }
  } catch (err) {
    console.error('[CRON] Morning check error:', err);
  }
});

// 2. Evening/Night Attendance Reminder (8:00 PM every day)
cron.schedule('0 20 * * *', () => {
  console.log('[CRON] Executing Night Attendance Reminder check at 08:00 PM...');
  try {
    const today = new Date().toISOString().split('T')[0];
    const totalWorkers = get('SELECT count(*) as count FROM workers WHERE is_active = 1')?.count || 0;
    const marked = get('SELECT count(*) as count FROM attendance WHERE date = ?', [today])?.count || 0;
    const unmarked = totalWorkers - marked;

    if (unmarked > 0) {
      run(`
        INSERT INTO notifications (type, title, message, tamil_message, is_read)
        VALUES ('ATTENDANCE_REMINDER', 'Night Attendance Final Call (8:00 PM)', ?, ?, 0)
      `, [
        `Daily Closing Alert: ${unmarked} labour attendance records still unrecorded for today. Please finalize now.`,
        `இன்றைய இறுதி வருகைப் பதிவு எச்சரிக்கை: ${unmarked} தொழிலாளர்களின் வருகை பதிவு செய்யப்படவில்லை. தயவுசெய்து இப்போது பூர்த்தி செய்யவும்.`
      ]);
      console.log(`[CRON] Night alert emitted for ${unmarked} unmarked workers.`);
    }
  } catch (err) {
    console.error('[CRON] Night check error:', err);
  }
});

// 3. Month-End Automated Payroll Snapshot (Runs on 28th-31st at 23:55)
cron.schedule('55 23 28-31 * *', () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Check if today is the actual last day of the month
  if (tomorrow.getDate() === 1) {
    const monthYear = today.toISOString().slice(0, 7);
    console.log(`[CRON] Month-end detected on ${today.toISOString().split('T')[0]}! Generating automated payroll snapshot for ${monthYear}...`);
    try {
      run(`
        INSERT INTO notifications (type, title, message, tamil_message, is_read)
        VALUES ('MONTH_END_REPORT', ?, ?, ?, 0)
      `, [
        `Month-End Payroll Generated (${monthYear})`,
        `The automated monthly wage and deduction report for ${monthYear} is compiled and ready for download.`,
        `${monthYear} மாதாந்திர சம்பள அறிக்கை தானாக தொகுக்கப்பட்டு பதிவிறக்கம் செய்ய தயாராக உள்ளது.`
      ]);
    } catch (err) {
      console.error('[CRON] Month-end report error:', err);
    }
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  VK Traders Labour Management System Server`);
  console.log(`  API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`  Status: Running (Node v${process.version})`);
  console.log(`======================================================\n`);
});
