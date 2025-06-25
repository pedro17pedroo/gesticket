import type { Express } from "express";

// Import modular routes
import authRoutes from './auth';
import ticketRoutes from './tickets';
import dashboardRoutes from './dashboard';
import customerRoutes from './customers';
import timeTrackingRoutes from './time-tracking';
import automationRoutes from './automation';
import gamificationRoutes from './gamification';

export async function registerRoutes(app: Express): Promise<void> {
  // Setup modular routes with proper error handling
  app.use('/api/auth', authRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/time-entries', timeTrackingRoutes);
  app.use('/api/automation', automationRoutes);
  app.use('/api/gamification', gamificationRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      features: {
        authentication: true,
        tickets: true,
        dashboard: true,
        customers: true,
        timeTracking: true,
        multiTenant: true,
        permissions: true,
        websocket: true,
        automation: true,
        gamification: true
      }
    });
  });
}