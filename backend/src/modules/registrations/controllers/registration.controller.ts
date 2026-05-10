import { Request, Response } from 'express';
import pool from '../../../database/db';
import { v4 as uuidv4 } from 'uuid';
import { RegistrationSchema } from '../validation/registration.schema';
import { FraudService } from '../services/fraud.service';

export const checkout = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    // 0. Hardening: Payload Validation & Velocity Checks
    const parsed = RegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload schema', details: parsed.error.errors });
    }
    const { event_id, billing, participants: attendees } = parsed.data;

    const athlete_id = req.user ? req.user.id : null;
    if (!athlete_id) throw new Error('You must be logged in to register');

    if (await FraudService.isVelocityLimitExceeded(athlete_id)) {
       return res.status(429).json({ error: 'Too many registration attempts. Please slow down.' });
    }

    await client.query('BEGIN');

    // 1. Validate event
    const eventCheck = await client.query(
      `SELECT * FROM events WHERE id = $1 AND status IN ('LIVE', 'APPROVED') AND registration_open <= NOW() AND registration_close >= NOW() FOR UPDATE`,
      [event_id]
    );

    if (eventCheck.rowCount === 0) {
      throw new Error('Event is not available for registration');
    }

    let totalAmount = 0;
    const registrationId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 mins lock

    // 2. Validate each participant and category
    for (const attendee of attendees) {
      const categoryCheck = await client.query(
        `SELECT * FROM event_categories WHERE id = $1 AND event_id = $2`,
        [attendee.variant_id, event_id]
      );

      if (categoryCheck.rowCount === 0) {
        throw new Error(`Category ${attendee.variant_id} is invalid`);
      }

      const category = categoryCheck.rows[0];
      totalAmount += parseFloat(category.base_price);

      // Duplicate detection
      if (await FraudService.checkDuplicateParticipant(event_id, attendee.ic_passport)) {
        throw new Error(`Participant with IC ${attendee.ic_passport} is already registered`);
      }

      // Slot protection (including pending unexpired locks)
      if (category.max_slots !== null) {
        const slotsRes = await client.query(
          `SELECT COUNT(*) as count FROM participants p
           JOIN registrations r ON p.registration_id = r.id
           WHERE p.category_id = $1 AND (r.status = 'PAID' OR (r.status = 'PENDING' AND r.expires_at > NOW()))`,
          [attendee.variant_id]
        );
        if (parseInt(slotsRes.rows[0].count) >= category.max_slots) {
          throw new Error(`Category ${category.name} is sold out`);
        }
      }
    }

    const registrationNumber = `REG-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    // 3. Insert Registration
    await client.query(
      `INSERT INTO registrations (id, event_id, athlete_id, registration_number, persons_count, status, total_amount, expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [registrationId, event_id, athlete_id, registrationNumber, attendees.length, 'PENDING', totalAmount, expiresAt]
    );

    // 4. Insert Billing
    await client.query(
      `INSERT INTO billing_details (id, registration_id, first_name, phone, email, country, city, postcode) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [uuidv4(), registrationId, billing.first_name, billing.phone, billing.email, billing.country, billing.town_city, billing.postcode]
    );

    // 5. Insert Participants
    for (const attendee of attendees) {
      await client.query(
        `INSERT INTO participants (id, registration_id, category_id, full_name, bib_name, email, phone, gender, ic_passport, dob, age, address, postcode, country, medical_status, medical_details, emergency_name, emergency_phone) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [uuidv4(), registrationId, attendee.variant_id, attendee.full_name, attendee.bib_name, attendee.email, attendee.phone, attendee.gender, attendee.ic_passport, attendee.dob || null, attendee.age || null, attendee.address, attendee.postcode, attendee.country, attendee.medical_status === 'CONDITION', attendee.medical_details, attendee.emergency_name, attendee.emergency_phone]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Registration created', registration_id: registrationId, total_amount: totalAmount, expires_at: expiresAt });

  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};
