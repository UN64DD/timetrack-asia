import { Request, Response } from 'express';
import pool from '../../../database/db';
import { PaymentService } from '../../payments/services/payment.service';

export const listPendingPayments = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, r.registration_number, u.email as athlete_email 
       FROM payments p 
       JOIN registrations r ON p.registration_id = r.id 
       JOIN users u ON r.athlete_id = u.id
       WHERE p.status = 'PENDING_REVIEW' 
       ORDER BY p.created_at ASC`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const reviewManualPayment = async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const { status, adminNote } = req.body; // SUCCESS or FAILED
  const adminId = req.user!.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (status === 'SUCCESS') {
      await PaymentService.processSuccessfulPayment(client, paymentId);
    } else {
      await client.query(
        "UPDATE payments SET status = 'FAILED', updated_at = NOW() WHERE id = $1",
        [paymentId]
      );
    }

    await client.query(
      'INSERT INTO audit_logs (user_id, action, module, metadata) VALUES ($1, $2, $3, $4)',
      [adminId, `manual_payment_${status.toLowerCase()}`, 'admin', JSON.stringify({ payment_id: paymentId, note: adminNote })]
    );

    await client.query('COMMIT');
    res.json({ message: `Manual payment reviewed and marked as ${status}` });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const listRefundRequests = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT rf.*, r.registration_number, p.payment_gateway 
       FROM refunds rf 
       JOIN registrations r ON rf.registration_id = r.id 
       JOIN payments p ON rf.payment_id = p.id
       WHERE rf.status = 'REFUND_REQUESTED' 
       ORDER BY rf.created_at ASC`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const reviewRefund = async (req: Request, res: Response) => {
  const { refundId } = req.params;
  const { status, adminNote } = req.body; // REFUND_APPROVED or REFUND_REJECTED
  const adminId = req.user!.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE refunds SET status = $1, updated_at = NOW(), processed_at = NOW() WHERE id = $2',
      [status, refundId]
    );

    if (status === 'REFUND_APPROVED') {
      // In a real system, we'd trigger the gateway refund here.
      // For now we just mark the payment and registration as REFUNDED.
      const refundRes = await client.query('SELECT registration_id, payment_id FROM refunds WHERE id = $1', [refundId]);
      const { registration_id, payment_id } = refundRes.rows[0];

      await client.query("UPDATE registrations SET status = 'REFUNDED' WHERE id = $1", [registration_id]);
      await client.query("UPDATE payments SET status = 'REFUNDED' WHERE id = $1", [payment_id]);
    }

    await client.query(
      'INSERT INTO audit_logs (user_id, action, module, metadata) VALUES ($1, $2, $3, $4)',
      [adminId, `refund_${status.toLowerCase()}`, 'admin', JSON.stringify({ refund_id: refundId, note: adminNote })]
    );

    await client.query('COMMIT');
    res.json({ message: `Refund request reviewed and marked as ${status}` });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
