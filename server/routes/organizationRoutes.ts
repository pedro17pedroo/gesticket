import { Router } from 'express';
import { OrganizationController } from '../controllers/OrganizationController.js';
import { requireOrganizationAccess } from '../middleware/tenantAccess.js';

const router = Router();
const organizationController = new OrganizationController();

// Organization routes with tenant access control
router.get('/', organizationController.getOrganizations.bind(organizationController));
router.get('/:id', organizationController.getOrganization.bind(organizationController));
router.get('/:id/dashboard', organizationController.getOrganizationDashboard.bind(organizationController));
router.post('/', organizationController.createOrganization.bind(organizationController));
router.put('/:id', organizationController.updateOrganization.bind(organizationController));

export default router;