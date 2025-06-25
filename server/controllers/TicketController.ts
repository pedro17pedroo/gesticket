import type { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { TicketService } from "../services/TicketService";
import { insertTicketSchema } from "@shared/schema";

export class TicketController extends BaseController {
  private ticketService: TicketService;

  constructor() {
    super();
    this.ticketService = new TicketService();
  }

  async getTickets(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const user = this.getAuthenticatedUser(req);
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        customerId: req.query.customerId ? parseInt(req.query.customerId as string) : undefined,
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
      };

      return await this.ticketService.getTickets(filters, user);
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