import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
import { db } from '../db.js';
import { 
  organizations, 
  departments, 
  users, 
  companies, 
  tickets, 
  hourBanks, 
  hourBankRequests,
  timeEntries,
  customers
} from '@shared/schema';
import { eq, and, or, desc, count, sum, avg } from 'drizzle-orm';
import { TenantUser } from '../middleware/tenantAccess.js';

export class ClientManagementController extends BaseController {
  
  /**
   * Get all client organizations (for system users only)
   */
  async getClientOrganizations(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      
      if (!user?.isSuperUser && user?.organization?.type !== 'system_owner') {
        return this.sendError(res, 'Acesso negado - apenas utilizadores do sistema', 403);
      }

      const clientOrgs = await db.query.organizations.findMany({
        where: eq(organizations.type, 'client_company'),
        with: {
          departments: {
            with: {
              users: {
                columns: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true }
              }
            }
          },
          users: {
            columns: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true }
          },
          companies: true,
          tickets: {
            columns: { id: true, status: true, priority: true, createdAt: true }
          },
          hourBanks: true
        }
      });

      // Calculate statistics for each organization
      const orgStats = await Promise.all(
        clientOrgs.map(async (org) => {
          const stats = {
            totalTickets: org.tickets?.length || 0,
            openTickets: org.tickets?.filter(t => t.status === 'open').length || 0,
            inProgressTickets: org.tickets?.filter(t => t.status === 'in_progress').length || 0,
            resolvedTickets: org.tickets?.filter(t => t.status === 'resolved').length || 0,
            totalUsers: org.users?.length || 0,
            activeUsers: org.users?.filter(u => u.isActive).length || 0,
            totalDepartments: org.departments?.length || 0,
            totalHourBanks: org.hourBanks?.length || 0,
            totalHours: org.hourBanks?.reduce((sum, hb) => sum + (hb.totalHours || 0), 0) || 0,
            usedHours: org.hourBanks?.reduce((sum, hb) => sum + (hb.usedHours || 0), 0) || 0
          };

          return {
            ...org,
            stats
          };
        })
      );

      return this.sendSuccess(res, orgStats);
    } catch (error) {
      console.error('Error fetching client organizations:', error);
      return this.sendError(res, 'Erro ao carregar organizações clientes', 500);
    }
  }

  /**
   * Get detailed client organization info
   */
  async getClientOrganization(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const orgId = parseInt(req.params.id);
      
      if (!user?.isSuperUser && user?.organization?.type !== 'system_owner') {
        return this.sendError(res, 'Acesso negado - apenas utilizadores do sistema', 403);
      }

      const clientOrg = await db.query.organizations.findFirst({
        where: and(
          eq(organizations.id, orgId),
          eq(organizations.type, 'client_company')
        ),
        with: {
          departments: {
            with: {
              users: {
                columns: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true, createdAt: true }
              },
              tickets: {
                columns: { id: true, title: true, status: true, priority: true, createdAt: true },
                with: {
                  assignee: {
                    columns: { id: true, firstName: true, lastName: true }
                  }
                }
              }
            }
          },
          users: {
            columns: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true, createdAt: true },
            with: {
              department: {
                columns: { id: true, name: true }
              }
            }
          },
          companies: {
            with: {
              customers: true
            }
          },
          tickets: {
            with: {
              assignee: {
                columns: { id: true, firstName: true, lastName: true }
              },
              createdBy: {
                columns: { id: true, firstName: true, lastName: true }
              },
              timeEntries: true
            }
          },
          hourBanks: {
            with: {
              usage: true
            }
          },
          hourBankRequests: {
            with: {
              requestedBy: {
                columns: { id: true, firstName: true, lastName: true }
              }
            }
          }
        }
      });

      if (!clientOrg) {
        return this.sendError(res, 'Organização cliente não encontrada', 404);
      }

      // Calculate detailed statistics
      const stats = {
        tickets: {
          total: clientOrg.tickets?.length || 0,
          open: clientOrg.tickets?.filter(t => t.status === 'open').length || 0,
          inProgress: clientOrg.tickets?.filter(t => t.status === 'in_progress').length || 0,
          resolved: clientOrg.tickets?.filter(t => t.status === 'resolved').length || 0,
          critical: clientOrg.tickets?.filter(t => t.priority === 'critical').length || 0,
          high: clientOrg.tickets?.filter(t => t.priority === 'high').length || 0
        },
        users: {
          total: clientOrg.users?.length || 0,
          active: clientOrg.users?.filter(u => u.isActive).length || 0,
          admins: clientOrg.users?.filter(u => u.role === 'company_admin').length || 0,
          managers: clientOrg.users?.filter(u => u.role === 'company_manager').length || 0,
          agents: clientOrg.users?.filter(u => u.role === 'company_agent').length || 0
        },
        departments: {
          total: clientOrg.departments?.length || 0,
          withUsers: clientOrg.departments?.filter(d => d.users && d.users.length > 0).length || 0
        },
        hours: {
          totalBanks: clientOrg.hourBanks?.length || 0,
          totalHours: clientOrg.hourBanks?.reduce((sum, hb) => sum + (hb.totalHours || 0), 0) || 0,
          usedHours: clientOrg.hourBanks?.reduce((sum, hb) => sum + (hb.usedHours || 0), 0) || 0,
          remainingHours: clientOrg.hourBanks?.reduce((sum, hb) => sum + (hb.remainingHours || 0), 0) || 0,
          pendingRequests: clientOrg.hourBankRequests?.filter(r => r.status === 'pending').length || 0
        }
      };

      return this.sendSuccess(res, {
        organization: clientOrg,
        stats
      });
    } catch (error) {
      console.error('Error fetching client organization:', error);
      return this.sendError(res, 'Erro ao carregar organização cliente', 500);
    }
  }

  /**
   * Get all tickets from client organizations for system users to manage
   */
  async getClientTickets(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      
      if (!user?.isSuperUser && user?.organization?.type !== 'system_owner') {
        return this.sendError(res, 'Acesso negado - apenas utilizadores do sistema', 403);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
      const assigneeId = req.query.assigneeId as string;

      // Build conditions for client tickets only
      const conditions: any[] = [];
      
      // Only get tickets from client organizations
      const clientOrgIds = await db.query.organizations.findMany({
        where: eq(organizations.type, 'client_company'),
        columns: { id: true }
      });
      
      if (clientOrgIds.length === 0) {
        return this.sendSuccess(res, { tickets: [], pagination: { page, limit, totalPages: 0, totalCount: 0 } });
      }

      conditions.push(
        or(...clientOrgIds.map(org => eq(tickets.organizationId, org.id)))
      );

      if (status) conditions.push(eq(tickets.status, status as any));
      if (priority) conditions.push(eq(tickets.priority, priority as any));
      if (organizationId) conditions.push(eq(tickets.organizationId, organizationId));
      if (assigneeId) conditions.push(eq(tickets.assigneeId, assigneeId));

      const whereClause = and(...conditions);

      const clientTickets = await db.query.tickets.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(tickets.createdAt)],
        with: {
          organization: {
            columns: { id: true, name: true, type: true }
          },
          department: {
            columns: { id: true, name: true }
          },
          customer: true,
          company: true,
          assignee: {
            columns: { id: true, firstName: true, lastName: true, email: true }
          },
          createdBy: {
            columns: { id: true, firstName: true, lastName: true, email: true }
          },
          timeEntries: {
            with: {
              user: {
                columns: { id: true, firstName: true, lastName: true }
              }
            }
          }
        }
      });

      // Get total count
      const [{ totalCount }] = await db
        .select({ totalCount: count() })
        .from(tickets)
        .where(whereClause);

      const totalPages = Math.ceil(totalCount / limit);

      return this.sendSuccess(res, {
        tickets: clientTickets,
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
      console.error('Error fetching client tickets:', error);
      return this.sendError(res, 'Erro ao carregar tickets dos clientes', 500);
    }
  }

  /**
   * Assign system technician to client ticket
   */
  async assignTicketToTechnician(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const ticketId = parseInt(req.params.ticketId);
      const { assigneeId } = req.body;
      
      if (!user?.isSuperUser && user?.organization?.type !== 'system_owner') {
        return this.sendError(res, 'Acesso negado - apenas utilizadores do sistema', 403);
      }

      // Verify ticket belongs to a client organization
      const ticket = await db.query.tickets.findFirst({
        where: eq(tickets.id, ticketId),
        with: {
          organization: true
        }
      });

      if (!ticket) {
        return this.sendError(res, 'Ticket não encontrado', 404);
      }

      if (ticket.organization?.type !== 'client_company') {
        return this.sendError(res, 'Ticket não pertence a organização cliente', 400);
      }

      // Verify assignee is a system user
      const assignee = await db.query.users.findFirst({
        where: eq(users.id, assigneeId),
        with: {
          organization: true
        }
      });

      if (!assignee || assignee.organization?.type !== 'system_owner') {
        return this.sendError(res, 'Técnico deve ser utilizador do sistema', 400);
      }

      // Update ticket assignment
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
      return this.sendError(res, 'Erro ao atribuir ticket', 500);
    }
  }

  /**
   * Get hour bank management for client organization
   */
  async getClientHourBanks(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const orgId = parseInt(req.params.orgId);
      
      if (!user?.isSuperUser && user?.organization?.type !== 'system_owner') {
        return this.sendError(res, 'Acesso negado - apenas utilizadores do sistema', 403);
      }

      const hourBanks = await db.query.hourBanks.findMany({
        where: eq(hourBanks.organizationId, orgId),
        with: {
          organization: {
            columns: { id: true, name: true }
          },
          company: {
            columns: { id: true, name: true }
          },
          usage: {
            with: {
              ticket: {
                columns: { id: true, title: true }
              },
              timeEntry: {
                with: {
                  user: {
                    columns: { id: true, firstName: true, lastName: true }
                  }
                }
              }
            }
          }
        }
      });

      const requests = await db.query.hourBankRequests.findMany({
        where: eq(hourBankRequests.organizationId, orgId),
        with: {
          requestedBy: {
            columns: { id: true, firstName: true, lastName: true, email: true }
          }
        },
        orderBy: [desc(hourBankRequests.createdAt)]
      });

      return this.sendSuccess(res, {
        hourBanks,
        requests
      });
    } catch (error) {
      console.error('Error fetching hour banks:', error);
      return this.sendError(res, 'Erro ao carregar bolsas de horas', 500);
    }
  }

  /**
   * Approve or reject hour bank request
   */
  async processHourBankRequest(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const requestId = parseInt(req.params.requestId);
      const { action, notes } = req.body; // action: 'approve' | 'reject'
      
      if (!user?.isSuperUser && user?.organization?.type !== 'system_owner') {
        return this.sendError(res, 'Acesso negado - apenas utilizadores do sistema', 403);
      }

      const request = await db.query.hourBankRequests.findFirst({
        where: eq(hourBankRequests.id, requestId)
      });

      if (!request) {
        return this.sendError(res, 'Pedido não encontrado', 404);
      }

      if (request.status !== 'pending') {
        return this.sendError(res, 'Pedido já foi processado', 400);
      }

      const [updatedRequest] = await db.update(hourBankRequests)
        .set({
          status: action,
          approvedBy: user.id,
          approvedAt: new Date(),
          notes,
          updatedAt: new Date()
        })
        .where(eq(hourBankRequests.id, requestId))
        .returning();

      // If approved, update or create hour bank
      if (action === 'approve') {
        const existingBank = await db.query.hourBanks.findFirst({
          where: and(
            eq(hourBanks.organizationId, request.organizationId),
            eq(hourBanks.companyId, request.companyId)
          )
        });

        if (existingBank) {
          // Add hours to existing bank
          await db.update(hourBanks)
            .set({
              totalHours: existingBank.totalHours + request.requestedHours,
              remainingHours: existingBank.remainingHours + request.requestedHours,
              updatedAt: new Date()
            })
            .where(eq(hourBanks.id, existingBank.id));
        } else {
          // Create new hour bank
          await db.insert(hourBanks).values({
            organizationId: request.organizationId,
            companyId: request.companyId,
            totalHours: request.requestedHours,
            usedHours: 0,
            remainingHours: request.requestedHours,
            hourlyRate: request.hourlyRate,
            isActive: true
          });
        }
      }

      return this.sendSuccess(res, updatedRequest);
    } catch (error) {
      console.error('Error processing hour bank request:', error);
      return this.sendError(res, 'Erro ao processar pedido de bolsa de horas', 500);
    }
  }

  /**
   * Get system dashboard with all client metrics
   */
  async getSystemDashboard(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      
      if (!user?.isSuperUser && user?.organization?.type !== 'system_owner') {
        return this.sendError(res, 'Acesso negado - apenas utilizadores do sistema', 403);
      }

      // Get all client organizations
      const clientOrgs = await db.query.organizations.findMany({
        where: eq(organizations.type, 'client_company'),
        with: {
          tickets: {
            columns: { id: true, status: true, priority: true, createdAt: true }
          },
          users: {
            columns: { id: true, isActive: true }
          },
          hourBanks: true
        }
      });

      // Calculate global statistics
      const globalStats = {
        totalClients: clientOrgs.length,
        totalTickets: clientOrgs.reduce((sum, org) => sum + (org.tickets?.length || 0), 0),
        openTickets: clientOrgs.reduce((sum, org) => sum + (org.tickets?.filter(t => t.status === 'open').length || 0), 0),
        inProgressTickets: clientOrgs.reduce((sum, org) => sum + (org.tickets?.filter(t => t.status === 'in_progress').length || 0), 0),
        criticalTickets: clientOrgs.reduce((sum, org) => sum + (org.tickets?.filter(t => t.priority === 'critical').length || 0), 0),
        totalClientUsers: clientOrgs.reduce((sum, org) => sum + (org.users?.length || 0), 0),
        activeClientUsers: clientOrgs.reduce((sum, org) => sum + (org.users?.filter(u => u.isActive).length || 0), 0),
        totalHourBanks: clientOrgs.reduce((sum, org) => sum + (org.hourBanks?.length || 0), 0),
        totalHours: clientOrgs.reduce((sum, org) => sum + (org.hourBanks?.reduce((hSum, hb) => hSum + (hb.totalHours || 0), 0) || 0), 0),
        usedHours: clientOrgs.reduce((sum, org) => sum + (org.hourBanks?.reduce((hSum, hb) => hSum + (hb.usedHours || 0), 0) || 0), 0)
      };

      // Get recent tickets for quick overview
      const recentTickets = await db.query.tickets.findMany({
        where: or(...clientOrgs.map(org => eq(tickets.organizationId, org.id))),
        limit: 10,
        orderBy: [desc(tickets.createdAt)],
        with: {
          organization: {
            columns: { id: true, name: true }
          },
          assignee: {
            columns: { id: true, firstName: true, lastName: true }
          }
        }
      });

      // Get pending hour bank requests
      const pendingRequests = await db.query.hourBankRequests.findMany({
        where: and(
          or(...clientOrgs.map(org => eq(hourBankRequests.organizationId, org.id))),
          eq(hourBankRequests.status, 'pending')
        ),
        with: {
          organization: {
            columns: { id: true, name: true }
          },
          requestedBy: {
            columns: { id: true, firstName: true, lastName: true }
          }
        },
        orderBy: [desc(hourBankRequests.createdAt)]
      });

      return this.sendSuccess(res, {
        globalStats,
        clientOrganizations: clientOrgs.map(org => ({
          id: org.id,
          name: org.name,
          ticketCount: org.tickets?.length || 0,
          userCount: org.users?.length || 0,
          hourBankCount: org.hourBanks?.length || 0
        })),
        recentTickets,
        pendingRequests
      });
    } catch (error) {
      console.error('Error fetching system dashboard:', error);
      return this.sendError(res, 'Erro ao carregar dashboard do sistema', 500);
    }
  }
}