import { Router, Request, Response } from 'express';
import { authenticateJWT, requireRole, RoleLevel } from '../../../middleware/auth.middleware';
import { createEvent, getEvents, deleteEvent, getPublicEvent, getPublicEvents } from '../controllers/event.controller';
import { exportRegistrations } from '../../admin/controllers/export.controller';

const router = Router();

// Public: Browse events
router.get('/public', getPublicEvents);

router.get('/public/:id', getPublicEvent);

// Admin: View all events
router.get('/all', authenticateJWT, requireRole(RoleLevel.ADMIN), (req: Request, res: Response) => {
  res.json({ message: 'List of all events (Admin view)' });
});

// Organizer: Dashboard endpoints
router.get('/me', authenticateJWT, requireRole(RoleLevel.ORGANIZER), getEvents);
router.post('/', authenticateJWT, requireRole(RoleLevel.ORGANIZER), createEvent);
router.delete('/:id', authenticateJWT, requireRole(RoleLevel.ORGANIZER), deleteEvent);
router.get('/export/registrations', authenticateJWT, requireRole(RoleLevel.ORGANIZER), exportRegistrations);

export default router;
