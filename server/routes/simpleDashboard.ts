import { Router } from 'express';
import { simpleAuth } from '../middleware/simpleAuth';

const router = Router();

// Simplified dashboard stats for development
router.get('/stats', simpleAuth, (req, res) => {
  // Return mock stats that work without database dependencies
  const stats = {
    activeTickets: 12,
    slaCompliance: 85.5,
    avgResponseTime: 2.3,
    csatScore: 4.2,
    ticketsByStatus: {
      open: 5,
      in_progress: 4,
      waiting_customer: 2,
      resolved: 1,
      closed: 0
    },
    ticketsByPriority: {
      low: 3,
      medium: 6,
      high: 2,
      critical: 1
    },
    recentActivity: [],
    topAgents: [],
    hourBankStatus: {
      total: 100,
      used: 45,
      remaining: 55,
      percentage: 45
    }
  };

  res.json({
    success: true,
    data: stats
  });
});

export default router;