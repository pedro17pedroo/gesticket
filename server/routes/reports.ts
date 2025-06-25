import { Router } from 'express';
import { db } from '../db';
import { tickets, users, customers, timeEntries, reportTemplates, scheduledReports } from '@shared/schema';
import { eq, desc, count, sum, avg, gte, lte, and } from 'drizzle-orm';
import { isAuthenticated, requirePermission } from '../middleware/auth';
import { logger } from '../utils/logger';
import { cache, CacheHelpers } from '../utils/cache';

const router = Router();

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'productivity' | 'sla' | 'financial' | 'custom';
  parameters: Array<{
    name: string;
    type: 'date' | 'select' | 'multiselect' | 'number' | 'text';
    label: string;
    options?: string[];
    required: boolean;
  }>;
  query: string;
}

interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  parameters: Record<string, any>;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
}

// Mock report templates
const reportTemplates: ReportTemplate[] = [
  {
    id: 'performance-summary',
    name: 'Relatório de Performance',
    description: 'Análise completa de performance da equipa e SLA',
    category: 'performance',
    parameters: [
      { name: 'dateRange', type: 'date', label: 'Período', required: true },
      { name: 'agents', type: 'multiselect', label: 'Agentes', options: [], required: false }
    ],
    query: 'SELECT * FROM tickets_performance_view'
  },
  {
    id: 'sla-compliance',
    name: 'Conformidade SLA',
    description: 'Relatório detalhado de cumprimento de SLA',
    category: 'sla',
    parameters: [
      { name: 'dateRange', type: 'date', label: 'Período', required: true },
      { name: 'slaLevel', type: 'select', label: 'Nível SLA', options: ['Todos', 'Crítico', 'Alto', 'Médio', 'Baixo'], required: false }
    ],
    query: 'SELECT * FROM sla_compliance_view'
  }
];

// Get report templates
router.get('/templates', isAuthenticated, async (req, res) => {
  try {
    res.json(reportTemplates);
  } catch (error) {
    console.error('Error fetching report templates:', error);
    res.status(500).json({ message: 'Failed to fetch report templates' });
  }
});

// Generate report
router.post('/generate', isAuthenticated, requirePermission('reports', 'view'), async (req, res) => {
  try {
    const { templateId, parameters } = req.body;
    const template = reportTemplates.find(t => t.id === templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Report template not found' });
    }

    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    // Generate mock report data based on actual database queries
    const reportData = await generateReportData(template, parameters, organizationFilter);
    
    res.json({
      template: template,
      parameters: parameters,
      data: reportData,
      generatedAt: new Date(),
      generatedBy: req.user?.id
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// Export report
router.post('/export', isAuthenticated, requirePermission('reports', 'export'), async (req, res) => {
  try {
    const { reportData, format } = req.body;
    
    // In real implementation, would generate file and return download link
    const exportUrl = await generateExportFile(reportData, format);
    
    res.json({
      success: true,
      downloadUrl: exportUrl,
      format: format,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ message: 'Failed to export report' });
  }
});

// Schedule report
router.post('/schedule', isAuthenticated, requirePermission('reports', 'schedule'), async (req, res) => {
  try {
    const { templateId, name, parameters, schedule } = req.body;
    
    const scheduledReport: ScheduledReport = {
      id: Date.now().toString(),
      templateId,
      name,
      parameters,
      schedule,
      isActive: true,
      nextRun: calculateNextRun(schedule)
    };

    // In real implementation, would save to database
    res.status(201).json(scheduledReport);
  } catch (error) {
    console.error('Error scheduling report:', error);
    res.status(500).json({ message: 'Failed to schedule report' });
  }
});

// Get scheduled reports
router.get('/scheduled', isAuthenticated, async (req, res) => {
  try {
    // Mock scheduled reports
    const scheduledReports: ScheduledReport[] = [];
    
    res.json(scheduledReports);
  } catch (error) {
    console.error('Error fetching scheduled reports:', error);
    res.status(500).json({ message: 'Failed to fetch scheduled reports' });
  }
});

// Performance analytics endpoint
router.get('/analytics/performance', isAuthenticated, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    // Get ticket statistics
    const ticketStats = await db.select({
      total: count(),
      resolved: count().where(eq(tickets.status, 'resolved')),
    })
    .from(tickets)
    .where(
      and(
        organizationFilter ? eq(tickets.organizationId, organizationFilter) : undefined,
        dateFrom ? gte(tickets.createdAt, new Date(dateFrom as string)) : undefined,
        dateTo ? lte(tickets.createdAt, new Date(dateTo as string)) : undefined
      )
    );

    // Get agent performance
    const agentPerformance = await db.select({
      agentId: tickets.assigneeId,
      agentName: users.firstName,
      ticketCount: count(),
      avgResolutionTime: avg(timeEntries.duration),
    })
    .from(tickets)
    .leftJoin(users, eq(tickets.assigneeId, users.id))
    .leftJoin(timeEntries, eq(tickets.id, timeEntries.ticketId))
    .where(
      and(
        organizationFilter ? eq(tickets.organizationId, organizationFilter) : undefined,
        dateFrom ? gte(tickets.createdAt, new Date(dateFrom as string)) : undefined,
        dateTo ? lte(tickets.createdAt, new Date(dateTo as string)) : undefined
      )
    )
    .groupBy(tickets.assigneeId, users.firstName);

    res.json({
      ticketStats: ticketStats[0] || { total: 0, resolved: 0 },
      agentPerformance: agentPerformance || [],
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ message: 'Failed to fetch performance analytics' });
  }
});

// SLA compliance endpoint
router.get('/analytics/sla', isAuthenticated, async (req, res) => {
  try {
    const { dateFrom, dateTo, priority } = req.query;
    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    // Mock SLA data - in real implementation would calculate from actual SLA configs
    const slaData = {
      overall: {
        compliance: 94.5,
        totalTickets: 1247,
        breaches: 69,
        avgResponseTime: 1.2
      },
      byPriority: [
        { priority: 'critical', compliance: 92.0, tickets: 23, target: 1.0 },
        { priority: 'high', compliance: 94.2, tickets: 87, target: 4.0 },
        { priority: 'medium', compliance: 96.1, tickets: 298, target: 8.0 },
        { priority: 'low', compliance: 98.5, tickets: 153, target: 24.0 }
      ],
      trends: [
        { date: '2024-01-01', compliance: 93.2, breaches: 8 },
        { date: '2024-01-02', compliance: 94.8, breaches: 6 },
        { date: '2024-01-03', compliance: 96.1, breaches: 4 },
        { date: '2024-01-04', compliance: 93.7, breaches: 7 },
        { date: '2024-01-05', compliance: 95.3, breaches: 5 }
      ]
    };

    res.json(slaData);
  } catch (error) {
    console.error('Error fetching SLA analytics:', error);
    res.status(500).json({ message: 'Failed to fetch SLA analytics' });
  }
});

// Helper functions
async function generateReportData(template: ReportTemplate, parameters: any, organizationId?: number) {
  // In real implementation, would execute actual queries based on template
  return {
    summary: {
      totalTickets: 1247,
      resolvedTickets: 1089,
      avgResolutionTime: 4.2,
      slaCompliance: 94.5,
      customerSatisfaction: 4.3
    },
    trends: [
      { date: '2024-01-01', created: 45, resolved: 42, backlog: 15 },
      { date: '2024-01-02', created: 52, resolved: 48, backlog: 19 },
      { date: '2024-01-03', created: 38, resolved: 45, backlog: 12 }
    ],
    performance: {
      byAgent: [
        { name: 'João Silva', tickets: 45, avgTime: 3.2, satisfaction: 4.5 },
        { name: 'Maria Santos', tickets: 52, avgTime: 2.8, satisfaction: 4.3 }
      ],
      byCategory: [
        { category: 'Hardware', count: 145, percentage: 25.8 },
        { category: 'Software', count: 203, percentage: 36.1 }
      ]
    }
  };
}

async function generateExportFile(reportData: any, format: 'pdf' | 'excel' | 'csv'): Promise<string> {
  // Mock file generation - in real implementation would use libraries like:
  // - PDF: puppeteer, jsPDF
  // - Excel: xlsx, exceljs
  // - CSV: csv-writer
  
  const filename = `report_${Date.now()}.${format}`;
  const downloadUrl = `/api/downloads/${filename}`;
  
  return downloadUrl;
}

function calculateNextRun(schedule: any): Date {
  const now = new Date();
  const nextRun = new Date(now);
  
  switch (schedule.frequency) {
    case 'daily':
      nextRun.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(now.getMonth() + 1);
      break;
  }
  
  // Set time
  const [hours, minutes] = schedule.time.split(':');
  nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return nextRun;
}

export default router;