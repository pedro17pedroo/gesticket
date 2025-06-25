import type { Express } from "express";

// Import modular routes
import authRoutes from './auth';
import userPermissionsRoutes from './userPermissions';
import ticketRoutes from './tickets';
import simpleDashboardRoutes from './simpleDashboard';
import customerRoutes from './customers';
import timeTrackingRoutes from './time-tracking';
import automationRoutes from './automation';
import gamificationRoutes from './gamification';
import reportsRoutes from './reports';
import integrationsRoutes from './integrations';

export async function registerRoutes(app: Express): Promise<void> {
  // Setup modular routes with proper error handling
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userPermissionsRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/dashboard', simpleDashboardRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/time-entries', timeTrackingRoutes);
  app.use('/api/automation', automationRoutes);
  app.use('/api/gamification', gamificationRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/integrations', integrationsRoutes);

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
        gamification: true,
        reports: true,
        integrations: true
      }
    });
  });
}