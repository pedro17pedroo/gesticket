import { Router } from "express";
import ticketRoutes from "./ticketRoutes";
import userRoutes from "./userRoutes";
import customerRoutes from "./customerRoutes";

const router = Router();

// Mount route modules
router.use('/api', userRoutes);
router.use('/api/tickets', ticketRoutes);
router.use('/api/customers', customerRoutes);

// Multi-tenant routes
import organizationRoutes from './organizationRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import clientManagementRoutes from './clientManagementRoutes.js';
import tenantTicketRoutes from './tenantTicketRoutes.js';
router.use('/api/organizations', organizationRoutes);
router.use('/api/departments', departmentRoutes);
router.use('/api/client-management', clientManagementRoutes);
router.use('/api/tenant-tickets', tenantTicketRoutes);

export { router as default };