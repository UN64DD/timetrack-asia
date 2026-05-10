import { Request, Response } from 'express';
import pool from '../../../database/db';
import { v4 as uuidv4 } from 'uuid';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const organizer_id = req.user!.id;
    const { rows } = await pool.query(
      'SELECT * FROM events WHERE organizer_id = $1 ORDER BY created_at DESC',
      [organizer_id]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPublicEvents = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM events WHERE status IN ('LIVE', 'APPROVED') ORDER BY event_date ASC`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPublicEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Fetch event details
    const eventQuery = await pool.query(
      `SELECT * FROM events WHERE id = $1 AND status IN ('LIVE', 'APPROVED')`,
      [id]
    );

    if (eventQuery.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found or not public' });
    }

    const event = eventQuery.rows[0];

    // Fetch categories/variants
    const variantsQuery = await pool.query(
      `SELECT * FROM event_categories WHERE event_id = $1`,
      [id]
    );

    event.event_variants = variantsQuery.rows.map(v => ({
      id: v.id,
      price: v.base_price,
      attributes: {
        'attribute_category-event': v.name
      }
    }));

    res.json(event);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const organizer_id = req.user!.id;
    const { title, description, location, date, category, status, banner_image, variants, registration_config } = req.body;

    if (!title || !date) {
      throw new Error('Title and event date are required');
    }

    const eventId = uuidv4();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
    
    // Map frontend status to backend status
    let dbStatus = 'DRAFT';
    if (status && status.toUpperCase() === 'PUBLISHED') dbStatus = 'PENDING';
    else if (status && status.toUpperCase() === 'CLOSED') dbStatus = 'ENDED';

    const eventResult = await client.query(
      `INSERT INTO events (id, organizer_id, title, slug, description, venue_name, event_date, registration_open, registration_close, status, banner_image) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [eventId, organizer_id, title, slug, description, location, date, new Date(), date, dbStatus, banner_image]
    );

    // Insert variants as event_categories
    if (variants && variants.length > 0) {
      for (const v of variants) {
        await client.query(
          `INSERT INTO event_categories (id, event_id, name, base_price) VALUES ($1, $2, $3, $4)`,
          [uuidv4(), eventId, v.name || category, v.price || 0]
        );
      }
    } else {
      await client.query(
        `INSERT INTO event_categories (id, event_id, name, base_price) VALUES ($1, $2, $3, $4)`,
        [uuidv4(), eventId, category || 'General', 0]
      );
    }

    // Log the action
    await client.query(
      `INSERT INTO audit_logs (id, user_id, action, module, metadata) VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), organizer_id, 'event_created', 'organizer_events', JSON.stringify({ event_id: eventId })]
    );

    await client.query('COMMIT');
    res.status(201).json(eventResult.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const organizer_id = req.user!.id;
    const event_id = req.params.id;

    // Validate ownership and status
    const eventCheck = await pool.query('SELECT organizer_id, status FROM events WHERE id = $1', [event_id]);
    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (eventCheck.rows[0].organizer_id !== organizer_id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this event' });
    }

    if (eventCheck.rows[0].status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only DRAFT events can be deleted' });
    }

    await pool.query('DELETE FROM events WHERE id = $1', [event_id]);
    
    await pool.query(
      `INSERT INTO audit_logs (id, user_id, action, module, metadata) VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), organizer_id, 'event_deleted', 'organizer_events', JSON.stringify({ event_id })]
    );

    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
