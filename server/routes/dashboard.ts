import { Router } from 'express';
import { db } from '../db';
import { tickets, customers, users, timeEntries } from '@shared/schema';
import { eq, count, desc, and, gte, sql } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Get dashboard statistics
router.get('/stats', isAuthenticated, async (req, res) => {
  const startTime = Date.now();
  try {
    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    // Check cache first
    const cacheKey = CacheHelpers.dashboardStatsKey(organizationFilter);
    const cachedStats = cache.get(cacheKey);
    
    if (cachedStats) {
      logger.request(req, res, Date.now() - startTime);
      return res.json(cachedStats);
    }
    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    // Get ticket counts by status
    const ticketStats = await db.select({
      status: tickets.status,
      count: count()
    })
    .from(tickets)
    .where(organizationFilter ? eq(tickets.organizationId, organizationFilter) : undefined)
    .groupBy(tickets.status);

    // Get ticket counts by priority
    const priorityStats = await db.select({
      priority: tickets.priority,
      count: count()
    })
    .from(tickets)
    .where(organizationFilter ? eq(tickets.organizationId, organizationFilter) : undefined)
    .groupBy(tickets.priority);

    // Get recent tickets
    const recentTickets = await db.select({
      id: tickets.id,
      title: tickets.title,
      priority: tickets.priority,
      status: tickets.status,
      createdAt: tickets.createdAt,
      customer: {
        name: customers.name
      }
    })
    .from(tickets)
    .leftJoin(customers, eq(tickets.customerId, customers.id))
    .where(organizationFilter ? eq(tickets.organizationId, organizationFilter) : undefined)
    .orderBy(desc(tickets.createdAt))
    .limit(10);

    // Get total customers count
    const [customerCount] = await db.select({ count: count() })
      .from(customers)
      .where(organizationFilter ? eq(customers.organizationId, organizationFilter) : undefined);

    // Get total users count (agents/staff)
    const [userCount] = await db.select({ count: count() })
      .from(users)
      .where(organizationFilter ? eq(users.organizationId, organizationFilter) : undefined);

    // Calculate response metrics (mock for now - would need proper SLA tracking)
    const stats = {
      tickets: {
        total: ticketStats.reduce((sum, stat) => sum + stat.count, 0),
        open: ticketStats.find(s => s.status === 'open')?.count || 0,
        inProgress: ticketStats.find(s => s.status === 'in_progress')?.count || 0,
        resolved: ticketStats.find(s => s.status === 'resolved')?.count || 0,
        closed: ticketStats.find(s => s.status === 'closed')?.count || 0,
      },
      priority: {
        critical: priorityStats.find(p => p.priority === 'critical')?.count || 0,
        high: priorityStats.find(p => p.priority === 'high')?.count || 0,
        medium: priorityStats.find(p => p.priority === 'medium')?.count || 0,
        low: priorityStats.find(p => p.priority === 'low')?.count || 0,
      },
      customers: customerCount.count,
      users: userCount.count,
      recentTickets,
      metrics: {
        avgResponseTime: '2.3h', // Would calculate from actual data
        slaCompliance: '94.5%',  // Would calculate from SLA configs
        satisfaction: '4.2/5',   // Would get from ratings
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// Get ticket trend data for charts
router.get('/trends', isAuthenticated, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    // Calculate date range
    const days = period === '30d' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get ticket creation trends
    const trends = await db.select({
      date: sql<string>`DATE(${tickets.createdAt})`,
      created: count(),
    })
    .from(tickets)
    .where(
      and(
        gte(tickets.createdAt, startDate),
        organizationFilter ? eq(tickets.organizationId, organizationFilter) : undefined
      )
    )
    .groupBy(sql`DATE(${tickets.createdAt})`)
    .orderBy(sql`DATE(${tickets.createdAt})`);

    res.json(trends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ message: 'Failed to fetch trend data' });
  }
});

export default router;