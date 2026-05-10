import { Request, Response } from 'express';
import pool from '../../../database/db';
import { v4 as uuidv4 } from 'uuid';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const queries = {
      total_users: 'SELECT COUNT(*) FROM users',
      total_organizers: "SELECT COUNT(*) FROM users WHERE role = 'ORGANIZER'",
      total_athletes: "SELECT COUNT(*) FROM users WHERE role = 'ATHLETE'",
      
      total_events: 'SELECT COUNT(*) FROM events',
      draft_events: "SELECT COUNT(*) FROM events WHERE status = 'DRAFT'",
      pending_events: "SELECT COUNT(*) FROM events WHERE status = 'PENDING'",
      approved_events: "SELECT COUNT(*) FROM events WHERE status = 'APPROVED'",
      live_events: "SELECT COUNT(*) FROM events WHERE status = 'LIVE'",
      ended_events: "SELECT COUNT(*) FROM events WHERE status = 'ENDED'",
      
      total_registrations: 'SELECT COUNT(*) FROM registrations',
      today_registrations: "SELECT COUNT(*) FROM registrations WHERE created_at >= CURRENT_DATE",
      
      total_revenue: 'SELECT SUM(total_amount) FROM registrations WHERE status = \'PAID\'',
      today_revenue: "SELECT SUM(total_amount) FROM registrations WHERE status = 'PAID' AND created_at >= CURRENT_DATE",
      
      pending_refunds: "SELECT COUNT(*) FROM refunds WHERE status = 'REFUND_REQUESTED'",
      failed_payments: "SELECT COUNT(*) FROM payments WHERE status = 'FAILED'"
    };

    const stats: any = {};
    for (const [key, query] of Object.entries(queries)) {
      const { rows } = await pool.query(query);
      stats[key] = rows[0].count || rows[0].sum || 0;
    }

    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateEventStatus = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { status, adminNote } = req.body;
  const adminId = req.user!.id;

  const validStatuses = ['APPROVED', 'REJECTED', 'CHANGES_REQUIRED', 'SUSPENDED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update event status
    const eventRes = await client.query(
      'UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING title',
      [status, eventId]
    );

    if (eventRes.rowCount === 0) {
      throw new Error('Event not found');
    }

    // 2. Log action in audit_logs
    await client.query(
      'INSERT INTO audit_logs (user_id, action, module, metadata) VALUES ($1, $2, $3, $4)',
      [adminId, `event_${status.toLowerCase()}`, 'admin', JSON.stringify({ event_id: eventId, note: adminNote })]
    );

    await client.query('COMMIT');
    res.json({ message: `Event ${eventRes.rows[0].title} status updated to ${status}` });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const listAllOrganizers = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, first_name, last_name, email, phone, status, created_at FROM users WHERE role = 'ORGANIZER' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrganizerStatus = async (req: Request, res: Response) => {
  const { organizerId } = req.params;
  const { status } = req.body;
  const adminId = req.user!.id;

  const validStatuses = ['ACTIVE', 'SUSPENDED', 'BANNED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await pool.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 AND role = $3',
      [status, organizerId, 'ORGANIZER']
    );

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, module, metadata) VALUES ($1, $2, $3, $4)',
      [adminId, `organizer_${status.toLowerCase()}`, 'admin', JSON.stringify({ organizer_id: organizerId })]
    );

    res.json({ message: `Organizer status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
