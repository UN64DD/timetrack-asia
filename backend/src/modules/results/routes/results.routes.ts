import { Router } from 'express';
import { authenticateJWT, requireRole, RoleLevel } from '../../../middleware/auth.middleware';
import * as ResultController from '../controllers/result.controller';
import * as PublicResultController from '../controllers/public_result.controller';

const router = Router();

// Public Results
router.get('/public/:event_id', PublicResultController.getPublicLeaderboard);
router.get('/participant/:participant_id', PublicResultController.getParticipantResult);

// Organizer/Admin: Results Management
router.post('/events/:event_id/import', authenticateJWT, requireRole(RoleLevel.ORGANIZER), ResultController.importResultsCSV);
router.post('/events/:event_id/finalize', authenticateJWT, requireRole(RoleLevel.ORGANIZER), ResultController.finalizeResults);

export default router;
