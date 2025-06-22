import { Router } from "express";
import ticketRoutes from "./ticketRoutes";
import userRoutes from "./userRoutes";
import customerRoutes from "./customerRoutes";

const router = Router();

// Mount route modules
router.use('/api', userRoutes);
router.use('/api/tickets', ticketRoutes);
router.use('/api/customers', customerRoutes);

export { router as default };