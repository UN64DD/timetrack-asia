import { Request, Response } from 'express';
import pool from '../../../database/db';
import crypto from 'crypto';
import { RoleLevel } from '../../../middleware/auth.middleware';

/**
 * Validates a signed QR token server-side
 */
const validateQRToken = (token: string, participantId: string, eventId: string): boolean => {
  const secret = process.env.QR_SECRET || 'fallback_secret';
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(`${participantId}:${eventId}`)
    .digest('hex');
  
  return token === expectedHash;
};

export const validateScan = async (req: Request, res: Response) => {
  const { qr_token, participant_id, event_id } = req.body;
  const user = req.user!;

  try {
    // 1. Verify Staff/Organizer permission for this event
    if (user.role > RoleLevel.ADMIN) {
      const assignment = await pool.query(
        'SELECT id FROM staff_assignments WHERE user_id = $1 AND event_id = $2 AND (expires_at IS NULL OR expires_at > NOW())',
        [user.id, event_id]
      );
      
      const isOrganizer = await pool.query(
        'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
        [event_id, user.id]
      );

      if (assignment.rowCount === 0 && isOrganizer.rowCount === 0) {
        return res.status(403).json({ error: 'Not authorized for this event' });
      }
    }

    // 2. Validate QR Payload integrity
    if (!validateQRToken(qr_token, participant_id, event_id)) {
      return res.status(400).json({ error: 'Invalid QR token signature' });
    }

    // 3. Fetch Participant and validate status
    const partRes = await pool.query(
      `SELECT p.id, p.full_name, p.bib_number, p.check_in_time, p.checked_in_by,
              r.status as reg_status, e.status as event_status, ec.name as category
       FROM participants p
       JOIN registrations r ON p.registration_id = r.id
       JOIN events e ON r.event_id = e.id
       JOIN event_categories ec ON p.category_id = ec.id
       WHERE p.id = $1 AND e.id = $2`,
      [participant_id, event_id]
    );

    const participant = partRes.rows[0];
    if (!participant) return res.status(404).json({ error: 'Participant not found' });

    // 4. Security checks
    if (participant.reg_status !== 'PAID') return res.status(400).json({ error: 'Registration not paid' });
    if (participant.event_status !== 'LIVE' && participant.event_status !== 'APPROVED') {
       return res.status(400).json({ error: 'Event is not active' });
    }

    // 5. Duplicate Check
    if (participant.check_in_time) {
      const staffRes = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [participant.checked_in_by]);
      const staffName = staffRes.rows[0] ? `${staffRes.rows[0].first_name} ${staffRes.rows[0].last_name}` : 'Unknown';
      
      return res.status(409).json({ 
        error: 'Already checked in',
        check_in_time: participant.check_in_time,
        checked_in_by: staffName
      });
    }

    res.json({
      message: 'Validation successful',
      participant: {
        id: participant.id,
        full_name: participant.full_name,
        bib_number: participant.bib_number,
        category: participant.category
      }
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const confirmCheckIn = async (req: Request, res: Response) => {
  const { participant_id } = req.params;
  const user = req.user!;

  try {
    const result = await pool.query(
      "UPDATE participants SET check_in_time = NOW(), checked_in_by = $1 WHERE id = $2 AND check_in_time IS NULL RETURNING id",
      [user.id, participant_id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Check-in failed or already completed' });
    }

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, module, metadata) VALUES ($1, $2, $3, $4)',
      [user.id, 'participant_checked_in', 'race_day', JSON.stringify({ participant_id })]
    );

    res.json({ message: 'Participant checked in successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAttendanceStats = async (req: Request, res: Response) => {
  const { event_id } = req.params;
  
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_registered,
        COUNT(check_in_time) as checked_in_count,
        COUNT(*) FILTER (WHERE check_in_time IS NULL) as not_checked_in_count,
        COUNT(*) FILTER (WHERE gender = 'MALE') as male_count,
        COUNT(*) FILTER (WHERE gender = 'FEMALE') as female_count
      FROM participants p
      JOIN registrations r ON p.registration_id = r.id
      WHERE r.event_id = $1 AND r.status = 'PAID'
    `, [event_id]);

    res.json(stats.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const manualSearch = async (req: Request, res: Response) => {
  const { event_id } = req.params;
  const { query } = req.query;

  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.full_name, p.bib_number, p.check_in_time, ec.name as category
      FROM participants p
      JOIN registrations r ON p.registration_id = r.id
      JOIN event_categories ec ON p.category_id = ec.id
      WHERE r.event_id = $1 AND r.status = 'PAID'
      AND (p.full_name ILIKE $2 OR p.bib_number ILIKE $2 OR r.registration_number ILIKE $2 OR p.phone ILIKE $2)
      LIMIT 10
    `, [event_id, `%${query}%`]);

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMedicalAccess = async (req: Request, res: Response) => {
  const { participant_id } = req.params;
  const user = req.user!;

  // Restricted to Organizer/Admin
  if (user.role > RoleLevel.ORGANIZER) {
    return res.status(403).json({ error: 'Insufficient permissions for medical access' });
  }

  try {
    const { rows } = await pool.query(
      "SELECT full_name, medical_status, medical_details, emergency_name, emergency_phone FROM participants WHERE id = $1",
      [participant_id]
    );

    // LOG ACCESS (MANDATORY)
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, module, metadata) VALUES ($1, $2, $3, $4)',
      [user.id, 'medical_access', 'race_day', JSON.stringify({ participant_id })]
    );

    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
