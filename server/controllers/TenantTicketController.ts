import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
import { db } from '../db.js';
import { tickets, users, organizations, departments, timeEntries } from '@shared/schema';
import { eq, and, or, desc, count, inArray } from 'drizzle-orm';
import { TenantUser } from '../middleware/tenantAccess.js';

export class TenantTicketController extends BaseController {
  
  /**
   * Create ticket with proper tenant context
   */
  async createTicket(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      if (!user) {
        return this.sendError(res, 'User authentication required', 401);
      }

      const {
        title,
        description,
        priority = 'medium',
        type = 'support',
        customerId,
        companyId,
        assigneeId,
        clientResponsibleId,
        departmentId,
        environment,
        affectedSystem,
        location,
        contactPhone,
        incidentDate,
        stepsToReproduce,
        expectedBehavior,
        actualBehavior,
        impact = 'medium',
        urgency = 'medium',
        tags,
        category,
        subcategory,
        dueDate
      } = req.body;

      // Determine organization and department for the ticket
      let ticketOrganizationId = user.organizationId;
      let ticketDepartmentId = departmentId || user.departmentId;

      // If user is creating ticket for a specific company, use company's organization
      if (companyId) {
        const company = await db.query.companies.findFirst({
          where: eq(companies.id, companyId),
          columns: { organizationId: true }
        });
        if (company) {
          ticketOrganizationId = company.organizationId;
        }
      }

      // Validate tenant access
      if (!user.isSuperUser && !user.canCrossOrganizations) {
        if (ticketOrganizationId && ticketOrganizationId !== user.organizationId) {
          return this.sendError(res, 'Cannot create ticket for different organization', 403);
        }
      }

      if (!user.isSuperUser && !user.canCrossDepartments && !user.canCrossOrganizations) {
        if (ticketDepartmentId && ticketDepartmentId !== user.departmentId) {
          return this.sendError(res, 'Cannot create ticket for different department', 403);
        }
      }

      const newTicket = await db.insert(tickets).values({
        title,
        description,
        priority,
        type,
        organizationId: ticketOrganizationId,
        departmentId: ticketDepartmentId,
        customerId,
        companyId,
        assigneeId,
        createdById: user.id,
        clientResponsibleId,
        environment,
        affectedSystem,
        location,
        contactPhone,
        incidentDate: incidentDate ? new Date(incidentDate) : null,
        stepsToReproduce,
        expectedBehavior,
        actualBehavior,
        impact,
        urgency,
        tags,
        category,
        subcategory,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'open'
      }).returning();

      // Fetch complete ticket with relations
      const createdTicket = await db.query.tickets.findFirst({
        where: eq(tickets.id, newTicket[0].id),
        with: {
          organization: true,
          department: true,
          customer: true,
          company: true,
          assignee: true,
          createdBy: true,
          clientResponsible: true
        }
      });

      return this.sendSuccess(res, createdTicket, 201);
    } catch (error) {
      console.error('Error creating ticket:', error);
      return this.sendError(res, 'Failed to create ticket', 500);
    }
  }

  /**
   * Update ticket with tenant validation
   */
  async updateTicket(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const ticketId = parseInt(req.params.id);
      
      if (!user) {
        return this.sendError(res, 'User authentication required', 401);
      }

      // Get existing ticket to validate access
      const existingTicket = await db.query.tickets.findFirst({
        where: eq(tickets.id, ticketId),
        with: {
          organization: true,
          department: true
        }
      });

      if (!existingTicket) {
        return this.sendError(res, 'Ticket not found', 404);
      }

      // Check tenant access
      const hasAccess = user.isSuperUser || 
                       user.canCrossOrganizations ||
                       (user.canCrossDepartments && user.organizationId === existingTicket.organizationId) ||
                       user.departmentId === existingTicket.departmentId ||
                       existingTicket.createdById === user.id ||
                       existingTicket.assigneeId === user.id ||
                       existingTicket.clientResponsibleId === user.id;

      if (!hasAccess) {
        return this.sendError(res, 'Access denied to this ticket', 403);
      }

      const updateData = { ...req.body, updatedAt: new Date() };
      
      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.organizationId; // Prevent org switching via update

      const [updatedTicket] = await db.update(tickets)
        .set(updateData)
        .where(eq(tickets.id, ticketId))
        .returning();

      // Fetch complete updated ticket
      const completeTicket = await db.query.tickets.findFirst({
        where: eq(tickets.id, ticketId),
        with: {
          organization: true,
          department: true,
          customer: true,
          company: true,
          assignee: true,
          createdBy: true,
          clientResponsible: true,
          timeEntries: true
        }
      });

      return this.sendSuccess(res, completeTicket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      return this.sendError(res, 'Failed to update ticket', 500);
    }
  }

  /**
   * Assign ticket to system technician (for client tickets)
   */
  async assignToSystemTechnician(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const ticketId = parseInt(req.params.id);
      const { assigneeId } = req.body;
      
      if (!user?.isSuperUser && user?.organization?.type !== 'system_owner') {
        return this.sendError(res, 'Only system users can assign technicians', 403);
      }

      // Verify ticket belongs to client organization
      const ticket = await db.query.tickets.findFirst({
        where: eq(tickets.id, ticketId),
        with: { organization: true }
      });

      if (!ticket) {
        return this.sendError(res, 'Ticket not found', 404);
      }

      if (ticket.organization?.type !== 'client_company') {
        return this.sendError(res, 'Can only assign system technicians to client tickets', 400);
      }

      // Verify assignee is system user
      const assignee = await db.query.users.findFirst({
        where: eq(users.id, assigneeId),
        with: { organization: true }
      });

      if (!assignee || assignee.organization?.type !== 'system_owner') {
        return this.sendError(res, 'Assignee must be system user', 400);
      }

      // Update assignment
      const [updatedTicket] = await db.update(tickets)
        .set({
          assigneeId,
          updatedAt: new Date()
        })
        .where(eq(tickets.id, ticketId))
        .returning();

      return this.sendSuccess(res, updatedTicket);
    } catch (error) {
      console.error('Error assigning ticket:', error);
      return this.sendError(res, 'Failed to assign ticket', 500);
    }
  }

  /**
   * Get tickets by organization (for system users managing clients)
   */
  async getTicketsByOrganization(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const orgId = parseInt(req.params.organizationId);
      
      if (!user?.isSuperUser && user?.organization?.type !== 'system_owner') {
        return this.sendError(res, 'Access denied', 403);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const status = req.query.status as string;
      const priority = req.query.priority as string;

      const conditions: any[] = [eq(tickets.organizationId, orgId)];
      
      if (status) conditions.push(eq(tickets.status, status as any));
      if (priority) conditions.push(eq(tickets.priority, priority as any));

      const whereClause = and(...conditions);

      const orgTickets = await db.query.tickets.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(tickets.createdAt)],
        with: {
          organization: true,
          department: true,
          customer: true,
          assignee: true,
          createdBy: true,
          timeEntries: {
            with: {
              user: {
                columns: { id: true, firstName: true, lastName: true }
              }
            }
          }
        }
      });

      const totalCount = await db.$count(tickets, whereClause);
      const totalPages = Math.ceil(totalCount / limit);

      return this.sendSuccess(res, {
        tickets: orgTickets,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching organization tickets:', error);
      return this.sendError(res, 'Failed to fetch tickets', 500);
    }
  }

  /**
   * Get ticket analytics by organization
   */
  async getTicketAnalytics(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const orgId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
      
      // Determine which organizations user can see
      let orgConditions: any[] = [];
      
      if (user.isSuperUser || user.organization?.type === 'system_owner') {
        if (orgId) {
          orgConditions.push(eq(tickets.organizationId, orgId));
        }
        // Otherwise see all tickets
      } else if (user.organizationId) {
        orgConditions.push(eq(tickets.organizationId, user.organizationId));
      } else {
        return this.sendError(res, 'No organization access', 403);
      }

      const whereClause = orgConditions.length > 0 ? and(...orgConditions) : undefined;

      // Get ticket statistics
      const allTickets = await db.query.tickets.findMany({
        where: whereClause,
        columns: {
          id: true,
          status: true,
          priority: true,
          type: true,
          createdAt: true,
          organizationId: true
        },
        with: {
          organization: {
            columns: { id: true, name: true, type: true }
          },
          timeEntries: {
            columns: { duration: true }
          }
        }
      });

      const analytics = {
        total: allTickets.length,
        byStatus: {
          open: allTickets.filter(t => t.status === 'open').length,
          inProgress: allTickets.filter(t => t.status === 'in_progress').length,
          waitingCustomer: allTickets.filter(t => t.status === 'waiting_customer').length,
          resolved: allTickets.filter(t => t.status === 'resolved').length,
          closed: allTickets.filter(t => t.status === 'closed').length
        },
        byPriority: {
          low: allTickets.filter(t => t.priority === 'low').length,
          medium: allTickets.filter(t => t.priority === 'medium').length,
          high: allTickets.filter(t => t.priority === 'high').length,
          critical: allTickets.filter(t => t.priority === 'critical').length
        },
        byType: {
          support: allTickets.filter(t => t.type === 'support').length,
          incident: allTickets.filter(t => t.type === 'incident').length,
          optimization: allTickets.filter(t => t.type === 'optimization').length,
          featureRequest: allTickets.filter(t => t.type === 'feature_request').length
        },
        totalTimeSpent: allTickets.reduce((sum, ticket) => 
          sum + (ticket.timeEntries?.reduce((tSum, entry) => tSum + entry.duration, 0) || 0), 0
        ),
        avgResolutionTime: 0, // Could be calculated from resolved tickets
        organizationBreakdown: Object.entries(
          allTickets.reduce((acc, ticket) => {
            const orgName = ticket.organization?.name || 'Unknown';
            if (!acc[orgName]) acc[orgName] = 0;
            acc[orgName]++;
            return acc;
          }, {} as Record<string, number>)
        ).map(([name, count]) => ({ name, count }))
      };

      return this.sendSuccess(res, analytics);
    } catch (error) {
      console.error('Error getting ticket analytics:', error);
      return this.sendError(res, 'Failed to get analytics', 500);
    }
  }
}