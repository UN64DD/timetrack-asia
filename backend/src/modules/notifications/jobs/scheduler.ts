import cron from 'node-cron';
import pool from '../../../database/db';
import { NotificationService } from '../services/notification.service';
import { TemplateService } from '../services/template.service';

/**
 * Cleanup expired PENDING registrations
 * Frees up locked slots
 */
const cleanupExpiredRegistrations = async () => {
  console.log('[JOB] Running expired registration cleanup...');
  try {
    const result = await pool.query(
      "UPDATE registrations SET status = 'CANCELLED' WHERE status = 'PENDING' AND expires_at < NOW() RETURNING id"
    );
    if (result.rowCount && result.rowCount > 0) {
      console.log(`[JOB] Cancelled ${result.rowCount} expired registrations`);
    }
  } catch (err) {
    console.error('[JOB ERROR] Cleanup expired registrations:', err);
  }
};

/**
 * Scan for upcoming events and send reminders
 */
const sendEventReminders = async () => {
  console.log('[JOB] Scanning for event reminders...');
  try {
    // 7 days reminder
    const upcomingEvents = await pool.query(
      `SELECT e.id, e.title, e.event_date 
       FROM events e 
       WHERE e.event_date BETWEEN NOW() + INTERVAL '7 days' AND NOW() + INTERVAL '7 days 1 hour'`
    );

    for (const event of upcomingEvents.rows) {
      // Find all paid participants
      const participants = await pool.query(
        `SELECT p.email, p.full_name 
         FROM participants p
         JOIN registrations r ON p.registration_id = r.id
         WHERE r.event_id = $1 AND r.status = 'PAID'`,
        [event.id]
      );

      for (const part of participants.rows) {
        const { subject, html } = await TemplateService.render('event_reminder', {
          participant_name: part.full_name,
          event_name: event.title,
          event_date: event.event_date.toLocaleDateString()
        });
        await NotificationService.sendEmail(null, part.email, 'event_reminder', subject, html);
      }
    }
  } catch (err) {
    console.error('[JOB ERROR] Event reminders:', err);
  }
};

// Schedule Tasks
// Every 5 minutes: Cleanup
cron.schedule('*/5 * * * *', cleanupExpiredRegistrations);

// Every hour: Reminders
cron.schedule('0 * * * *', sendEventReminders);

console.log('[SCHEDULER] Background jobs initialized');
