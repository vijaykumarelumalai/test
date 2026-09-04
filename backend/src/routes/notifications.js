const express = require('express');
const router = express.Router();
const { query, run, get } = require('../db');

// 1. Get All Notifications
router.get('/', (req, res) => {
  try {
    const notifications = query('SELECT * FROM notifications ORDER BY id DESC LIMIT 50');
    const unreadCount = get('SELECT count(*) as count FROM notifications WHERE is_read = 0')?.count || 0;
    return res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// 2. Mark Notification as Read
router.put('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    return res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
});

// 3. Mark All Notifications as Read
router.put('/mark-all-read', (req, res) => {
  try {
    run('UPDATE notifications SET is_read = 1');
    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err);
    return res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// 4. Trigger Daily Attendance Check & Create Reminder if Unmarked
router.post('/check-attendance-reminder', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const totalWorkers = get('SELECT count(*) as count FROM workers WHERE is_active = 1')?.count || 0;
    const markedWorkers = get('SELECT count(*) as count FROM attendance WHERE date = ?', [today])?.count || 0;

    const unmarked = totalWorkers - markedWorkers;

    if (unmarked > 0) {
      // Check if reminder already sent today
      const existing = get(`
        SELECT id FROM notifications 
        WHERE type = 'ATTENDANCE_REMINDER' 
        AND date(created_at) = date('now')
      `);

      if (!existing) {
        run(`
          INSERT INTO notifications (type, title, message, tamil_message, is_read)
          VALUES (?, ?, ?, ?, 0)
        `, [
          'ATTENDANCE_REMINDER',
          `Attendance Alert: ${unmarked} Labour Pending`,
          `Today's attendance is pending for ${unmarked} workers. Please mark attendance on time.`,
          `இன்று ${unmarked} தொழிலாளர்களின் வருகை பதிவு செய்யப்படவில்லை. சரியான நேரத்தில் வருகையைப் பதிவு செய்யவும்.`
        ]);
      }

      return res.json({ reminderTriggered: true, unmarkedWorkers: unmarked });
    }

    return res.json({ reminderTriggered: false, unmarkedWorkers: 0, message: 'All attendance marked' });
  } catch (err) {
    console.error('Check attendance reminder error:', err);
    return res.status(500).json({ error: 'Failed to check attendance reminder' });
  }
});

module.exports = router;
