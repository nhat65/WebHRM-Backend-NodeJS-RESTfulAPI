import { Router } from 'express';
import * as userController from '../controllers/userController';
import { identifier } from '../middlewares/identification';
import { authorize } from '../middlewares/authorization';

const router = Router();

router.post('/add-employee', identifier, authorize('Admin'), userController.addEmployee);

router.get('/employee-list', identifier, authorize('Admin'), userController.getAllEmployee);

router.get('/employee-detail/:employeeId', identifier, authorize('Admin', 'ESS'), userController.getEmployee);

router.get('/employee-contact/:employeeId', identifier, authorize('Admin', 'ESS'), userController.getEmployeeContact);

router.get('/employee-job/:employeeId', identifier, authorize('Admin','ESS'), userController.getEmployeeJob);

router.delete('/delete-employee/:employeeId', identifier, authorize('Admin'), userController.deleteEmployee);

router.post('/update-employee', identifier, authorize('Admin', 'ESS'), userController.updateEmployee);

router.post('/update-employee-contact', identifier, authorize('Admin', 'ESS'), userController.updateEmployeeContact);

router.post('/update-employee-job', identifier, authorize('Admin'), userController.updateEmployeeJob);

export default router;