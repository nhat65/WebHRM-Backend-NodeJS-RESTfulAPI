import express from 'express';
import * as accountController from '../controllers/accountController';
import { identifier } from '../middlewares/identification';
import { authorize } from '../middlewares/authorization';
import { accountAddLimiter } from '../middlewares/apiLimit';

const router = express.Router();

router.post('/add-account', identifier, authorize('Admin'), accountAddLimiter,accountController.addAccount);

router.post('/search-account', identifier, authorize('Admin'), accountController.searchAccount);

router.delete('/delete-account/:accountId', identifier, authorize('Admin'), accountController.deleteAccount);

router.put('/update-account', identifier, authorize('Admin'), accountController.updateAccount);

router.get('/list-account', identifier, authorize('Admin'), accountController.getAllAccount);

export default router;