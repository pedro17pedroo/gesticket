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

  async getUserTickets(userId: string, limit?: number): Promise<any[]> {
    try {
      const conditions = [eq(tickets.createdById, userId)];
      
      let query = this.db
        .select()
        .from(tickets)
        .leftJoin(customers, eq(tickets.customerId, customers.id))
        .leftJoin(companies, eq(tickets.companyId, companies.id))
        .leftJoin(users, eq(tickets.assigneeId, users.id))
        .where(and(...conditions))
        .orderBy(desc(tickets.createdAt));

      if (limit) {
        query = query.limit(limit);
      }

      const result = await query;
      
      return result.map(row => ({
        ...row.tickets,
        customer: row.customers,
        company: row.companies,
        assignee: row.users,
      }));
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  }

  async getUserTicketStats(userId: string): Promise<any> {
    try {
      const userTickets = await this.db
        .select()
        .from(tickets)
        .where(eq(tickets.createdById, userId));

      const total = userTickets.length;
      const open = userTickets.filter(t => ['open', 'in_progress', 'waiting_customer'].includes(t.status)).length;
      const resolved = userTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;
      
      // Calculate average resolution time (in hours)
      const resolvedTickets = userTickets.filter(t => t.resolvedAt);
      let avgResolutionTime = 0;
      
      if (resolvedTickets.length > 0) {
        const totalResolutionTime = resolvedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const resolved = new Date(ticket.resolvedAt!).getTime();
          return sum + (resolved - created);
        }, 0);
        
        avgResolutionTime = totalResolutionTime / resolvedTickets.length / (1000 * 60 * 60); // Convert to hours
      }

      const lastTicket = userTickets.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      return {
        total,
        open,
        resolved,
        avgResolutionTime,
        lastTicketDate: lastTicket?.createdAt
      };
    } catch (error) {
      console.error('Error fetching user ticket stats:', error);
      throw error;
    }
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