import express from 'express';
import * as leaveController from '../controllers/leaveController';
import { identifier } from '../middlewares/identification';
import { authorize } from '../middlewares/authorization';
import { leaveAssignLimiter } from '../middlewares/apiLimit';

const router = express.Router();

router.post('/assign-leave', identifier, authorize('Admin'), leaveAssignLimiter, leaveController.assignLeave);

export default router;