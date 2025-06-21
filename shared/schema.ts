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

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("agent"), // end_user, agent, manager, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers/Organizations
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  slaLevel: varchar("sla_level").default("bronze"), // bronze, silver, gold
  hourBankLimit: integer("hour_bank_limit").default(0),
  hourBankUsed: integer("hour_bank_used").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ticket priorities and statuses as enums
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "critical"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "waiting_customer", "resolved", "closed"]);
export const ticketTypeEnum = pgEnum("ticket_type", ["support", "incident", "optimization", "feature_request"]);

// Tickets
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  priority: ticketPriorityEnum("priority").notNull().default("medium"),
  status: ticketStatusEnum("status").notNull().default("open"),
  type: ticketTypeEnum("type").notNull().default("support"),
  customerId: integer("customer_id").references(() => customers.id),
  assigneeId: varchar("assignee_id").references(() => users.id),
  createdById: varchar("created_by_id").references(() => users.id),
  slaResponseTime: integer("sla_response_time"), // in minutes
  slaResolutionTime: integer("sla_resolution_time"), // in minutes
  responseDeadline: timestamp("response_deadline"),
  resolutionDeadline: timestamp("resolution_deadline"),
  firstResponseAt: timestamp("first_response_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Time entries for time tracking
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id),
  userId: varchar("user_id").references(() => users.id),
  description: text("description"),
  duration: integer("duration").notNull(), // in seconds
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  billable: boolean("billable").default(true),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// SLA configurations
export const slaConfigs = pgTable("sla_configs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  level: varchar("level").notNull(), // bronze, silver, gold
  priority: ticketPriorityEnum("priority").notNull(),
  responseTime: integer("response_time").notNull(), // in minutes
  resolutionTime: integer("resolution_time").notNull(), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
});

// Knowledge base articles
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  tags: text("tags").array(),
  authorId: varchar("author_id").references(() => users.id),
  published: boolean("published").default(false),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments/Messages for tickets
export const ticketComments = pgTable("ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id),
  userId: varchar("user_id").references(() => users.id),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer satisfaction ratings
export const satisfactionRatings = pgTable("satisfaction_ratings", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id),
  customerId: integer("customer_id").references(() => customers.id),
  rating: integer("rating").notNull(), // 1-5 stars
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedTickets: many(tickets, { relationName: "assignee" }),
  createdTickets: many(tickets, { relationName: "creator" }),
  timeEntries: many(timeEntries),
  knowledgeArticles: many(knowledgeArticles),
  ticketComments: many(ticketComments),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  tickets: many(tickets),
  satisfactionRatings: many(satisfactionRatings),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  customer: one(customers, {
    fields: [tickets.customerId],
    references: [customers.id],
  }),
  assignee: one(users, {
    fields: [tickets.assigneeId],
    references: [users.id],
    relationName: "assignee",
  }),
  createdBy: one(users, {
    fields: [tickets.createdById],
    references: [users.id],
    relationName: "creator",
  }),
  timeEntries: many(timeEntries),
  comments: many(ticketComments),
  satisfactionRatings: many(satisfactionRatings),
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
  customer: one(customers, {
    fields: [satisfactionRatings.customerId],
    references: [customers.id],
  }),
}));

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({
  id: true,
  createdAt: true,
});

export const insertSatisfactionRatingSchema = createInsertSchema(satisfactionRatings).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
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

// Ticket with relations
export type TicketWithRelations = Ticket & {
  customer?: Customer;
  assignee?: User;
  createdBy?: User;
  timeEntries?: TimeEntry[];
  comments?: TicketComment[];
};
