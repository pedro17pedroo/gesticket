import { Router } from 'express';
import { TenantTicketController } from '../controllers/TenantTicketController.js';

const router = Router();
const tenantTicketController = new TenantTicketController();

// Tenant-aware ticket routes
router.get('/analytics', tenantTicketController.getTicketAnalytics.bind(tenantTicketController));
router.get('/organization/:organizationId', tenantTicketController.getTicketsByOrganization.bind(tenantTicketController));
router.post('/', tenantTicketController.createTicket.bind(tenantTicketController));
router.put('/:id', tenantTicketController.updateTicket.bind(tenantTicketController));
router.put('/:id/assign-system-tech', tenantTicketController.assignToSystemTechnician.bind(tenantTicketController));

export default router;