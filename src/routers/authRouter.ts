import express, { Router } from 'express';
import * as authController from '../controllers/authController';
import { identifier } from '../middlewares/identification';
import { authLimiter } from '../middlewares/apiLimit';

const router: Router = express.Router();

router.post('/signin', authLimiter, authController.signin);

router.post('/logout', identifier, authController.signout)

export default router;
