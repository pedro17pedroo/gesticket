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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "agent", "manager", "client_manager", "client_user"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "critical"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "waiting_customer", "resolved", "closed"]);
export const ticketTypeEnum = pgEnum("ticket_type", ["support", "incident", "optimization", "feature_request"]);

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Companies table for client management
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  website: varchar("website", { length: 255 }),
  taxId: varchar("tax_id", { length: 50 }),
  industry: varchar("industry", { length: 100 }),
  tier: varchar("tier", { length: 50 }).default("basic"), // basic, standard, premium
  managerId: varchar("manager_id").references(() => users.id), // Primary manager/representative
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("client_user"),
  companyId: integer("company_id").references(() => companies.id),
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
  tier: varchar("tier", { length: 50 }).default("basic"), // basic, standard, premium
  companyId: integer("company_id").references(() => companies.id), // Link to company
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tickets
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: ticketPriorityEnum("priority").default("medium"),
  status: ticketStatusEnum("status").default("open"),
  type: ticketTypeEnum("type").default("support"),
  customerId: integer("customer_id").references(() => customers.id),
  companyId: integer("company_id").references(() => companies.id),
  assigneeId: varchar("assignee_id").references(() => users.id),
  createdById: varchar("created_by_id").references(() => users.id),
  clientResponsibleId: varchar("client_responsible_id").references(() => users.id), // Client-side responsible user
  dueDate: timestamp("due_date"),
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
  companyId: integer("company_id").references(() => companies.id).notNull(),
  requestedBy: varchar("requested_by").references(() => users.id).notNull(),
  requestedHours: integer("requested_hours").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  reason: text("reason"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hour bank usage tracking
export const hourBankUsage = pgTable("hour_bank_usage", {
  id: serial("id").primaryKey(),
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
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  manager: one(users, {
    fields: [users.managerId],
    references: [users.id],
    relationName: "userManager"
  }),
  managedUsers: many(users, { relationName: "userManager" }),
  managedCompanies: many(companies, { relationName: "companyManager" }),
  createdTickets: many(tickets, { relationName: "createdBy" }),
  assignedTickets: many(tickets, { relationName: "assignee" }),
  responsibleTickets: many(tickets, { relationName: "clientResponsible" }),
  timeEntries: many(timeEntries),
  knowledgeArticles: many(knowledgeArticles),
  ticketComments: many(ticketComments),
  hourBankRequests: many(hourBankRequests),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  manager: one(users, {
    fields: [companies.managerId],
    references: [users.id],
    relationName: "companyManager"
  }),
  users: many(users),
  customers: many(customers),
  tickets: many(tickets),
  hourBanks: many(hourBanks),
  hourBankRequests: many(hourBankRequests),
  hourBankUsage: many(hourBankUsage),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  company: one(companies, {
    fields: [customers.companyId],
    references: [companies.id],
  }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
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
  company: one(companies, {
    fields: [hourBanks.companyId],
    references: [companies.id],
  }),
  usage: many(hourBankUsage),
}));

export const hourBankRequestsRelations = relations(hourBankRequests, ({ one }) => ({
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
export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;
export type SatisfactionRating = typeof satisfactionRatings.$inferSelect;
export type InsertSatisfactionRating = z.infer<typeof insertSatisfactionRatingSchema>;
export type SlaConfig = typeof slaConfigs.$inferSelect;

// Complex types with relations
export type TicketWithRelations = Ticket & {
  customer?: Customer;
  company?: Company;
  assignee?: User;
  createdBy?: User;
  clientResponsible?: User;
  timeEntries?: TimeEntry[];
  comments?: TicketComment[];
};

export type CompanyWithRelations = Company & {
  manager?: User;
  users?: User[];
  customers?: Customer[];
  hourBanks?: HourBank[];
  hourBankRequests?: HourBankRequest[];
};

export type UserWithRelations = User & {
  company?: Company;
  manager?: User;
  managedUsers?: User[];
};