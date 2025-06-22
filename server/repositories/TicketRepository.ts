import { eq, and, desc, sql } from "drizzle-orm";
import { BaseRepository } from "./BaseRepository";
import { tickets, ticketComments, timeEntries } from "@shared/schema";
import type { InsertTicket, Ticket } from "../models";

export interface TicketFilters {
  status?: string;
  priority?: string;
  customerId?: number;
  assigneeId?: string;
  limit?: number;
  offset?: number;
}

export class TicketRepository extends BaseRepository {
  async findAll(filters: TicketFilters = {}): Promise<Ticket[]> {
    return this.executeSafe(async () => {
      let query = this.db
        .select()
        .from(tickets)
        .orderBy(desc(tickets.createdAt))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0);

      const conditions = [];
      if (filters.status) conditions.push(eq(tickets.status, filters.status as any));
      if (filters.priority) conditions.push(eq(tickets.priority, filters.priority as any));
      if (filters.customerId) conditions.push(eq(tickets.customerId, filters.customerId));
      if (filters.assigneeId) conditions.push(eq(tickets.assigneeId, filters.assigneeId));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query;
    }, "findAllTickets");
  }

  async findById(id: number): Promise<Ticket | null> {
    return this.executeSafe(async () => {
      const result = await this.db
        .select()
        .from(tickets)
        .where(eq(tickets.id, id))
        .limit(1);
      
      return result[0] || null;
    }, "findTicketById");
  }

  async create(ticketData: InsertTicket): Promise<Ticket> {
    return this.executeSafe(async () => {
      const result = await this.db
        .insert(tickets)
        .values(ticketData)
        .returning();
      
      return result[0];
    }, "createTicket");
  }

  async update(id: number, ticketData: Partial<InsertTicket>): Promise<Ticket> {
    return this.executeSafe(async () => {
      const result = await this.db
        .update(tickets)
        .set({ ...ticketData, updatedAt: new Date() })
        .where(eq(tickets.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Ticket not found");
      }
      
      return result[0];
    }, "updateTicket");
  }

  async delete(id: number): Promise<void> {
    return this.executeSafe(async () => {
      const result = await this.db
        .delete(tickets)
        .where(eq(tickets.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Ticket not found");
      }
    }, "deleteTicket");
  }

  async getStats(assigneeId?: string): Promise<any> {
    return this.executeSafe(async () => {
      let baseQuery = this.db.select({
        total: sql<number>`count(*)::int`,
        open: sql<number>`count(*) filter (where status = 'open')::int`,
        in_progress: sql<number>`count(*) filter (where status = 'in_progress')::int`,
        resolved: sql<number>`count(*) filter (where status = 'resolved')::int`,
      }).from(tickets);

      if (assigneeId) {
        baseQuery = baseQuery.where(eq(tickets.assigneeId, assigneeId));
      }

      const stats = await baseQuery;
      return stats[0] || { total: 0, open: 0, in_progress: 0, resolved: 0 };
    }, "getTicketStats");
  }
}