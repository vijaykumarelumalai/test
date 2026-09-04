const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const { query, get, run } = require('../db');

function hashPin(pin) {
  return crypto.createHash('sha256').update(`vktraders_salt_${pin}`).digest('hex');
}

// Helper: Generate next VK-XXX ID atomically
function generateNextLabourId() {
  const latest = query("SELECT labour_id FROM workers WHERE labour_id LIKE 'VK-%' ORDER BY id DESC LIMIT 1");
  if (!latest || latest.length === 0) {
    return 'VK-001';
  }
  const lastId = latest[0].labour_id;
  const match = lastId.match(/VK-(\d+)/);
  if (match) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `VK-${String(nextNum).padStart(3, '0')}`;
  }
  return 'VK-001';
}

// 0. Get Distinct Departments
router.get('/departments', (req, res) => {
  try {
    const rows = query('SELECT DISTINCT department FROM workers WHERE department IS NOT NULL AND department != "" ORDER BY department ASC');
    const departments = rows.map(r => r.department);
    return res.json({ departments });
  } catch (err) {
    console.error('Fetch departments error:', err);
    return res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// 1. Get All Workers
router.get('/', (req, res) => {
  try {
    const { type, search, department } = req.query;
    let sql = 'SELECT * FROM workers WHERE is_active = 1';
    const params = [];

    if (type && type !== 'ALL') {
      sql += ' AND worker_type = ?';
      params.push(type.toUpperCase());
    }

    if (department && department !== 'ALL') {
      sql += ' AND department = ?';
      params.push(department);
    }

    if (search && search.trim()) {
      sql += ' AND (name LIKE ? OR labour_id LIKE ? OR phone LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY id ASC';
    const rawWorkers = query(sql, params);
    const workers = rawWorkers.map(w => ({
      ...w,
      login_pin: w.phone ? w.phone.slice(-4) : '0000'
    }));
    return res.json({ workers });
  } catch (err) {
    console.error('Fetch workers error:', err);
    return res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// 2. Add New Worker (Auto-generates VK-XXX, default PIN, and bilingual welcome message)
router.post('/', (req, res) => {
  try {
    const { name, phone, workerType, department, dailyWage, emergencyContact, joiningDate } = req.body;

    if (!name || !phone || !dailyWage) {
      return res.status(400).json({ error: 'Name, Phone, and Daily Wage Rate are required' });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    // Check duplicate phone
    const existing = get('SELECT id FROM workers WHERE phone = ? AND is_active = 1', [cleanPhone]);
    if (existing) {
      return res.status(409).json({ error: 'A worker with this phone number already exists' });
    }

    const nextLabourId = generateNextLabourId();
    const defaultPin = cleanPhone.slice(-4);
    const pinHash = hashPin(defaultPin);
    const today = joiningDate || new Date().toISOString().split('T')[0];
    const type = (workerType || 'PERMANENT').toUpperCase();
    const dept = department || 'General Site';
    const wage = parseFloat(dailyWage);

    run(`
      INSERT INTO workers (labour_id, name, phone, worker_type, department, daily_wage, pin_hash, joining_date, emergency_contact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [nextLabourId, name.trim(), cleanPhone, type, dept, wage, pinHash, today, emergencyContact || null]);

    const createdWorker = get('SELECT * FROM workers WHERE labour_id = ?', [nextLabourId]);

    // Fetch company name from settings dynamically
    const compSetting = get("SELECT value FROM system_settings WHERE key = 'company_name'");
    const companyName = compSetting?.value || 'VK Traders';

    // Prepare Bilingual Welcome Message
    let englishMsg = '';
    let tamilMsg = '';

    if (type === 'PERMANENT') {
      englishMsg = `You are onboarded as a permanent worker at ${companyName}. Welcome to the ${companyName} family! Have a good day. Your ID: ${nextLabourId}, PIN: ${defaultPin}.`;
      tamilMsg = `நீங்கள் வி.கே ட்ரேடர்ஸில் நிரந்தரப் பணியாளராக சேர்க்கப்பட்டுள்ளீர்கள். வி.கே ட்ரேடர்ஸ் குடும்பத்திற்கு உங்களை அன்புடன் வரவேற்கிறோம்! இனிய நாளாக அமையட்டும். உங்கள் பணியாளர் எண்: ${nextLabourId}, பின்: ${defaultPin}.`;
    } else {
      englishMsg = `Welcome to ${companyName}! You are registered as temporary daily-wage labour. Your ID: ${nextLabourId}, PIN: ${defaultPin}.`;
      tamilMsg = `வி.கே ட்ரேடர்ஸுக்கு உங்களை வரவேற்கிறோம்! நீங்கள் தற்காலிக தினசரி கூலி பணியாளராக பதிவு செய்யப்பட்டுள்ளீர்கள். உங்கள் பணியாளர் எண்: ${nextLabourId}, பின்: ${defaultPin}.`;
    }

    const fullMessage = `${englishMsg}\n\n${tamilMsg}`;
    const whatsAppUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(fullMessage)}`;

    // Log notification
    run(`
      INSERT INTO notifications (type, title, message, tamil_message, is_read)
      VALUES (?, ?, ?, ?, ?)
    `, [
      'ONBOARDING',
      `New Labour Onboarded: ${name} (${nextLabourId})`,
      englishMsg,
      tamilMsg,
      0
    ]);

    return res.status(201).json({
      worker: {
        ...createdWorker,
        defaultPin
      },
      welcomeMessage: {
        english: englishMsg,
        tamil: tamilMsg,
        fullText: fullMessage,
        whatsAppUrl
      }
    });
  } catch (err) {
    console.error('Create worker error:', err);
    return res.status(500).json({ error: 'Failed to create worker' });
  }
});

// 3. Update Worker
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, workerType, department, dailyWage, is_active } = req.body;

    const existing = get('SELECT * FROM workers WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    run(`
      UPDATE workers 
      SET name = COALESCE(?, name),
          worker_type = COALESCE(?, worker_type),
          department = COALESCE(?, department),
          daily_wage = COALESCE(?, daily_wage),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, workerType, department, dailyWage, is_active, id]);

    const updated = get('SELECT * FROM workers WHERE id = ?', [id]);
    return res.json({ worker: updated });
  } catch (err) {
    console.error('Update worker error:', err);
    return res.status(500).json({ error: 'Failed to update worker' });
  }
});

// 4. Soft Delete Worker
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    run('UPDATE workers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return res.json({ message: 'Worker deactivated successfully' });
  } catch (err) {
    console.error('Delete worker error:', err);
    return res.status(500).json({ error: 'Failed to deactivate worker' });
  }
});

module.exports = router;
