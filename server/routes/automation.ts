import { Router } from 'express';
import { db } from '../db';
import { eq, desc, and } from 'drizzle-orm';
import { isAuthenticated, requirePermission } from '../middleware/auth';
import { automationRules } from '@shared/schema';
import { logger } from '../utils/logger';
import { cache, CacheHelpers, CacheInvalidation } from '../utils/cache';

const router = Router();

// Mock automation rules data structure
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: {
    type: 'ticket_created' | 'ticket_updated' | 'sla_warning' | 'time_based';
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: 'assign_user' | 'send_email' | 'update_priority' | 'add_comment' | 'escalate';
    parameters: Record<string, any>;
  }>;
  lastTriggered?: Date;
  timesTriggered: number;
  createdAt: Date;
  organizationId?: number;
}

// Helper function to get user's accessible automation rules
async function getAccessibleRules(userId: string, organizationId?: number) {
  const cacheKey = `automation:rules:${organizationId || 'global'}:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const whereCondition = organizationId 
    ? eq(automationRules.organizationId, organizationId)
    : undefined;

  const rules = await db.select().from(automationRules)
    .where(whereCondition)
    .orderBy(desc(automationRules.createdAt));

  cache.set(cacheKey, rules, 300000); // 5 minutes cache
  return rules;
}

// Get all automation rules
router.get('/rules', isAuthenticated, async (req, res) => {
  try {
    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    const rules = await getAccessibleRules(req.user.id, organizationFilter);
    res.json(rules);
  } catch (error) {
    logger.error('Error fetching automation rules', { error, userId: req.user?.id });
    res.status(500).json({ message: 'Failed to fetch automation rules' });
  }
});

// Get single automation rule
router.get('/rules/:id', isAuthenticated, async (req, res) => {
  try {
    const ruleId = req.params.id;
    const rule = mockRules.find(r => r.id === ruleId);

    if (!rule) {
      return res.status(404).json({ message: 'Automation rule not found' });
    }

    // Check organization access
    if (!req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      if (rule.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(rule);
  } catch (error) {
    console.error('Error fetching automation rule:', error);
    res.status(500).json({ message: 'Failed to fetch automation rule' });
  }
});

// Create new automation rule
router.post('/rules', isAuthenticated, requirePermission('automation', 'create'), async (req, res) => {
  try {
    const ruleData = {
      ...req.body,
      id: Date.now().toString(),
      organizationId: req.user?.organizationId || 1,
      createdAt: new Date(),
      timesTriggered: 0,
    };

    // In real implementation, would save to database
    mockRules.push(ruleData);

    res.status(201).json(ruleData);
  } catch (error) {
    console.error('Error creating automation rule:', error);
    res.status(500).json({ message: 'Failed to create automation rule' });
  }
});

// Update automation rule
router.put('/rules/:id', isAuthenticated, requirePermission('automation', 'edit'), async (req, res) => {
  try {
    const ruleId = req.params.id;
    const ruleIndex = mockRules.findIndex(r => r.id === ruleId);

    if (ruleIndex === -1) {
      return res.status(404).json({ message: 'Automation rule not found' });
    }

    // Check organization access
    const rule = mockRules[ruleIndex];
    if (!req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      if (rule.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Update rule
    mockRules[ruleIndex] = {
      ...mockRules[ruleIndex],
      ...req.body,
      id: ruleId, // Ensure ID doesn't change
    };

    res.json(mockRules[ruleIndex]);
  } catch (error) {
    console.error('Error updating automation rule:', error);
    res.status(500).json({ message: 'Failed to update automation rule' });
  }
});

// Toggle automation rule active status
router.patch('/rules/:id/toggle', isAuthenticated, requirePermission('automation', 'edit'), async (req, res) => {
  try {
    const ruleId = req.params.id;
    const ruleIndex = mockRules.findIndex(r => r.id === ruleId);

    if (ruleIndex === -1) {
      return res.status(404).json({ message: 'Automation rule not found' });
    }

    // Check organization access
    const rule = mockRules[ruleIndex];
    if (!req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      if (rule.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Toggle active status
    mockRules[ruleIndex].isActive = !mockRules[ruleIndex].isActive;

    res.json(mockRules[ruleIndex]);
  } catch (error) {
    console.error('Error toggling automation rule:', error);
    res.status(500).json({ message: 'Failed to toggle automation rule' });
  }
});

// Delete automation rule
router.delete('/rules/:id', isAuthenticated, requirePermission('automation', 'delete'), async (req, res) => {
  try {
    const ruleId = req.params.id;
    const ruleIndex = mockRules.findIndex(r => r.id === ruleId);

    if (ruleIndex === -1) {
      return res.status(404).json({ message: 'Automation rule not found' });
    }

    // Check organization access
    const rule = mockRules[ruleIndex];
    if (!req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      if (rule.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Remove rule
    mockRules.splice(ruleIndex, 1);

    res.json({ message: 'Automation rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting automation rule:', error);
    res.status(500).json({ message: 'Failed to delete automation rule' });
  }
});

// Get automation statistics
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    const filteredRules = organizationFilter 
      ? mockRules.filter(rule => rule.organizationId === organizationFilter)
      : mockRules;

    const stats = {
      totalRules: filteredRules.length,
      activeRules: filteredRules.filter(r => r.isActive).length,
      inactiveRules: filteredRules.filter(r => !r.isActive).length,
      totalExecutions: filteredRules.reduce((sum, rule) => sum + rule.timesTriggered, 0),
      successRate: 98.5, // Would calculate from actual execution data
      avgExecutionTime: 0.3, // seconds
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching automation stats:', error);
    res.status(500).json({ message: 'Failed to fetch automation statistics' });
  }
});

// Execute automation rule manually (for testing)
router.post('/rules/:id/execute', isAuthenticated, requirePermission('automation', 'execute'), async (req, res) => {
  try {
    const ruleId = req.params.id;
    const rule = mockRules.find(r => r.id === ruleId);

    if (!rule) {
      return res.status(404).json({ message: 'Automation rule not found' });
    }

    if (!rule.isActive) {
      return res.status(400).json({ message: 'Cannot execute inactive rule' });
    }

    // Check organization access
    if (!req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      if (rule.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Mock execution - in real implementation would actually run the automation
    rule.timesTriggered += 1;
    rule.lastTriggered = new Date();

    res.json({
      success: true,
      message: 'Automation rule executed successfully',
      executionDetails: {
        ruleId: rule.id,
        executedAt: rule.lastTriggered,
        actionsExecuted: rule.actions.length,
      }
    });
  } catch (error) {
    console.error('Error executing automation rule:', error);
    res.status(500).json({ message: 'Failed to execute automation rule' });
  }
});

export default router;