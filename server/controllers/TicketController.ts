import type { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { TicketService } from "../services/TicketService";
import { insertTicketSchema, tickets, organizations, departments } from "@shared/schema";
import { db } from '../db.js';
import { eq, and, or, desc, inArray } from 'drizzle-orm';
import { TenantUser, getAccessibleOrganizations, getAccessibleDepartments } from '../middleware/tenantAccess.js';

export class TicketController extends BaseController {
  private ticketService: TicketService;

  constructor() {
    super();
    this.ticketService = new TicketService();
  }

  async getTickets(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const user = req.user as TenantUser;
      if (!user) {
        throw new Error('User authentication required');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;

      // Build tenant-aware conditions
      const conditions: any[] = [];
      
      // Apply tenant access control
      if (user.isSuperUser || user.canCrossOrganizations) {
        // Super users can see all tickets or filter by organization
        if (organizationId) {
          conditions.push(eq(tickets.organizationId, organizationId));
        }
      } else if (user.canCrossDepartments && user.organizationId) {
        // Cross-department users see all tickets in their organization
        conditions.push(eq(tickets.organizationId, user.organizationId));
        if (departmentId) {
          conditions.push(eq(tickets.departmentId, departmentId));
        }
      } else if (user.departmentId) {
        // Regular users see only tickets in their department
        conditions.push(eq(tickets.departmentId, user.departmentId));
      } else {
        // Users without department can only see tickets they created or are assigned to
        conditions.push(
          or(
            eq(tickets.createdById, user.id),
            eq(tickets.assigneeId, user.id),
            eq(tickets.clientResponsibleId, user.id)
          )
        );
      }
      
      if (status) conditions.push(eq(tickets.status, status as any));
      if (priority) conditions.push(eq(tickets.priority, priority as any));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const ticketList = await db.query.tickets.findMany({
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
          clientResponsible: {
            columns: { id: true, firstName: true, lastName: true, email: true }
          },
          timeEntries: true
        }
      });

      // Get total count
      const totalCount = await db.$count(tickets, whereClause);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        tickets: ticketList,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    });
  }

  async getTicketById(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      const ticket = await this.ticketService.getTicketById(id);
      
      if (!ticket) {
        throw new Error("Ticket not found");
      }
      
      return ticket;
    });
  }

  async getUserTickets(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const user = this.getAuthenticatedUser(req);
      const userId = req.params.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      // Users can only see their own tickets unless they are admin
      if (userId !== user.id && user.role !== 'admin') {
        throw new Error('Unauthorized to view other user tickets');
      }
      
      return await this.ticketService.getUserTickets(userId, limit);
    });
  }

  async getUserTicketStats(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const user = this.getAuthenticatedUser(req);
      const userId = req.params.userId;
      
      // Users can only see their own stats unless they are admin
      if (userId !== user.id && user.role !== 'admin') {
        throw new Error('Unauthorized to view other user stats');
      }
      
      return await this.ticketService.getUserTicketStats(userId);
    });
  }

  async createTicket(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const user = this.getAuthenticatedUser(req);
      
      // Handle both form data (with files) and JSON data
      let ticketData;
      if (req.is('multipart/form-data')) {
        // Handle FormData from enhanced form
        ticketData = {
          title: req.body.title,
          description: req.body.description,
          priority: req.body.priority,
          type: req.body.type,
          category: req.body.category,
          subcategory: req.body.subcategory,
          contactPhone: req.body.contactPhone,
          environment: req.body.environment,
          affectedSystem: req.body.affectedSystem,
          location: req.body.location,
          incidentDate: req.body.incidentDate,
          stepsToReproduce: req.body.stepsToReproduce,
          expectedBehavior: req.body.expectedBehavior,
          actualBehavior: req.body.actualBehavior,
          impact: req.body.impact,
          urgency: req.body.urgency,
          tags: req.body.tags,
          customerId: req.body.customerId ? parseInt(req.body.customerId) : undefined,
          assigneeId: req.body.assigneeId || undefined,
        };
      } else {
        // Handle JSON data from simple form
        ticketData = insertTicketSchema.parse(req.body);
      }
      
      return await this.ticketService.createTicket(ticketData, user);
    });
  }

  async updateTicket(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      const ticketData = req.body;
      
      return await this.ticketService.updateTicket(id, ticketData);
    });
  }

  async deleteTicket(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      await this.ticketService.deleteTicket(id);
      return { message: "Ticket deleted successfully" };
    });
  }

  async getDashboardStats(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const user = this.getAuthenticatedUser(req);
      const userId = user.role === 'agent' ? user.id : undefined;
      
      return await this.ticketService.getDashboardStats(userId);
    });
  }
}