import { Router } from 'express';
import { ClientManagementController } from '../controllers/ClientManagementController.js';

const router = Router();
const clientManagementController = new ClientManagementController();

// System dashboard and overview
router.get('/dashboard', clientManagementController.getSystemDashboard.bind(clientManagementController));

// Client organization management
router.get('/organizations', clientManagementController.getClientOrganizations.bind(clientManagementController));
router.get('/organizations/:id', clientManagementController.getClientOrganization.bind(clientManagementController));

// Client ticket management
router.get('/tickets', clientManagementController.getClientTickets.bind(clientManagementController));
router.put('/tickets/:ticketId/assign', clientManagementController.assignTicketToTechnician.bind(clientManagementController));

// Hour bank management
router.get('/organizations/:orgId/hour-banks', clientManagementController.getClientHourBanks.bind(clientManagementController));
router.put('/hour-bank-requests/:requestId/process', clientManagementController.processHourBankRequest.bind(clientManagementController));

export default router;