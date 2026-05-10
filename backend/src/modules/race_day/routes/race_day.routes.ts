import { Router } from 'express';
import { authenticateJWT, requireRole, RoleLevel } from '../../../middleware/auth.middleware';
import * as CheckinController from '../controllers/checkin.controller';
import * as StaffController from '../controllers/staff.controller';

const router = Router();

// Middleware: All routes below require at least STAFF role
router.use(authenticateJWT, requireRole(RoleLevel.STAFF));

// QR Validation & Check-in
router.post('/validate-scan', CheckinController.validateScan);
router.post('/participants/:participant_id/check-in', CheckinController.confirmCheckIn);

// Manual Search
router.get('/events/:event_id/search', CheckinController.manualSearch);

// Attendance Dashboard
router.get('/events/:event_id/stats', CheckinController.getAttendanceStats);

// Medical Emergency (Logged & Role Restricted)
router.get('/participants/:participant_id/medical', CheckinController.getMedicalAccess);

// Staff Management (Organizer Only)
router.post('/events/:event_id/staff', requireRole(RoleLevel.ORGANIZER), StaffController.inviteStaff);
router.get('/events/:event_id/staff', requireRole(RoleLevel.ORGANIZER), StaffController.listStaff);

export default router;
