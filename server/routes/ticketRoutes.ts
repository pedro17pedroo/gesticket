import { Router } from "express";
import { TicketController } from "../controllers/TicketController";
import { isAuthenticated } from "../replitAuth";

const router = Router();
const ticketController = new TicketController();

// Dashboard stats
router.get('/dashboard/stats', isAuthenticated, (req, res) => 
  ticketController.getDashboardStats(req, res)
);

// Ticket CRUD operations
router.get('/', isAuthenticated, (req, res) => 
  ticketController.getTickets(req, res)
);

router.get('/:id', isAuthenticated, (req, res) => 
  ticketController.getTicketById(req, res)
);

router.post('/', isAuthenticated, (req, res) => 
  ticketController.createTicket(req, res)
);

router.patch('/:id', isAuthenticated, (req, res) => 
  ticketController.updateTicket(req, res)
);

router.delete('/:id', isAuthenticated, (req, res) => 
  ticketController.deleteTicket(req, res)
);

export { router as default };