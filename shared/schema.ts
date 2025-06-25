import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["super_admin", "system_admin", "system_agent", "company_admin", "company_manager", "company_agent", "company_user"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "critical"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "waiting_customer", "resolved", "closed"]);
export const ticketTypeEnum = pgEnum("ticket_type", ["support", "incident", "optimization", "feature_request"]);
export const organizationTypeEnum = pgEnum("organization_type", ["system_owner", "client_company"]);

// Session storage table (mandatory for Replit Auth)

// Automation rules table for real automation functionality
export const automationRules = pgTable("automation_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  trigger: jsonb("trigger").notNull(), // stores trigger type and conditions
  actions: jsonb("actions").notNull(), // stores array of actions
  lastTriggered: timestamp("last_triggered"),
  timesTriggered: integer("times_triggered").default(0),
  organizationId: integer("organization_id").references(() => organizations.id),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gamification achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  category: varchar("category", { length: 50 }).notNull(), // productivity, quality, speed, collaboration
  points: integer("points").notNull(),
  rarity: varchar("rarity", { length: 20 }).notNull(), // common, rare, epic, legendary
  requirements: jsonb("requirements").notNull(), // criteria to unlock
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements tracking
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: jsonb("progress"), // current progress towards achievement
});

// Report templates table
export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  parameters: jsonb("parameters").notNull(),
  query: text("query").notNull(),
  isActive: boolean("is_active").default(true),
  organizationId: integer("organization_id").references(() => organizations.id),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scheduled reports table
export const scheduledReports = pgTable("scheduled_reports", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => reportTemplates.id),
  name: varchar("name", { length: 255 }).notNull(),
  parameters: jsonb("parameters").notNull(),
  schedule: jsonb("schedule").notNull(), // frequency, time, recipients
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  isActive: boolean("is_active").default(true),
  organizationId: integer("organization_id").references(() => organizations.id),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizations table - separates system owner from client companies
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: organizationTypeEnum("type").notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  website: varchar("website", { length: 255 }),
  taxId: varchar("tax_id", { length: 50 }),
  industry: varchar("industry", { length: 100 }),
  tier: varchar("tier", { length: 50 }).default("basic"), // basic, standard, premium
  parentOrgId: integer("parent_org_id").references(() => organizations.id), // For subsidiaries
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Departments now belong to organizations for proper segregation
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  parentDepartmentId: integer("parent_department_id").references(() => departments.id),
  managerId: varchar("manager_id").references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  organizationId: integer("organization_id").references(() => organizations.id), // null for system-wide roles
  isSystemRole: boolean("is_system_role").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueRolePerOrg: unique("unique_role_per_org").on(table.name, table.organizationId),
}));

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  resource: varchar("resource", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueRolePermission: unique("unique_role_permission").on(table.roleId, table.permissionId),
}));

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  assignedBy: varchar("assigned_by", { length: 255 }).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => ({
  uniqueUserRole: unique("unique_user_role").on(table.userId, table.roleId),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth) - now with organization support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("company_user"),
  organizationId: integer("organization_id").references(() => organizations.id),
  departmentId: integer("department_id").references(() => departments.id),
  managerId: varchar("manager_id").references(() => users.id),
  isSuperUser: boolean("is_super_user").default(false).notNull(),
  canCrossDepartments: boolean("can_cross_departments").default(false).notNull(),
  canCrossOrganizations: boolean("can_cross_organizations").default(false).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table - now references organizations for proper multi-tenancy
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  website: varchar("website", { length: 255 }),
  taxId: varchar("tax_id", { length: 50 }),
  industry: varchar("industry", { length: 100 }),
  tier: varchar("tier", { length: 50 }).default("basic"),
  managerId: varchar("manager_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers/Organizations
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  address: text("address"),
  tier: varchar("tier", { length: 50 }).default("basic"),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  companyId: integer("company_id").references(() => companies.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Additional enums for enhanced ticket fields
export const impactEnum = pgEnum("impact_level", ["low", "medium", "high", "critical"]);
export const urgencyEnum = pgEnum("urgency_level", ["low", "medium", "high", "critical"]);

// Tickets - with organization and department segregation
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: ticketPriorityEnum("priority").default("medium"),
  status: ticketStatusEnum("status").default("open"),
  type: ticketTypeEnum("type").default("support"),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  departmentId: integer("department_id").references(() => departments.id),
  customerId: integer("customer_id").references(() => customers.id),
  companyId: integer("company_id").references(() => companies.id),
  assigneeId: varchar("assignee_id").references(() => users.id),
  createdById: varchar("created_by_id").references(() => users.id),
  clientResponsibleId: varchar("client_responsible_id").references(() => users.id),
  
  // Enhanced fields for better ticket management
  environment: varchar("environment", { length: 100 }), // Production, Staging, Development
  affectedSystem: varchar("affected_system", { length: 100 }), // System/Application affected
  location: varchar("location", { length: 100 }), // Physical or virtual location
  contactPhone: varchar("contact_phone", { length: 20 }), // Contact phone
  incidentDate: timestamp("incident_date"), // When the incident occurred
  stepsToReproduce: text("steps_to_reproduce"), // Steps to reproduce the issue
  expectedBehavior: text("expected_behavior"), // What should happen
  actualBehavior: text("actual_behavior"), // What actually happens
  impact: impactEnum("impact").default("medium"), // Business impact
  urgency: urgencyEnum("urgency").default("medium"), // Time sensitivity
  tags: text("tags"), // JSON array of tags
  category: varchar("category", { length: 100 }), // Main category
  subcategory: varchar("subcategory", { length: 100 }), // Subcategory
  
  dueDate: timestamp("due_date"),
  firstResponseAt: timestamp("first_response_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Time tracking
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  duration: integer("duration").notNull(), // in minutes
  description: text("description"),
  billable: boolean("billable").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SLA configurations
export const slaConfigs = pgTable("sla_configs", {
  id: serial("id").primaryKey(),
  level: varchar("level").notNull(), // bronze, silver, gold
  priority: varchar("priority").notNull(), // low, medium, high, critical
  responseTimeMinutes: integer("response_time_minutes").notNull(),
  resolutionTimeMinutes: integer("resolution_time_minutes").notNull(),
  businessHoursOnly: boolean("business_hours_only").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Knowledge base articles
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // JSON array of tags
  authorId: varchar("author_id").references(() => users.id),
  published: boolean("published").default(false),
  views: integer("views").default(0),
  helpful: integer("helpful").default(0),
  notHelpful: integer("not_helpful").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ticket attachments
export const ticketAttachments = pgTable("ticket_attachments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ticket comments
export const ticketComments = pgTable("ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer satisfaction ratings
export const satisfactionRatings = pgTable("satisfaction_ratings", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 scale
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hour banks for companies
export const hourBanks = pgTable("hour_banks", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  totalHours: integer("total_hours").notNull().default(0),
  usedHours: integer("used_hours").notNull().default(0),
  remainingHours: integer("remaining_hours").notNull().default(0),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  autoRenewal: boolean("auto_renewal").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hour bank requests (for requesting more hours)
export const hourBankRequests = pgTable("hour_bank_requests", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  requestedBy: varchar("requested_by").references(() => users.id).notNull(),
  requestedHours: integer("requested_hours").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  reason: text("reason"),
  status: varchar("status", { length: 50 }).default("pending"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hour bank usage tracking
export const hourBankUsage = pgTable("hour_bank_usage", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  ticketId: integer("ticket_id").references(() => tickets.id),
  timeEntryId: integer("time_entry_id").references(() => timeEntries.id),
  hoursUsed: decimal("hours_used", { precision: 5, scale: 2 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  description: text("description"),
  usedAt: timestamp("used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  parentOrganization: one(organizations, {
    fields: [organizations.parentOrgId],
    references: [organizations.id],
    relationName: "parentOrg"
  }),
  subsidiaries: many(organizations, { relationName: "parentOrg" }),
  departments: many(departments),
  users: many(users),
  companies: many(companies),
  tickets: many(tickets),
  customers: many(customers),
  hourBanks: many(hourBanks),
  hourBankRequests: many(hourBankRequests),
  hourBankUsage: many(hourBankUsage),
  roles: many(roles),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [departments.organizationId],
    references: [organizations.id],
  }),
  parentDepartment: one(departments, {
    fields: [departments.parentDepartmentId],
    references: [departments.id],
    relationName: "parentDept"
  }),
  subDepartments: many(departments, { relationName: "parentDept" }),
  manager: one(users, {
    fields: [departments.managerId],
    references: [users.id],
  }),
  users: many(users),
  tickets: many(tickets),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  manager: one(users, {
    fields: [users.managerId],
    references: [users.id],
    relationName: "userManager"
  }),
  managedUsers: many(users, { relationName: "userManager" }),
  managedDepartments: many(departments),
  managedCompanies: many(companies),
  createdTickets: many(tickets, { relationName: "createdBy" }),
  assignedTickets: many(tickets, { relationName: "assignee" }),
  responsibleTickets: many(tickets, { relationName: "clientResponsible" }),
  timeEntries: many(timeEntries),
  knowledgeArticles: many(knowledgeArticles),
  ticketComments: many(ticketComments),
  hourBankRequests: many(hourBankRequests),
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [companies.organizationId],
    references: [organizations.id],
  }),
  manager: one(users, {
    fields: [companies.managerId],
    references: [users.id],
    relationName: "companyManager"
  }),
  customers: many(customers),
  tickets: many(tickets),
  hourBanks: many(hourBanks),
  hourBankRequests: many(hourBankRequests),
  hourBankUsage: many(hourBankUsage),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [customers.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [customers.companyId],
    references: [companies.id],
  }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tickets.organizationId],
    references: [organizations.id],
  }),
  department: one(departments, {
    fields: [tickets.departmentId],
    references: [departments.id],
  }),
  customer: one(customers, {
    fields: [tickets.customerId],
    references: [customers.id],
  }),
  company: one(companies, {
    fields: [tickets.companyId],
    references: [companies.id],
  }),
  assignee: one(users, {
    fields: [tickets.assigneeId],
    references: [users.id],
    relationName: "assignee"
  }),
  createdBy: one(users, {
    fields: [tickets.createdById],
    references: [users.id],
    relationName: "createdBy"
  }),
  clientResponsible: one(users, {
    fields: [tickets.clientResponsibleId],
    references: [users.id],
    relationName: "clientResponsible"
  }),
  timeEntries: many(timeEntries),
  comments: many(ticketComments),
  attachments: many(ticketAttachments),
  satisfactionRatings: many(satisfactionRatings),
  hourBankUsage: many(hourBankUsage),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  ticket: one(tickets, {
    fields: [timeEntries.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [timeEntries.userId],
    references: [users.id],
  }),
}));

export const knowledgeArticlesRelations = relations(knowledgeArticles, ({ one }) => ({
  author: one(users, {
    fields: [knowledgeArticles.authorId],
    references: [users.id],
  }),
}));

export const ticketAttachmentsRelations = relations(ticketAttachments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketAttachments.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketAttachments.userId],
    references: [users.id],
  }),
}));

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketComments.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketComments.userId],
    references: [users.id],
  }),
}));

export const satisfactionRatingsRelations = relations(satisfactionRatings, ({ one }) => ({
  ticket: one(tickets, {
    fields: [satisfactionRatings.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [satisfactionRatings.userId],
    references: [users.id],
  }),
}));

export const hourBanksRelations = relations(hourBanks, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [hourBanks.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [hourBanks.companyId],
    references: [companies.id],
  }),
  usage: many(hourBankUsage),
}));

export const hourBankRequestsRelations = relations(hourBankRequests, ({ one }) => ({
  organization: one(organizations, {
    fields: [hourBankRequests.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [hourBankRequests.companyId],
    references: [companies.id],
  }),
  requestedBy: one(users, {
    fields: [hourBankRequests.requestedBy],
    references: [users.id],
    relationName: "hourBankRequestUser"
  }),
  approvedBy: one(users, {
    fields: [hourBankRequests.approvedBy],
    references: [users.id],
    relationName: "hourBankApprover"
  }),
}));

export const hourBankUsageRelations = relations(hourBankUsage, ({ one }) => ({
  organization: one(organizations, {
    fields: [hourBankUsage.organizationId],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [hourBankUsage.companyId],
    references: [companies.id],
  }),
  ticket: one(tickets, {
    fields: [hourBankUsage.ticketId],
    references: [tickets.id],
  }),
  timeEntry: one(timeEntries, {
    fields: [hourBankUsage.timeEntryId],
    references: [timeEntries.id],
  }),
}));

// Validation schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHourBankSchema = createInsertSchema(hourBanks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHourBankRequestSchema = createInsertSchema(hourBankRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketAttachmentSchema = createInsertSchema(ticketAttachments).omit({
  id: true,
  createdAt: true,
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSatisfactionRatingSchema = createInsertSchema(satisfactionRatings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New schemas for multi-tenant access control
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  assignedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type HourBank = typeof hourBanks.$inferSelect;
export type InsertHourBank = z.infer<typeof insertHourBankSchema>;
export type HourBankRequest = typeof hourBankRequests.$inferSelect;
export type InsertHourBankRequest = z.infer<typeof insertHourBankRequestSchema>;
export type HourBankUsage = typeof hourBankUsage.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;
export type TicketAttachment = typeof ticketAttachments.$inferSelect;
export type InsertTicketAttachment = z.infer<typeof insertTicketAttachmentSchema>;
export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;
export type SatisfactionRating = typeof satisfactionRatings.$inferSelect;
export type InsertSatisfactionRating = z.infer<typeof insertSatisfactionRatingSchema>;
export type SlaConfig = typeof slaConfigs.$inferSelect;

// New types for multi-tenant architecture
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

// Complex types with relations for multi-tenant architecture
export type OrganizationWithRelations = Organization & {
  parentOrganization?: Organization;
  subsidiaries?: Organization[];
  departments?: Department[];
  users?: User[];
  companies?: Company[];
  tickets?: Ticket[];
  customers?: Customer[];
  hourBanks?: HourBank[];
  roles?: Role[];
};

export type DepartmentWithRelations = Department & {
  organization?: Organization;
  parentDepartment?: Department;
  subDepartments?: Department[];
  manager?: User;
  users?: User[];
  tickets?: Ticket[];
};

export type TicketWithRelations = Ticket & {
  organization?: Organization;
  department?: Department;
  customer?: Customer;
  company?: Company;
  assignee?: User;
  createdBy?: User;
  clientResponsible?: User;
  timeEntries?: TimeEntry[];
  comments?: TicketComment[];
  attachments?: TicketAttachment[];
};

export type CompanyWithRelations = Company & {
  organization?: Organization;
  manager?: User;
  customers?: Customer[];
  hourBanks?: HourBank[];
  hourBankRequests?: HourBankRequest[];
};

export type UserWithRelations = User & {
  organization?: Organization;
  department?: Department;
  manager?: User;
  managedUsers?: User[];
  managedDepartments?: Department[];
  userRoles?: (UserRole & { role: Role })[];
};

export type RoleWithPermissions = Role & {
  organization?: Organization;
  rolePermissions?: (RolePermission & { permission: Permission })[];
};