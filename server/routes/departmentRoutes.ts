import { Router } from 'express';
import { DepartmentController } from '../controllers/DepartmentController.js';
import { requireDepartmentAccess } from '../middleware/tenantAccess.js';

const router = Router();
const departmentController = new DepartmentController();

// Department routes with tenant access control
router.get('/', departmentController.getDepartments.bind(departmentController));
router.get('/:id', departmentController.getDepartment.bind(departmentController));
router.get('/:id/stats', departmentController.getDepartmentStats.bind(departmentController));
router.post('/', departmentController.createDepartment.bind(departmentController));
router.put('/:id', departmentController.updateDepartment.bind(departmentController));
router.post('/:id/assign-user', departmentController.assignUserToDepartment.bind(departmentController));

export default router;