import { Request, Response } from 'express';
import pool from '../../../database/db';
import { Parser } from 'json2csv';
import { RoleLevel } from '../../../middleware/auth.middleware';

export const exportRegistrations = async (req: Request, res: Response) => {
  const { event_id } = req.query;
  const user = req.user!;
  
  try {
    let query = `
      SELECT 
        e.title as event_name,
        ec.name as category,
        r.registration_number,
        r.status as payment_status,
        bd.first_name as billing_name,
        bd.email as billing_email,
        bd.phone as billing_phone,
        p.full_name as participant_name,
        p.bib_name,
        p.bib_number,
        p.email as participant_email,
        p.phone as participant_phone,
        p.gender,
        p.ic_passport as passport_ic,
        p.dob,
        p.age,
        p.address,
        p.postcode,
        p.country,
        p.medical_status,
        p.medical_details,
        p.emergency_name,
        p.emergency_phone,
        r.total_amount as payment_amount,
        r.created_at as payment_date
      FROM participants p
      JOIN registrations r ON p.registration_id = r.id
      JOIN event_categories ec ON p.category_id = ec.id
      JOIN events e ON r.event_id = e.id
      JOIN billing_details bd ON r.id = bd.registration_id
    `;

    const queryParams: any[] = [];
    
    // Ownership validation
    if (user.role === RoleLevel.ORGANIZER) {
      if (!event_id) {
        return res.status(400).json({ error: 'Organizer must specify event_id' });
      }
      query += ` WHERE e.organizer_id = $1 AND e.id = $2`;
      queryParams.push(user.id, event_id);
    } else if (user.role <= RoleLevel.ADMIN) {
      if (event_id) {
        query += ` WHERE e.id = $1`;
        queryParams.push(event_id);
      }
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows } = await pool.query(query, queryParams);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(rows);

    res.header('Content-Type', 'text/csv');
    res.attachment(`registrations_${event_id || 'all'}_${Date.now()}.csv`);
    res.send(csv);

    // Log export
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, module, metadata) VALUES ($1, $2, $3, $4)',
      [user.id, 'csv_exported', 'admin', JSON.stringify({ event_id: event_id || 'all', record_count: rows.length })]
    );

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
