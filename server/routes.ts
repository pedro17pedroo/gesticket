import type { Express } from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTicketSchema, insertCustomerSchema, insertTimeEntrySchema, insertTicketCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<void> {
  // Note: Auth is already set up in setupApp, so we don't need to set it up again

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRole = req.user.claims.role;
      
      // Only show user-specific stats for agents, global stats for managers/admins
      const stats = await storage.getDashboardStats(
        userRole === 'agent' ? userId : undefined
      );
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  app.get('/api/customers/:id/hour-bank', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hourBank = await storage.getHourBankStatus(id);
      res.json(hourBank);
    } catch (error) {
      console.error("Error fetching hour bank:", error);
      res.status(500).json({ message: "Failed to fetch hour bank status" });
    }
  });

  // Ticket routes
  app.get('/api/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRole = req.user.claims.role;
      
      const filters: any = {
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
      };

      // Apply filters based on query params
      if (req.query.status) filters.status = req.query.status;
      if (req.query.priority) filters.priority = req.query.priority;  
      if (req.query.customerId) filters.customerId = parseInt(req.query.customerId as string);
      
      // For agents, only show their assigned tickets unless they're managers/admins
      if (userRole === 'agent') {
        filters.assigneeId = userId;
      }

      const tickets = await storage.getTickets(filters);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get('/api/tickets/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticket = await storage.getTicket(id);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.post('/api/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ticketData = insertTicketSchema.parse({
        ...req.body,
        createdById: userId,
      });
      
      const ticket = await storage.createTicket(ticketData);
      
      // Broadcast new ticket to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'ticket_created',
            data: ticket,
          }));
        }
      });
      
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(400).json({ message: "Failed to create ticket" });
    }
  });

  app.patch('/api/tickets/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ticketData = req.body;
      
      const ticket = await storage.updateTicket(id, ticketData);
      
      // Broadcast ticket update to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'ticket_updated',
            data: ticket,
          }));
        }
      });
      
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(400).json({ message: "Failed to update ticket" });
    }
  });

  app.delete('/api/tickets/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTicket(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  // Ticket comments routes
  app.get('/api/tickets/:id/comments', isAuthenticated, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const comments = await storage.getTicketComments(ticketId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/tickets/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const commentData = insertTicketCommentSchema.parse({
        ...req.body,
        ticketId,
        userId,
      });
      
      const comment = await storage.createTicketComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  // Time tracking routes
  app.get('/api/time-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRole = req.user.claims.role;
      
      const filters: any = {};
      
      // For agents, only show their time entries
      if (userRole === 'agent') {
        filters.userId = userId;
      }
      
      if (req.query.ticketId) filters.ticketId = parseInt(req.query.ticketId as string);
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);

      const timeEntries = await storage.getTimeEntries(filters);
      res.json(timeEntries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.post('/api/time-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const timeEntryData = insertTimeEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      const timeEntry = await storage.createTimeEntry(timeEntryData);
      res.status(201).json(timeEntry);
    } catch (error) {
      console.error("Error creating time entry:", error);
      res.status(400).json({ message: "Failed to create time entry" });
    }
  });

  app.patch('/api/time-entries/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timeEntryData = req.body;
      
      const timeEntry = await storage.updateTimeEntry(id, timeEntryData);
      res.json(timeEntry);
    } catch (error) {
      console.error("Error updating time entry:", error);
      res.status(400).json({ message: "Failed to update time entry" });
    }
  });

  app.delete('/api/time-entries/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTimeEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      res.status(500).json({ message: "Failed to delete time entry" });
    }
  });

  // Knowledge base routes
  app.get('/api/knowledge-articles', async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.published !== undefined) {
        filters.published = req.query.published === 'true';
      }
      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      const articles = await storage.getKnowledgeArticles(filters);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching knowledge articles:", error);
      res.status(500).json({ message: "Failed to fetch knowledge articles" });
    }
  });

  app.get('/api/knowledge-articles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getKnowledgeArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching knowledge article:", error);
      res.status(500).json({ message: "Failed to fetch knowledge article" });
    }
  });

  // SLA routes
  app.get('/api/sla-configs', isAuthenticated, async (req, res) => {
    try {
      const configs = await storage.getSlaConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching SLA configs:", error);
      res.status(500).json({ message: "Failed to fetch SLA configs" });
    }
  });

  // Satisfaction rating routes
  app.post('/api/satisfaction-ratings', async (req, res) => {
    try {
      const ratingData = req.body;
      const rating = await storage.createSatisfactionRating(ratingData);
      res.status(201).json(rating);
    } catch (error) {
      console.error("Error creating satisfaction rating:", error);
      res.status(400).json({ message: "Failed to create satisfaction rating" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/comprehensive', isAuthenticated, async (req, res) => {
    try {
      const { from, to, metric, customer } = req.query;
      
      // Mock comprehensive analytics data (replace with real implementation)
      const analyticsData = {
        slaPerformance: [
          { name: "Crítico", target: 95, actual: 88, tickets: 45 },
          { name: "Alto", target: 90, actual: 94, tickets: 120 },
          { name: "Médio", target: 85, actual: 92, tickets: 280 },
          { name: "Baixo", target: 80, actual: 96, tickets: 150 },
        ],
        ticketTrends: [
          { date: "2024-01-01", created: 45, resolved: 42, backlog: 3 },
          { date: "2024-01-02", created: 52, resolved: 48, backlog: 7 },
          { date: "2024-01-03", created: 38, resolved: 45, backlog: 0 },
          { date: "2024-01-04", created: 41, resolved: 39, backlog: 2 },
          { date: "2024-01-05", created: 48, resolved: 50, backlog: 0 },
        ],
        categoryDistribution: [
          { name: "Suporte", value: 45, color: "#0088FE" },
          { name: "Incidente", value: 30, color: "#00C49F" },
          { name: "Otimização", value: 15, color: "#FFBB28" },
          { name: "Feature", value: 10, color: "#FF8042" },
        ],
        agentPerformance: [
          { name: "João Silva", resolved: 145, avgTime: 2.3, satisfaction: 4.8 },
          { name: "Maria Santos", resolved: 132, avgTime: 1.9, satisfaction: 4.9 },
          { name: "Pedro Costa", resolved: 118, avgTime: 2.1, satisfaction: 4.7 },
          { name: "Ana Oliveira", resolved: 98, avgTime: 2.5, satisfaction: 4.6 },
        ],
        customerSatisfaction: [
          { month: "Jan", score: 4.2, responses: 234 },
          { month: "Fev", score: 4.3, responses: 198 },
          { month: "Mar", score: 4.5, responses: 267 },
          { month: "Abr", score: 4.4, responses: 245 },
          { month: "Mai", score: 4.6, responses: 289 },
        ],
        financialMetrics: {
          totalRevenue: 125000,
          totalCosts: 85000,
          profitMargin: 32,
          hourlyRates: [
            { customer: "Cliente A", rate: 120, hours: 85 },
            { customer: "Cliente B", rate: 95, hours: 120 },
            { customer: "Cliente C", rate: 150, hours: 65 },
          ]
        }
      };

      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Gamification routes
  app.get('/api/gamification/leaderboard', isAuthenticated, async (req, res) => {
    try {
      // Mock leaderboard data
      const leaderboard = [
        { userId: "user1", name: "João Silva", points: 1250, badges: 8, level: "Expert", avatar: null },
        { userId: "user2", name: "Maria Santos", points: 1180, badges: 7, level: "Advanced", avatar: null },
        { userId: "user3", name: "Pedro Costa", points: 950, badges: 5, level: "Intermediate", avatar: null },
        { userId: "user4", name: "Ana Oliveira", points: 720, badges: 4, level: "Beginner", avatar: null },
      ];
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/gamification/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Mock achievements data
      const achievements = [
        { id: 1, name: "Primeiro Ticket", description: "Resolveu seu primeiro ticket", unlocked: true, date: "2024-01-15" },
        { id: 2, name: "Velocista", description: "Resolveu 10 tickets em um dia", unlocked: true, date: "2024-02-03" },
        { id: 3, name: "Satisfação 5 Estrelas", description: "Recebeu 5 avaliações consecutivas de 5 estrelas", unlocked: false, progress: 3 },
        { id: 4, name: "SLA Master", description: "Manteve 95% de compliance SLA por 30 dias", unlocked: false, progress: 22 },
      ];
      
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // AI Chatbot simulation routes
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, context } = req.body;
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simple intent recognition and response generation
      let response = "Entendo sua solicitação. Como posso ajudá-lo melhor?";
      let suggestions: string[] = [];
      
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes("ticket") || lowerMessage.includes("problema")) {
        response = "Vou ajudá-lo a criar um ticket. Qual é o problema que você está enfrentando?";
        suggestions = ["Problema de login", "Sistema lento", "Erro na aplicação", "Solicitação de feature"];
      } else if (lowerMessage.includes("sla") || lowerMessage.includes("prazo")) {
        response = "Nossos SLAs são: Crítico (1h resposta/4h resolução), Alto (2h/8h), Médio (4h/24h), Baixo (8h/72h). Posso verificar o status de algum ticket específico?";
        suggestions = ["Verificar ticket específico", "Ver todos meus tickets"];
      } else if (lowerMessage.includes("status") || lowerMessage.includes("andamento")) {
        response = "Para verificar o status dos seus tickets, acesse a aba 'Meus Tickets' no portal. Posso também criar um resumo dos tickets em aberto.";
        suggestions = ["Ver resumo de tickets", "Criar novo ticket"];
      }
      
      res.json({
        response,
        suggestions,
        confidence: 0.85,
        intent: "general_support"
      });
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Settings routes
  app.get('/api/settings', isAuthenticated, async (req, res) => {
    try {
      // Mock settings data (replace with real implementation)
      const settings = {
        general: {
          companyName: "GeckoStream",
          supportEmail: "suporte@geckostream.com",
          timezone: "America/Sao_Paulo",
          language: "pt-BR",
          dateFormat: "DD/MM/YYYY",
          businessHours: {
            start: "08:00",
            end: "18:00",
            workdays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
          }
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          slackIntegration: true,
          ticketCreated: true,
          ticketAssigned: true,
          slaBreached: true,
          customerReplied: true
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 480,
          maxLoginAttempts: 5,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          }
        }
      };
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post('/api/settings', isAuthenticated, async (req, res) => {
    try {
      const { section, data } = req.body;
      // Mock save settings (replace with real implementation)
      await new Promise(resolve => setTimeout(resolve, 1000));
      res.json({ success: true, section, data });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // Webhooks routes
  app.get('/api/webhooks', isAuthenticated, async (req, res) => {
    try {
      // Mock webhooks data
      const webhooks = [
        {
          id: 1,
          name: "Slack Notifications",
          url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
          events: ["ticket.created", "ticket.assigned", "sla.breached"],
          active: true,
          lastTriggered: "2024-01-20T15:30:00Z"
        },
        {
          id: 2,
          name: "External CRM",
          url: "https://api.crm.example.com/webhooks/tickets",
          events: ["ticket.created", "ticket.resolved"],
          active: true,
          lastTriggered: "2024-01-20T14:45:00Z"
        }
      ];
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ message: "Failed to fetch webhooks" });
    }
  });

  app.post('/api/webhooks', isAuthenticated, async (req, res) => {
    try {
      const webhookData = req.body;
      // Mock webhook creation
      const newWebhook = { id: Date.now(), ...webhookData };
      res.status(201).json(newWebhook);
    } catch (error) {
      console.error("Error creating webhook:", error);
      res.status(500).json({ message: "Failed to create webhook" });
    }
  });

  // SLA Rules routes
  app.get('/api/sla-rules', isAuthenticated, async (req, res) => {
    try {
      // Mock SLA rules data
      const slaRules = [
        {
          id: 1,
          name: "Clientes Premium - Crítico",
          priority: "critical",
          customerTier: "premium",
          responseTime: 15,
          resolutionTime: 60,
          active: true,
          businessHoursOnly: false,
          escalationRules: {
            enabled: true,
            levels: [
              { level: 1, timeMinutes: 30, assignTo: "manager" },
              { level: 2, timeMinutes: 60, assignTo: "director" }
            ]
          }
        },
        {
          id: 2,
          name: "Clientes Standard - Alto",
          priority: "high",
          customerTier: "standard",
          responseTime: 120,
          resolutionTime: 480,
          active: true,
          businessHoursOnly: true,
          escalationRules: {
            enabled: false,
            levels: []
          }
        }
      ];
      res.json(slaRules);
    } catch (error) {
      console.error("Error fetching SLA rules:", error);
      res.status(500).json({ message: "Failed to fetch SLA rules" });
    }
  });

  app.post('/api/sla-rules', isAuthenticated, async (req, res) => {
    try {
      const ruleData = req.body;
      // Mock rule creation
      const newRule = { id: Date.now(), ...ruleData };
      res.status(201).json(newRule);
    } catch (error) {
      console.error("Error creating SLA rule:", error);
      res.status(500).json({ message: "Failed to create SLA rule" });
    }
  });

  app.get('/api/sla-global-settings', isAuthenticated, async (req, res) => {
    try {
      // Mock global SLA settings
      const settings = {
        businessHours: {
          start: "09:00",
          end: "18:00",
          timezone: "America/Sao_Paulo",
          workdays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
        },
        notifications: {
          warningThreshold: 80,
          escalationEnabled: true,
          slackNotifications: true,
          emailNotifications: true
        },
        metrics: {
          targetCompliance: 95,
          reportingPeriod: "monthly"
        }
      };
      res.json(settings);
    } catch (error) {
      console.error("Error fetching SLA global settings:", error);
      res.status(500).json({ message: "Failed to fetch SLA global settings" });
    }
  });

  // Company management routes
  app.get('/api/companies', isAuthenticated, async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/companies/:id', isAuthenticated, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post('/api/companies', isAuthenticated, async (req, res) => {
    try {
      const companyData = req.body;
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.put('/api/companies/:id', isAuthenticated, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const companyData = req.body;
      const company = await storage.updateCompany(companyId, companyData);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete('/api/companies/:id', isAuthenticated, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      await storage.deleteCompany(companyId);
      res.json({ message: "Company deleted successfully" });
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Access Control routes
  
  // Department routes
  app.get('/api/departments', isAuthenticated, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get('/api/departments/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      console.error("Error fetching department:", error);
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  app.post('/api/departments', isAuthenticated, async (req, res) => {
    try {
      const department = await storage.createDepartment(req.body);
      res.status(201).json(department);
    } catch (error) {
      console.error("Error creating department:", error);
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  app.put('/api/departments/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.updateDepartment(id, req.body);
      res.json(department);
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(500).json({ message: "Failed to update department" });
    }
  });

  app.delete('/api/departments/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDepartment(id);
      res.json({ message: "Department deleted successfully" });
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  // Role routes
  app.get('/api/roles', isAuthenticated, async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.get('/api/roles/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ message: "Failed to fetch role" });
    }
  });

  app.post('/api/roles', isAuthenticated, async (req, res) => {
    try {
      const role = await storage.createRole(req.body);
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  app.put('/api/roles/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const role = await storage.updateRole(id, req.body);
      res.json(role);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.delete('/api/roles/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRole(id);
      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Permission routes
  app.get('/api/permissions', isAuthenticated, async (req, res) => {
    try {
      const permissions = await storage.getPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.get('/api/permissions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const permission = await storage.getPermission(id);
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }
      res.json(permission);
    } catch (error) {
      console.error("Error fetching permission:", error);
      res.status(500).json({ message: "Failed to fetch permission" });
    }
  });

  app.post('/api/permissions', isAuthenticated, async (req, res) => {
    try {
      const permission = await storage.createPermission(req.body);
      res.status(201).json(permission);
    } catch (error) {
      console.error("Error creating permission:", error);
      res.status(500).json({ message: "Failed to create permission" });
    }
  });

  // Role-Permission routes
  app.get('/api/roles/:roleId/permissions', isAuthenticated, async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissions = await storage.getRolePermissions(roleId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.post('/api/roles/:roleId/permissions', isAuthenticated, async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const { permissionId } = req.body;
      const rolePermission = await storage.assignPermissionToRole({ roleId, permissionId });
      res.status(201).json(rolePermission);
    } catch (error) {
      console.error("Error assigning permission to role:", error);
      res.status(500).json({ message: "Failed to assign permission to role" });
    }
  });

  app.delete('/api/roles/:roleId/permissions/:permissionId', isAuthenticated, async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);
      await storage.removePermissionFromRole(roleId, permissionId);
      res.json({ message: "Permission removed from role successfully" });
    } catch (error) {
      console.error("Error removing permission from role:", error);
      res.status(500).json({ message: "Failed to remove permission from role" });
    }
  });

  // User-Role routes
  app.get('/api/users/:userId/roles', isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const userRoles = await storage.getUserRoles(userId);
      res.json(userRoles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  app.post('/api/users/:userId/roles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const { roleId, expiresAt } = req.body;
      const assignedBy = req.user.claims.sub;
      
      const userRole = await storage.assignRoleToUser({
        userId,
        roleId,
        assignedBy,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true
      });
      res.status(201).json(userRole);
    } catch (error) {
      console.error("Error assigning role to user:", error);
      res.status(500).json({ message: "Failed to assign role to user" });
    }
  });

  app.delete('/api/users/:userId/roles/:roleId', isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const roleId = parseInt(req.params.roleId);
      await storage.removeRoleFromUser(userId, roleId);
      res.json({ message: "Role removed from user successfully" });
    } catch (error) {
      console.error("Error removing role from user:", error);
      res.status(500).json({ message: "Failed to remove role from user" });
    }
  });

  // Company users routes
  app.get('/api/companies/:id/users', isAuthenticated, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const users = await storage.getUsersForCompany(companyId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching company users:", error);
      res.status(500).json({ message: "Failed to fetch company users" });
    }
  });

  app.post('/api/users', isAuthenticated, async (req, res) => {
    try {
      const userData = req.body;
      // Generate a temporary ID for new users (in real app, handle proper user creation)
      const newUserData = {
        ...userData,
        id: `user_${Date.now()}`,
        isActive: true
      };
      const user = await storage.createUser(newUserData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      const user = await storage.updateUser(userId, userData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Hour bank routes
  app.get('/api/hour-banks', isAuthenticated, async (req, res) => {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const hourBanks = await storage.getHourBanks(companyId);
      res.json(hourBanks);
    } catch (error) {
      console.error("Error fetching hour banks:", error);
      res.status(500).json({ message: "Failed to fetch hour banks" });
    }
  });

  app.post('/api/hour-banks', isAuthenticated, async (req, res) => {
    try {
      const hourBankData = req.body;
      const hourBank = await storage.createHourBank(hourBankData);
      res.status(201).json(hourBank);
    } catch (error) {
      console.error("Error creating hour bank:", error);
      res.status(500).json({ message: "Failed to create hour bank" });
    }
  });

  app.get('/api/companies/:id/hour-bank-status', isAuthenticated, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const status = await storage.getHourBankStatus(companyId);
      res.json(status);
    } catch (error) {
      console.error("Error fetching hour bank status:", error);
      res.status(500).json({ message: "Failed to fetch hour bank status" });
    }
  });

  // Hour bank requests routes
  app.get('/api/hour-bank-requests', isAuthenticated, async (req, res) => {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const status = req.query.status as string;
      const requests = await storage.getHourBankRequests(companyId, status);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching hour bank requests:", error);
      res.status(500).json({ message: "Failed to fetch hour bank requests" });
    }
  });

  app.post('/api/hour-bank-requests', isAuthenticated, async (req, res) => {
    try {
      const requestData = {
        ...req.body,
        requestedBy: req.user?.claims?.sub
      };
      const request = await storage.createHourBankRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating hour bank request:", error);
      res.status(500).json({ message: "Failed to create hour bank request" });
    }
  });

  app.put('/api/hour-bank-requests/:id', isAuthenticated, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const requestData = req.body;
      
      if (requestData.status === 'approved') {
        requestData.approvedBy = req.user?.claims?.sub;
        requestData.approvedAt = new Date();
      }
      
      const request = await storage.updateHourBankRequest(requestId, requestData);
      res.json(request);
    } catch (error) {
      console.error("Error updating hour bank request:", error);
      res.status(500).json({ message: "Failed to update hour bank request" });
    }
  });

  // Client portal routes
  app.get('/api/client/company', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.companyId) {
        return res.status(404).json({ message: "User not associated with a company" });
      }

      const company = await storage.getCompany(user.companyId);
      const hourBankStatus = await storage.getHourBankStatus(user.companyId);

      res.json({
        ...company,
        hourBankStatus
      });
    } catch (error) {
      console.error("Error fetching client company:", error);
      res.status(500).json({ message: "Failed to fetch company information" });
    }
  });

  app.get('/api/client/users', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.companyId) {
        return res.status(404).json({ message: "User not associated with a company" });
      }

      const users = await storage.getUsersForCompany(user.companyId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching client users:", error);
      res.status(500).json({ message: "Failed to fetch company users" });
    }
  });

  app.post('/api/client/users', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser?.companyId || currentUser.role !== 'client_manager') {
        return res.status(403).json({ message: "Only client managers can create users" });
      }

      const userData = {
        ...req.body,
        id: `user_${Date.now()}`,
        companyId: currentUser.companyId,
        isActive: true
      };

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating client user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/client/tickets', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.companyId) {
        return res.status(404).json({ message: "User not associated with a company" });
      }

      const tickets = await storage.getTickets({ companyId: user.companyId });
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching client tickets:", error);
      res.status(500).json({ message: "Failed to fetch company tickets" });
    }
  });

  app.get('/api/client/hour-bank-requests', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.companyId) {
        return res.status(404).json({ message: "User not associated with a company" });
      }

      const requests = await storage.getHourBankRequests(user.companyId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching hour bank requests:", error);
      res.status(500).json({ message: "Failed to fetch hour bank requests" });
    }
  });

  app.post('/api/client/hour-bank-requests', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.companyId) {
        return res.status(404).json({ message: "User not associated with a company" });
      }

      const requestData = {
        ...req.body,
        companyId: user.companyId,
        requestedBy: userId
      };

      const request = await storage.createHourBankRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating hour bank request:", error);
      res.status(500).json({ message: "Failed to create hour bank request" });
    }
  });

  app.put('/api/tickets/:id/responsible', isAuthenticated, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { clientResponsibleId } = req.body;
      
      const ticket = await storage.updateTicket(ticketId, { clientResponsibleId });
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket responsible:", error);
      res.status(500).json({ message: "Failed to update ticket responsible" });
    }
  });

  // PWA and offline support routes
  app.get('/manifest.json', (req, res) => {
    const manifest = {
      name: "GeckoStream - Sistema de Gestão de Tickets",
      short_name: "GeckoStream",
      description: "Plataforma completa para gestão de suporte ao cliente",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#000000",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/icon-512.png", 
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
    res.json(manifest);
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      features: {
        tickets: true,
        sla: true,
        timeTracking: true,
        knowledgeBase: true,
        gamification: true,
        analytics: true,
        ai: true,
        websocket: true
      }
    });
  });

  // Note: WebSocket setup is handled in setupApp function
}
