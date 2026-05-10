import { Request, Response } from 'express';
import pool from '../../../database/db';

export const getPublicLeaderboard = async (req: Request, res: Response) => {
  const { event_id } = req.params;
  const { category_id, gender, search } = req.query;

  try {
    let query = `
      SELECT 
        r.overall_rank, 
        r.gender_rank, 
        r.category_rank, 
        r.bib_number, 
        p.bib_name, 
        ec.name as category, 
        r.finish_time, 
        r.status,
        r.certificate_url
      FROM results r
      JOIN participants p ON r.participant_id = p.id
      JOIN event_categories ec ON p.category_id = ec.id
      WHERE r.event_id = $1
    `;
    const params: any[] = [event_id];

    if (category_id) {
      params.push(category_id);
      query += ` AND p.category_id = $${params.length}`;
    }
    if (gender) {
      params.push(gender);
      query += ` AND p.gender = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.full_name ILIKE $${params.length} OR r.bib_number ILIKE $${params.length})`;
    }

    query += ` ORDER BY r.overall_rank ASC NULLS LAST, r.bib_number ASC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getParticipantResult = async (req: Request, res: Response) => {
  const { participant_id } = req.params;

  try {
    const { rows } = await pool.query(`
      SELECT 
        r.*, 
        p.full_name, 
        e.title as event_title, 
        ec.name as category
      FROM results r
      JOIN participants p ON r.participant_id = p.id
      JOIN events e ON r.event_id = e.id
      JOIN event_categories ec ON p.category_id = ec.id
      WHERE p.id = $1
    `, [participant_id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Result not found' });
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
