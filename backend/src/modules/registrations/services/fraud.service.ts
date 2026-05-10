import pool from '../../../database/db';

export class FraudService {
  /**
   * Checks if a participant with the same IC/Passport is already registered for this event
   */
  static async checkDuplicateParticipant(eventId: string, icPassport: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `SELECT p.id 
       FROM participants p
       JOIN registrations r ON p.registration_id = r.id
       WHERE r.event_id = $1 AND p.ic_passport = $2 AND r.status IN ('PAID', 'PENDING')`,
      [eventId, icPassport]
    );

    return (rowCount ?? 0) > 0;
  }

  /**
   * Detects rapid multiple registration attempts from the same IP or user
   */
  static async isVelocityLimitExceeded(userId: string): Promise<boolean> {
     // Check audit logs for 'registration_created' in the last 1 minute
     const { rows } = await pool.query(
       "SELECT count(*) FROM audit_logs WHERE user_id = $1 AND action = 'registration_created' AND created_at > NOW() - INTERVAL '1 minute'",
       [userId]
     );
     return parseInt(rows[0].count) > 5;
  }
}
