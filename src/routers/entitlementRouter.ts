import express from 'express';
import * as entitlementController from '../controllers/entitlementController';
import { identifier } from '../middlewares/identification';
import { authorize } from '../middlewares/authorization';
import { entitlementAddLimiter } from '../middlewares/apiLimit';

const router = express.Router();

router.post('/add-entitlements', identifier, authorize('Admin'), entitlementAddLimiter,entitlementController.addEntitlement);

router.get('/get-entitlements', identifier, authorize('Admin'), entitlementController.getAllEntitlement);

router.put('/update-entitlements', identifier, authorize('Admin'), entitlementController.updateEntitlement);

router.get('/get-entitlement/:entitlementId', identifier, authorize('Admin', 'ESS'), entitlementController.getEntitlement);

export default router;