import {
  users,
  companies,
  customers,
  tickets,
  timeEntries,
  knowledgeArticles,
  ticketComments,
  ticketAttachments,
  satisfactionRatings,
  slaConfigs,
  hourBanks,
  hourBankRequests,
  hourBankUsage,
  departments,
  roles,
  permissions,
  rolePermissions,
  userRoles,
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
  type TicketAttachment,
  type InsertTicketAttachment,
  type SatisfactionRating,
  type InsertSatisfactionRating,
  type SlaConfig,
  type Department,
  type InsertDepartment,
  type Role,
  type InsertRole,
  type Permission,
  type InsertPermission,
  type RolePermission,
  type InsertRolePermission,
  type UserRole,
  type InsertUserRole,
  type RoleWithPermissions,
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
  
  // Department operations
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department>;
  deleteDepartment(id: number): Promise<void>;
  
  // Role operations
  getRoles(): Promise<RoleWithPermissions[]>;
  getRole(id: number): Promise<RoleWithPermissions | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: number): Promise<void>;
  
  // Permission operations
  getPermissions(): Promise<Permission[]>;
  getPermission(id: number): Promise<Permission | undefined>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  
  // Role Permission operations
  getRolePermissions(roleId: number): Promise<Permission[]>;
  assignPermissionToRole(rolePermission: InsertRolePermission): Promise<RolePermission>;
  removePermissionFromRole(roleId: number, permissionId: number): Promise<void>;
  
  // User Role operations
  getUserRoles(userId: string): Promise<(UserRole & { role: Role })[]>;
  assignRoleToUser(userRole: InsertUserRole): Promise<UserRole>;
  removeRoleFromUser(userId: string, roleId: number): Promise<void>;
  
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
  
  // Attachment operations
  getTicketAttachments(ticketId: number): Promise<TicketAttachment[]>;
  createTicketAttachment(attachment: InsertTicketAttachment): Promise<TicketAttachment>;
  deleteTicketAttachment(id: number): Promise<void>;
  
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

    const results = await query.orderBy(desc(knowledgeArticles.createdAt));
    
    // Transform tags from JSON string to array
    return results.map(article => ({
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : []
    }));
  }

  async getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined> {
    const [article] = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, id));
    if (!article) return undefined;
    
    // Transform tags from JSON string to array
    return {
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : []
    };
  }

  async createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    // Transform tags array to JSON string for database storage
    const articleWithTags = {
      ...article,
      tags: Array.isArray(article.tags) ? JSON.stringify(article.tags) : article.tags
    };
    
    const [newArticle] = await db.insert(knowledgeArticles).values(articleWithTags).returning();
    
    // Transform tags back to array for response
    return {
      ...newArticle,
      tags: newArticle.tags ? JSON.parse(newArticle.tags) : []
    };
  }

  async updateKnowledgeArticle(id: number, article: Partial<InsertKnowledgeArticle>): Promise<KnowledgeArticle> {
    // Transform tags array to JSON string for database storage
    const articleWithTags = {
      ...article,
      ...(article.tags && { tags: Array.isArray(article.tags) ? JSON.stringify(article.tags) : article.tags }),
      updatedAt: new Date()
    };
    
    const [updatedArticle] = await db
      .update(knowledgeArticles)
      .set(articleWithTags)
      .where(eq(knowledgeArticles.id, id))
      .returning();
    
    // Transform tags back to array for response
    return {
      ...updatedArticle,
      tags: updatedArticle.tags ? JSON.parse(updatedArticle.tags) : []
    };
  }

  async deleteKnowledgeArticle(id: number): Promise<void> {
    await db.delete(knowledgeArticles).where(eq(knowledgeArticles.id, id));
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

  // Attachment operations
  async getTicketAttachments(ticketId: number): Promise<TicketAttachment[]> {
    return await db
      .select()
      .from(ticketAttachments)
      .where(eq(ticketAttachments.ticketId, ticketId))
      .orderBy(desc(ticketAttachments.createdAt));
  }

  async createTicketAttachment(attachment: InsertTicketAttachment): Promise<TicketAttachment> {
    const [newAttachment] = await db.insert(ticketAttachments).values(attachment).returning();
    return newAttachment;
  }

  async deleteTicketAttachment(id: number): Promise<void> {
    await db.delete(ticketAttachments).where(eq(ticketAttachments.id, id));
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

    // SLA compliance (simplified - using resolved tickets vs total)
    const [slaComplianceResult] = await db
      .select({
        total: count(),
        compliant: count(sql`case when status = 'resolved' then 1 end`),
      })
      .from(tickets)
      .where(userId ? eq(tickets.assigneeId, userId) : sql`true`);

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
  // Department operations
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments).where(eq(departments.isActive, true));
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || undefined;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db.insert(departments).values(department).returning();
    return newDepartment;
  }

  async updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department> {
    const [updatedDepartment] = await db
      .update(departments)
      .set({ ...department, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return updatedDepartment;
  }

  async deleteDepartment(id: number): Promise<void> {
    await db.update(departments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(departments.id, id));
  }

  // Role operations
  async getRoles(): Promise<RoleWithPermissions[]> {
    const result = await db.select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      isSystemRole: roles.isSystemRole,
      isActive: roles.isActive,
      createdAt: roles.createdAt,
      updatedAt: roles.updatedAt,
      permission: {
        id: permissions.id,
        name: permissions.name,
        resource: permissions.resource,
        action: permissions.action,
        description: permissions.description,
        createdAt: permissions.createdAt,
      }
    })
    .from(roles)
    .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(roles.isActive, true));

    // Group by role
    const rolesMap = new Map<number, RoleWithPermissions>();
    
    for (const row of result) {
      if (!rolesMap.has(row.id)) {
        rolesMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          isSystemRole: row.isSystemRole,
          isActive: row.isActive,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          rolePermissions: []
        });
      }
      
      if (row.permission && row.permission.id) {
        rolesMap.get(row.id)!.rolePermissions!.push({
          id: 0, // rolePermission id not needed here
          roleId: row.id,
          permissionId: row.permission.id,
          createdAt: new Date(),
          permission: row.permission
        });
      }
    }

    return Array.from(rolesMap.values());
  }

  async getRole(id: number): Promise<RoleWithPermissions | undefined> {
    const allRoles = await this.getRoles();
    return allRoles.find(role => role.id === id);
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db.insert(roles).values(role).returning();
    return newRole;
  }

  async updateRole(id: number, role: Partial<InsertRole>): Promise<Role> {
    const [updatedRole] = await db
      .update(roles)
      .set({ ...role, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    return updatedRole;
  }

  async deleteRole(id: number): Promise<void> {
    await db.update(roles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(roles.id, id));
  }

  // Permission operations
  async getPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions);
  }

  async getPermission(id: number): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission || undefined;
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [newPermission] = await db.insert(permissions).values(permission).returning();
    return newPermission;
  }

  // Role Permission operations
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const result = await db.select({
      id: permissions.id,
      name: permissions.name,
      resource: permissions.resource,
      action: permissions.action,
      description: permissions.description,
      createdAt: permissions.createdAt,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId));

    return result;
  }

  async assignPermissionToRole(rolePermission: InsertRolePermission): Promise<RolePermission> {
    const [newRolePermission] = await db.insert(rolePermissions).values(rolePermission).returning();
    return newRolePermission;
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await db.delete(rolePermissions)
      .where(and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      ));
  }

  // User Role operations
  async getUserRoles(userId: string): Promise<(UserRole & { role: Role })[]> {
    const result = await db.select({
      id: userRoles.id,
      userId: userRoles.userId,
      roleId: userRoles.roleId,
      assignedBy: userRoles.assignedBy,
      assignedAt: userRoles.assignedAt,
      expiresAt: userRoles.expiresAt,
      isActive: userRoles.isActive,
      role: {
        id: roles.id,
        name: roles.name,
        description: roles.description,
        isSystemRole: roles.isSystemRole,
        isActive: roles.isActive,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
      }
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.isActive, true)
    ));

    return result;
  }

  async assignRoleToUser(userRole: InsertUserRole): Promise<UserRole> {
    const [newUserRole] = await db.insert(userRoles).values(userRole).returning();
    return newUserRole;
  }

  async removeRoleFromUser(userId: string, roleId: number): Promise<void> {
    await db.update(userRoles)
      .set({ isActive: false })
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.roleId, roleId)
      ));
  }

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
