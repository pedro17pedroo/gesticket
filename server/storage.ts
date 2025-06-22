import {
  users,
  companies,
  customers,
  tickets,
  timeEntries,
  knowledgeArticles,
  ticketComments,
  satisfactionRatings,
  slaConfigs,
  hourBanks,
  hourBankRequests,
  hourBankUsage,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type CompanyWithRelations,
  type UserWithRelations,
  type HourBank,
  type InsertHourBank,
  type HourBankRequest,
  type InsertHourBankRequest,
  type HourBankUsage,
  type Customer,
  type InsertCustomer,
  type Ticket,
  type InsertTicket,
  type TicketWithRelations,
  type TimeEntry,
  type InsertTimeEntry,
  type KnowledgeArticle,
  type InsertKnowledgeArticle,
  type TicketComment,
  type InsertTicketComment,
  type SatisfactionRating,
  type InsertSatisfactionRating,
  type SlaConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, sum, avg, gte, lte, or, like } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersForCompany(companyId: number): Promise<UserWithRelations[]>;
  createUser(userData: UpsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Company operations
  getCompanies(): Promise<CompanyWithRelations[]>;
  getCompany(id: number): Promise<CompanyWithRelations | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: number): Promise<void>;
  
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  
  // Ticket operations
  getTickets(filters?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    customerId?: number;
    companyId?: number;
    createdById?: string;
    limit?: number;
    offset?: number;
  }): Promise<TicketWithRelations[]>;
  getTicket(id: number): Promise<TicketWithRelations | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket>;
  deleteTicket(id: number): Promise<void>;
  
  // Time tracking operations
  getTimeEntries(filters?: {
    ticketId?: number;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<TimeEntry[]>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry>;
  deleteTimeEntry(id: number): Promise<void>;
  
  // Knowledge base operations
  getKnowledgeArticles(filters?: {
    published?: boolean;
    search?: string;
  }): Promise<KnowledgeArticle[]>;
  getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined>;
  createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle>;
  updateKnowledgeArticle(id: number, article: Partial<InsertKnowledgeArticle>): Promise<KnowledgeArticle>;
  
  // Comment operations
  getTicketComments(ticketId: number): Promise<TicketComment[]>;
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;
  
  // Satisfaction rating operations
  createSatisfactionRating(rating: InsertSatisfactionRating): Promise<SatisfactionRating>;
  
  // SLA operations
  getSlaConfigs(): Promise<SlaConfig[]>;
  getSlaConfig(level: string, priority: string): Promise<SlaConfig | undefined>;
  
  // Hour bank operations
  getHourBanks(companyId?: number): Promise<HourBank[]>;
  getHourBank(id: number): Promise<HourBank | undefined>;
  createHourBank(hourBank: InsertHourBank): Promise<HourBank>;
  updateHourBank(id: number, hourBank: Partial<InsertHourBank>): Promise<HourBank>;
  getHourBankStatus(companyId: number): Promise<{
    limit: number;
    used: number;
    remaining: number;
    percentage: number;
  }>;
  
  // Hour bank request operations
  getHourBankRequests(companyId?: number, status?: string): Promise<HourBankRequest[]>;
  createHourBankRequest(request: InsertHourBankRequest): Promise<HourBankRequest>;
  updateHourBankRequest(id: number, request: Partial<InsertHourBankRequest>): Promise<HourBankRequest>;
  
  // Hour bank usage operations
  getHourBankUsage(companyId: number, filters?: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<HourBankUsage[]>;
  createHourBankUsage(usage: Omit<HourBankUsage, 'id' | 'createdAt'>): Promise<HourBankUsage>;
  
  // Dashboard statistics
  getDashboardStats(userId?: string): Promise<{
    activeTickets: number;
    slaCompliance: number;
    avgResponseTime: number;
    csatScore: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUsersForCompany(companyId: number): Promise<UserWithRelations[]> {
    const results = await db
      .select()
      .from(users)
      .leftJoin(companies, eq(users.companyId, companies.id))
      .where(eq(users.companyId, companyId));
    
    return results.map(row => ({
      ...row.users,
      company: row.companies || undefined,
    }));
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Company operations
  async getCompanies(): Promise<CompanyWithRelations[]> {
    const results = await db
      .select()
      .from(companies)
      .leftJoin(users, eq(companies.managerId, users.id))
      .where(eq(companies.isActive, true));
    
    return results.map(row => ({
      ...row.companies,
      manager: row.users || undefined,
    }));
  }

  async getCompany(id: number): Promise<CompanyWithRelations | undefined> {
    const [result] = await db
      .select()
      .from(companies)
      .leftJoin(users, eq(companies.managerId, users.id))
      .where(eq(companies.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.companies,
      manager: result.users || undefined,
    };
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db
      .insert(companies)
      .values(company)
      .returning();
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company> {
    const [updatedCompany] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<void> {
    await db.update(companies)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(companies.id, id));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  // Ticket operations
  async getTickets(filters?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    customerId?: number;
    companyId?: number;
    createdById?: string;
    limit?: number;
    offset?: number;
  }): Promise<TicketWithRelations[]> {
    let query = db
      .select({
        ticket: tickets,
        customer: customers,
        assignee: users,
      })
      .from(tickets)
      .leftJoin(customers, eq(tickets.customerId, customers.id))
      .leftJoin(users, eq(tickets.assigneeId, users.id));

    const conditions = [];
    if (filters?.status) conditions.push(eq(tickets.status, filters.status as any));
    if (filters?.priority) conditions.push(eq(tickets.priority, filters.priority as any));
    if (filters?.assigneeId) conditions.push(eq(tickets.assigneeId, filters.assigneeId));
    if (filters?.customerId) conditions.push(eq(tickets.customerId, filters.customerId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(tickets.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query;
    return results.map(result => ({
      ...result.ticket,
      customer: result.customer || undefined,
      assignee: result.assignee || undefined,
    }));
  }

  async getTicket(id: number): Promise<TicketWithRelations | undefined> {
    const [result] = await db
      .select({
        ticket: tickets,
        customer: customers,
        assignee: users,
      })
      .from(tickets)
      .leftJoin(customers, eq(tickets.customerId, customers.id))
      .leftJoin(users, eq(tickets.assigneeId, users.id))
      .where(eq(tickets.id, id));

    if (!result) return undefined;

    return {
      ...result.ticket,
      customer: result.customer || undefined,
      assignee: result.assignee || undefined,
    };
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [newTicket] = await db.insert(tickets).values(ticket).returning();
    return newTicket;
  }

  async updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket> {
    const [updatedTicket] = await db
      .update(tickets)
      .set({ ...ticket, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket;
  }

  async deleteTicket(id: number): Promise<void> {
    await db.delete(tickets).where(eq(tickets.id, id));
  }

  // Time tracking operations
  async getTimeEntries(filters?: {
    ticketId?: number;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<TimeEntry[]> {
    let query = db.select().from(timeEntries);

    const conditions = [];
    if (filters?.ticketId) conditions.push(eq(timeEntries.ticketId, filters.ticketId));
    if (filters?.userId) conditions.push(eq(timeEntries.userId, filters.userId));
    if (filters?.dateFrom) conditions.push(gte(timeEntries.createdAt, filters.dateFrom));
    if (filters?.dateTo) conditions.push(lte(timeEntries.createdAt, filters.dateTo));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(timeEntries.createdAt));
  }

  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const [newTimeEntry] = await db.insert(timeEntries).values(timeEntry).returning();
    return newTimeEntry;
  }

  async updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry> {
    const [updatedTimeEntry] = await db
      .update(timeEntries)
      .set(timeEntry)
      .where(eq(timeEntries.id, id))
      .returning();
    return updatedTimeEntry;
  }

  async deleteTimeEntry(id: number): Promise<void> {
    await db.delete(timeEntries).where(eq(timeEntries.id, id));
  }

  // Knowledge base operations
  async getKnowledgeArticles(filters?: {
    published?: boolean;
    search?: string;
  }): Promise<KnowledgeArticle[]> {
    let query = db.select().from(knowledgeArticles);

    const conditions = [];
    if (filters?.published !== undefined) {
      conditions.push(eq(knowledgeArticles.published, filters.published));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(knowledgeArticles.createdAt));
  }

  async getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined> {
    const [article] = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, id));
    return article;
  }

  async createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const [newArticle] = await db.insert(knowledgeArticles).values(article).returning();
    return newArticle;
  }

  async updateKnowledgeArticle(id: number, article: Partial<InsertKnowledgeArticle>): Promise<KnowledgeArticle> {
    const [updatedArticle] = await db
      .update(knowledgeArticles)
      .set({ ...article, updatedAt: new Date() })
      .where(eq(knowledgeArticles.id, id))
      .returning();
    return updatedArticle;
  }

  // Comment operations
  async getTicketComments(ticketId: number): Promise<TicketComment[]> {
    return await db
      .select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(desc(ticketComments.createdAt));
  }

  async createTicketComment(comment: InsertTicketComment): Promise<TicketComment> {
    const [newComment] = await db.insert(ticketComments).values(comment).returning();
    return newComment;
  }

  // Satisfaction rating operations
  async createSatisfactionRating(rating: InsertSatisfactionRating): Promise<SatisfactionRating> {
    const [newRating] = await db.insert(satisfactionRatings).values(rating).returning();
    return newRating;
  }

  // SLA operations
  async getSlaConfigs(): Promise<SlaConfig[]> {
    return await db.select().from(slaConfigs);
  }

  async getSlaConfig(level: string, priority: string): Promise<SlaConfig | undefined> {
    const [config] = await db
      .select()
      .from(slaConfigs)
      .where(and(eq(slaConfigs.level, level), eq(slaConfigs.priority, priority as any)));
    return config;
  }

  // Dashboard statistics
  async getDashboardStats(userId?: string): Promise<{
    activeTickets: number;
    slaCompliance: number;
    avgResponseTime: number;
    csatScore: number;
  }> {
    // Active tickets
    const [activeTicketsResult] = await db
      .select({ count: count() })
      .from(tickets)
      .where(and(
        eq(tickets.status, "open"),
        userId ? eq(tickets.assigneeId, userId) : sql`true`
      ));

    // SLA compliance (tickets resolved within SLA time)
    const [slaComplianceResult] = await db
      .select({
        total: count(),
        compliant: count(sql`case when resolved_at <= resolution_deadline then 1 end`),
      })
      .from(tickets)
      .where(and(
        eq(tickets.status, "resolved"),
        userId ? eq(tickets.assigneeId, userId) : sql`true`
      ));

    // Average response time in hours
    const [avgResponseResult] = await db
      .select({
        avgResponse: avg(sql`extract(epoch from (first_response_at - created_at)) / 3600`),
      })
      .from(tickets)
      .where(and(
        sql`first_response_at is not null`,
        userId ? eq(tickets.assigneeId, userId) : sql`true`
      ));

    // CSAT score
    const [csatResult] = await db
      .select({
        avgRating: avg(satisfactionRatings.rating),
      })
      .from(satisfactionRatings)
      .leftJoin(tickets, eq(satisfactionRatings.ticketId, tickets.id))
      .where(userId ? eq(tickets.assigneeId, userId) : sql`true`);

    const slaCompliance = slaComplianceResult.total > 0 
      ? (slaComplianceResult.compliant / slaComplianceResult.total) * 100 
      : 0;

    return {
      activeTickets: activeTicketsResult.count,
      slaCompliance: Math.round(slaCompliance * 100) / 100,
      avgResponseTime: Math.round((avgResponseResult.avgResponse || 0) * 100) / 100,
      csatScore: Math.round((csatResult.avgRating || 0) * 100) / 100,
    };
  }

  // Hour bank operations
  async getHourBankStatus(customerId: number): Promise<{
    limit: number;
    used: number;
    remaining: number;
    percentage: number;
  }> {
    const customer = await this.getCustomer(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const limit = customer.hourBankLimit || 0;
    const used = customer.hourBankUsed || 0;
    const remaining = Math.max(0, limit - used);
    const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0;

    return {
      limit,
      used,
      remaining,
      percentage,
    };
  }
}

export const storage = new DatabaseStorage();
