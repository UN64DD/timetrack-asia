import { Request, Response } from 'express';
import pool from '../../../database/db';
import { RankingService } from '../services/ranking.service';
import { CertificateService } from '../services/certificate.service';

export const importResultsCSV = async (req: Request, res: Response) => {
  const { event_id } = req.params;
  const { results } = req.body; // Array of objects: { bib_number, chip_time, gun_time, status }
  const user = req.user!;

  const client = await pool.connect();
  try {
    // 1. Ownership check
    const eventCheck = await client.query('SELECT id, results_finalized FROM events WHERE id = $1 AND organizer_id = $2', [event_id, user.id]);
    if (eventCheck.rowCount === 0) return res.status(403).json({ error: 'Not authorized or event not found' });
    if (eventCheck.rows[0].results_finalized) return res.status(400).json({ error: 'Results already finalized' });

    await client.query('BEGIN');

    for (const row of results) {
      // Find participant by bib
      const partRes = await client.query('SELECT id FROM participants WHERE event_id = $1 AND bib_number = $2', [event_id, row.bib_number]);
      const participant = partRes.rows[0];

      if (!participant) continue; // Skip invalid bibs

      // Upsert result
      await client.query(`
        INSERT INTO results (event_id, participant_id, bib_number, chip_time, gun_time, status, finish_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (participant_id) DO UPDATE SET
          chip_time = EXCLUDED.chip_time,
          gun_time = EXCLUDED.gun_time,
          status = EXCLUDED.status,
          finish_time = EXCLUDED.finish_time,
          updated_at = NOW()
      `, [event_id, participant.id, row.bib_number, row.chip_time, row.gun_time, row.status || 'FINISHED', row.chip_time || row.gun_time]);
    }

    // Recalculate ranks immediately
    await RankingService.calculateRanks(client, event_id);

    await client.query(
      'INSERT INTO audit_logs (user_id, action, module, metadata) VALUES ($1, $2, $3, $4)',
      [user.id, 'results_imported', 'results', JSON.stringify({ event_id, count: results.length })]
    );

    await client.query('COMMIT');
    res.json({ message: 'Results imported and ranks calculated' });

  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const finalizeResults = async (req: Request, res: Response) => {
  const { event_id } = req.params;
  const user = req.user!;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Lock event
    await client.query('UPDATE events SET results_finalized = TRUE WHERE id = $1', [event_id]);

    // 2. Fetch all finished participants to generate certificates
    const resultsRes = await client.query(`
      SELECT 
        r.*, 
        p.full_name, 
        p.id as participant_id, 
        e.title as event_title, 
        ec.name as category
      FROM results r
      JOIN participants p ON r.participant_id = p.id
      JOIN events e ON r.event_id = e.id
      JOIN event_categories ec ON p.category_id = ec.id
      WHERE r.event_id = $1 AND r.status = 'FINISHED'
    `, [event_id]);

    for (const row of resultsRes.rows) {
      const pdfPath = await CertificateService.generateCertificate({
        participant_id: row.participant_id,
        full_name: row.full_name,
        event_title: row.event_title,
        category: row.category,
        finish_time: row.finish_time,
        overall_rank: row.overall_rank
      });

      await client.query('UPDATE results SET certificate_url = $1 WHERE id = $2', [pdfPath, row.id]);
    }

    await client.query(
      'INSERT INTO audit_logs (user_id, action, module, metadata) VALUES ($1, $2, $3, $4)',
      [user.id, 'results_finalized', 'results', JSON.stringify({ event_id })]
    );

    await client.query('COMMIT');
    res.json({ message: 'Results finalized and certificates generated' });

  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
