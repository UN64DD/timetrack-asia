import { Request, Response } from 'express';
import pool from '../../../database/db';
import bcrypt from 'bcrypt';
import { RoleLevel } from '../../../middleware/auth.middleware';

export const inviteStaff = async (req: Request, res: Response) => {
  const { event_id, email, first_name, last_name, password } = req.body;
  const organizerId = req.user!.id;

  try {
    // 1. Verify organizer owns event
    const eventCheck = await pool.query(
      'SELECT id, event_date FROM events WHERE id = $1 AND organizer_id = $2',
      [event_id, organizerId]
    );
    if (eventCheck.rowCount === 0) return res.status(403).json({ error: 'Not authorized' });

    // 2. Create or find user
    const passwordHash = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      `INSERT INTO users (email, first_name, last_name, password_hash, role) 
       VALUES ($1, $2, $3, $4, 'STAFF')
       ON CONFLICT (email) DO UPDATE SET role = 'STAFF'
       RETURNING id`,
      [email, first_name, last_name, passwordHash]
    );
    const staffUserId = userRes.rows[0].id;

    // 3. Assign to event
    // Staff expires 48 hours after event date
    const expiresAt = new Date(eventCheck.rows[0].event_date);
    expiresAt.setHours(expiresAt.getHours() + 48);

    await pool.query(
      `INSERT INTO staff_assignments (event_id, user_id, assigned_by, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (event_id, user_id) DO UPDATE SET expires_at = $4`,
      [event_id, staffUserId, organizerId, expiresAt]
    );

    res.json({ message: 'Staff invited and assigned successfully', staff_id: staffUserId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const listStaff = async (req: Request, res: Response) => {
  const { event_id } = req.params;
  const organizerId = req.user!.id;

  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, sa.expires_at, sa.created_at
       FROM staff_assignments sa
       JOIN users u ON sa.user_id = u.id
       JOIN events e ON sa.event_id = e.id
       WHERE sa.event_id = $1 AND e.organizer_id = $2`,
      [event_id, organizerId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
