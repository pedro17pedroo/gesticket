import { db } from '../server/db';
import { tickets, users, customers, timeEntries, organizations } from './schema';
import { eq, count, sum, avg, desc, and, gte, lte, inArray } from 'drizzle-orm';

export class OptimizedQueries {
  // Get tickets with full relations in a single query
  static async getTicketsWithRelations(filters?: {
    organizationId?: number;
    status?: string[];
    priority?: string[];
    assigneeId?: string;
    customerId?: number;
    limit?: number;
    offset?: number;
  }) {
    let query = db.select({
      ticket: tickets,
      customer: customers,
      assignee: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      }
    })
    .from(tickets)
    .leftJoin(customers, eq(tickets.customerId, customers.id))
    .leftJoin(users, eq(tickets.assigneeId, users.id))
    .orderBy(desc(tickets.createdAt));

    // Apply filters
    const conditions = [];
    
    if (filters?.organizationId) {
      conditions.push(eq(tickets.organizationId, filters.organizationId));
    }
    
    if (filters?.status && filters.status.length > 0) {
      conditions.push(inArray(tickets.status, filters.status as any));
    }
    
    if (filters?.priority && filters.priority.length > 0) {
      conditions.push(inArray(tickets.priority, filters.priority as any));
    }
    
    if (filters?.assigneeId) {
      conditions.push(eq(tickets.assigneeId, filters.assigneeId));
    }
    
    if (filters?.customerId) {
      conditions.push(eq(tickets.customerId, filters.customerId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  // Get dashboard statistics with optimized queries
  static async getDashboardStats(organizationId?: number) {
    const baseCondition = organizationId ? eq(tickets.organizationId, organizationId) : undefined;

    // Single query for all ticket counts
    const ticketStats = await db.select({
      total: count(),
      open: count().where(eq(tickets.status, 'open')),
      inProgress: count().where(eq(tickets.status, 'in_progress')), 
      resolved: count().where(eq(tickets.status, 'resolved')),
      closed: count().where(eq(tickets.status, 'closed')),
      critical: count().where(eq(tickets.priority, 'critical')),
      high: count().where(eq(tickets.priority, 'high')),
      medium: count().where(eq(tickets.priority, 'medium')),
      low: count().where(eq(tickets.priority, 'low'))
    })
    .from(tickets)
    .where(baseCondition);

    // Get user and customer counts
    const [customerCount, userCount] = await Promise.all([
      db.select({ count: count() })
        .from(customers)
        .where(organizationId ? eq(customers.organizationId, organizationId) : undefined),
      db.select({ count: count() })
        .from(users)
        .where(organizationId ? eq(users.organizationId, organizationId) : undefined)
    ]);

    return {
      tickets: ticketStats[0],
      customers: customerCount[0]?.count || 0,
      users: userCount[0]?.count || 0
    };
  }

  // Get user permissions in a single optimized query
  static async getUserPermissions(userId: string) {
    const userWithPermissions = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        userRoles: {
          with: {
            role: {
              with: {
                rolePermissions: {
                  with: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        organization: true,
        department: true
      }
    });

    if (!userWithPermissions) {
      return null;
    }

    // Extract permissions efficiently
    const permissions = userWithPermissions.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => `${rp.permission.resource}:${rp.permission.action}`)
    );

    return {
      user: userWithPermissions,
      permissions: userWithPermissions.role === 'super_admin' ? ['*'] : permissions
    };
  }

  // Get time tracking statistics
  static async getTimeTrackingStats(filters?: {
    userId?: string;
    organizationId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    let query = db.select({
      totalMinutes: sum(timeEntries.duration),
      totalBillableMinutes: sum(timeEntries.duration).where(eq(timeEntries.isBillable, true)),
      entryCount: count(),
      avgDuration: avg(timeEntries.duration)
    })
    .from(timeEntries);

    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(timeEntries.userId, filters.userId));
    }
    
    if (filters?.dateFrom) {
      conditions.push(gte(timeEntries.createdAt, filters.dateFrom));
    }
    
    if (filters?.dateTo) {
      conditions.push(lte(timeEntries.createdAt, filters.dateTo));
    }

    // Add organization filter through tickets
    if (filters?.organizationId) {
      query = query.leftJoin(tickets, eq(timeEntries.ticketId, tickets.id));
      conditions.push(eq(tickets.organizationId, filters.organizationId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  // Get recent activity with relations
  static async getRecentActivity(organizationId?: number, limit: number = 10) {
    return await db.select({
      ticketId: tickets.id,
      ticketTitle: tickets.title,
      ticketStatus: tickets.status,
      ticketPriority: tickets.priority,
      customerName: customers.name,
      assigneeName: users.firstName,
      updatedAt: tickets.updatedAt
    })
    .from(tickets)
    .leftJoin(customers, eq(tickets.customerId, customers.id))
    .leftJoin(users, eq(tickets.assigneeId, users.id))
    .where(organizationId ? eq(tickets.organizationId, organizationId) : undefined)
    .orderBy(desc(tickets.updatedAt))
    .limit(limit);
  }

  // Get customer statistics
  static async getCustomerStats(customerId: number) {
    const [ticketStats, timeStats] = await Promise.all([
      db.select({
        totalTickets: count(),
        openTickets: count().where(eq(tickets.status, 'open')),
        resolvedTickets: count().where(eq(tickets.status, 'resolved')),
        avgPriority: avg(tickets.priority as any)
      })
      .from(tickets)
      .where(eq(tickets.customerId, customerId)),

      db.select({
        totalTime: sum(timeEntries.duration),
        billableTime: sum(timeEntries.duration).where(eq(timeEntries.isBillable, true))
      })
      .from(timeEntries)
      .leftJoin(tickets, eq(timeEntries.ticketId, tickets.id))
      .where(eq(tickets.customerId, customerId))
    ]);

    return {
      tickets: ticketStats[0],
      timeTracking: timeStats[0]
    };
  }
}

export default OptimizedQueries;