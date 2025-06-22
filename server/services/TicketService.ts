import { TicketRepository } from "../repositories/TicketRepository";
import type { InsertTicket, Ticket, AuthenticatedUser } from "../models";
import type { TicketFilters } from "../repositories/TicketRepository";

export class TicketService {
  private ticketRepository: TicketRepository;

  constructor() {
    this.ticketRepository = new TicketRepository();
  }

  async getTickets(filters: TicketFilters, user: AuthenticatedUser): Promise<Ticket[]> {
    // Apply role-based filtering
    if (user.role === 'agent') {
      filters.assigneeId = user.id;
    }

    return await this.ticketRepository.findAll(filters);
  }

  async getTicketById(id: number): Promise<Ticket | null> {
    return await this.ticketRepository.findById(id);
  }

  async createTicket(ticketData: InsertTicket, user: AuthenticatedUser): Promise<Ticket> {
    const ticket = await this.ticketRepository.create({
      ...ticketData,
      createdById: user.id,
    });

    // Here you could add business logic like:
    // - Send notifications
    // - Create SLA deadlines
    // - Auto-assign based on rules
    
    return ticket;
  }

  async updateTicket(id: number, ticketData: Partial<InsertTicket>): Promise<Ticket> {
    const existingTicket = await this.ticketRepository.findById(id);
    if (!existingTicket) {
      throw new Error("Ticket not found");
    }

    // Add business logic for status transitions
    if (ticketData.status === 'resolved' && existingTicket.status !== 'resolved') {
      ticketData.resolvedAt = new Date();
    }

    return await this.ticketRepository.update(id, ticketData);
  }

  async deleteTicket(id: number): Promise<void> {
    return await this.ticketRepository.delete(id);
  }

  async getDashboardStats(userId?: string): Promise<any> {
    const stats = await this.ticketRepository.getStats(userId);
    
    // Calculate additional metrics
    const totalTickets = stats.total || 0;
    const openTickets = stats.open || 0;
    const resolvedTickets = stats.resolved || 0;
    const overdueTickets = 0; // TODO: Calculate based on SLA
    
    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      overdueTickets,
      avgResolutionTime: 0, // TODO: Calculate from time entries
      slaCompliance: totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 100,
    };
  }
}