import type { Express } from "express";
import { WebSocket } from "ws";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { insertTicketCommentSchema, insertTimeEntrySchema } from "@shared/schema";

export async function registerLegacyRoutes(app: Express): Promise<void> {
  const wss = (global as any).wss;

  // Ticket comments routes
  app.get('/api/tickets/:id/comments', isAuthenticated, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const comments = await storage.getTicketComments(ticketId);
      res.json({ success: true, data: comments });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ success: false, error: "Failed to fetch comments" });
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
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ success: false, error: "Failed to create comment" });
    }
  });

  // Time tracking routes
  app.get('/api/time-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRole = req.user.claims.role;
      
      const filters: any = {};
      
      if (userRole === 'agent') {
        filters.userId = userId;
      }
      
      if (req.query.ticketId) filters.ticketId = parseInt(req.query.ticketId as string);
      if (req.query.dateFrom) filters.dateFrom = new Date(req.query.dateFrom as string);
      if (req.query.dateTo) filters.dateTo = new Date(req.query.dateTo as string);

      const timeEntries = await storage.getTimeEntries(filters);
      res.json({ success: true, data: timeEntries });
    } catch (error) {
      console.error("Error fetching time entries:", error);
      res.status(500).json({ success: false, error: "Failed to fetch time entries" });
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
      res.status(201).json({ success: true, data: timeEntry });
    } catch (error) {
      console.error("Error creating time entry:", error);
      res.status(400).json({ success: false, error: "Failed to create time entry" });
    }
  });

  app.patch('/api/time-entries/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timeEntryData = req.body;
      
      const timeEntry = await storage.updateTimeEntry(id, timeEntryData);
      res.json({ success: true, data: timeEntry });
    } catch (error) {
      console.error("Error updating time entry:", error);
      res.status(400).json({ success: false, error: "Failed to update time entry" });
    }
  });

  app.delete('/api/time-entries/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTimeEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      res.status(500).json({ success: false, error: "Failed to delete time entry" });
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
      res.json({ success: true, data: articles });
    } catch (error) {
      console.error("Error fetching knowledge articles:", error);
      res.status(500).json({ success: false, error: "Failed to fetch knowledge articles" });
    }
  });

  app.get('/api/knowledge-articles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getKnowledgeArticle(id);
      
      if (!article) {
        return res.status(404).json({ success: false, error: "Article not found" });
      }
      
      res.json({ success: true, data: article });
    } catch (error) {
      console.error("Error fetching knowledge article:", error);
      res.status(500).json({ success: false, error: "Failed to fetch knowledge article" });
    }
  });

  // SLA routes
  app.get('/api/sla-configs', isAuthenticated, async (req, res) => {
    try {
      const configs = await storage.getSlaConfigs();
      res.json({ success: true, data: configs });
    } catch (error) {
      console.error("Error fetching SLA configs:", error);
      res.status(500).json({ success: false, error: "Failed to fetch SLA configs" });
    }
  });

  // Satisfaction rating routes
  app.post('/api/satisfaction-ratings', async (req, res) => {
    try {
      const ratingData = req.body;
      const rating = await storage.createSatisfactionRating(ratingData);
      res.status(201).json({ success: true, data: rating });
    } catch (error) {
      console.error("Error creating satisfaction rating:", error);
      res.status(400).json({ success: false, error: "Failed to create satisfaction rating" });
    }
  });

  // Analytics routes (mock data for now)
  app.get('/api/analytics/comprehensive', isAuthenticated, async (req, res) => {
    try {
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

      res.json({ success: true, data: analyticsData });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ success: false, error: "Failed to fetch analytics" });
    }
  });

  // Gamification routes (mock data)
  app.get('/api/gamification/leaderboard', isAuthenticated, async (req, res) => {
    try {
      const leaderboard = [
        { userId: "user1", name: "João Silva", points: 1250, badges: 8, level: "Expert", avatar: null },
        { userId: "user2", name: "Maria Santos", points: 1180, badges: 7, level: "Advanced", avatar: null },
        { userId: "user3", name: "Pedro Costa", points: 950, badges: 5, level: "Intermediate", avatar: null },
        { userId: "user4", name: "Ana Oliveira", points: 720, badges: 4, level: "Beginner", avatar: null },
      ];
      res.json({ success: true, data: leaderboard });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ success: false, error: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/gamification/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const achievements = [
        { id: 1, name: "Primeiro Ticket", description: "Resolveu seu primeiro ticket", unlocked: true, date: "2024-01-15" },
        { id: 2, name: "Velocista", description: "Resolveu 10 tickets em um dia", unlocked: true, date: "2024-02-03" },
        { id: 3, name: "Satisfação 5 Estrelas", description: "Recebeu 5 avaliações consecutivas de 5 estrelas", unlocked: false, progress: 3 },
        { id: 4, name: "SLA Master", description: "Manteve 95% de compliance SLA por 30 dias", unlocked: false, progress: 22 },
      ];
      
      res.json({ success: true, data: achievements });
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ success: false, error: "Failed to fetch achievements" });
    }
  });

  // AI Chatbot simulation routes
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message } = req.body;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const responses = [
        "Com base no seu problema, sugiro verificar a configuração de rede primeiro.",
        "Este tipo de erro geralmente está relacionado a permissões. Você pode tentar...",
        "Encontrei artigos similares na base de conhecimento que podem ajudar.",
        "Para resolver este problema, recomendo seguir estes passos...",
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      res.json({
        success: true,
        data: {
          message: response,
          suggestions: [
            "Verificar logs do sistema",
            "Reiniciar o serviço",
            "Contactar suporte técnico"
          ]
        }
      });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ success: false, error: "Failed to process chat message" });
    }
  });

  // Companies/Organizations routes
  app.get('/api/companies', isAuthenticated, async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json({ success: true, data: companies });
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ success: false, error: "Failed to fetch companies" });
    }
  });
}