import { Router } from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { isAuthenticated, requirePermission } from '../middleware/auth';

const router = Router();

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'crm' | 'chat' | 'email' | 'monitoring' | 'storage' | 'auth';
  isActive: boolean;
  status: 'connected' | 'error' | 'inactive';
  lastSync?: Date;
  config?: Record<string, any>;
  webhook?: {
    url: string;
    secret: string;
    events: string[];
  };
  organizationId?: number;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed?: Date;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// Mock integrations data
const mockIntegrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Notificações de tickets em canais',
    category: 'chat',
    isActive: true,
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    webhook: {
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      secret: 'slack_webhook_secret_123',
      events: ['ticket_created', 'ticket_resolved']
    },
    organizationId: 1
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Criar tickets a partir de emails',
    category: 'email',
    isActive: true,
    status: 'connected',
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    config: {
      server: 'outlook.office365.com',
      port: 993,
      username: 'support@company.com'
    },
    organizationId: 1
  },
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    description: 'Sincronizar clientes e oportunidades',
    category: 'crm',
    isActive: false,
    status: 'inactive',
    organizationId: 1
  }
];

// Mock API keys
const mockApiKeys: APIKey[] = [
  {
    id: '1',
    name: 'Production API',
    key: 'gck_live_1234567890abcdef1234567890abcdef',
    permissions: ['read:tickets', 'write:tickets', 'read:customers'],
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: '2',
    name: 'Integration Test',
    key: 'gck_test_abcdef1234567890abcdef1234567890',
    permissions: ['read:tickets', 'read:customers'],
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-01-20'),
    isActive: true
  }
];

// Get all integrations
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    const filteredIntegrations = organizationFilter 
      ? mockIntegrations.filter(integration => integration.organizationId === organizationFilter)
      : mockIntegrations;

    res.json(filteredIntegrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ message: 'Failed to fetch integrations' });
  }
});

// Get single integration
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const integrationId = req.params.id;
    const integration = mockIntegrations.find(i => i.id === integrationId);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Check organization access
    if (!req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      if (integration.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(integration);
  } catch (error) {
    console.error('Error fetching integration:', error);
    res.status(500).json({ message: 'Failed to fetch integration' });
  }
});

// Toggle integration status
router.patch('/:id/toggle', isAuthenticated, requirePermission('integrations', 'edit'), async (req, res) => {
  try {
    const integrationId = req.params.id;
    const integration = mockIntegrations.find(i => i.id === integrationId);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Check organization access
    if (!req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      if (integration.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Toggle status
    integration.isActive = !integration.isActive;
    integration.status = integration.isActive ? 'connected' : 'inactive';

    res.json(integration);
  } catch (error) {
    console.error('Error toggling integration:', error);
    res.status(500).json({ message: 'Failed to toggle integration' });
  }
});

// Configure integration
router.put('/:id/config', isAuthenticated, requirePermission('integrations', 'edit'), async (req, res) => {
  try {
    const integrationId = req.params.id;
    const { config } = req.body;
    
    const integration = mockIntegrations.find(i => i.id === integrationId);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Check organization access
    if (!req.user?.isSuperUser && !req.user?.canCrossOrganizations) {
      if (integration.organizationId !== req.user?.organizationId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Update configuration
    integration.config = { ...integration.config, ...config };
    
    res.json(integration);
  } catch (error) {
    console.error('Error configuring integration:', error);
    res.status(500).json({ message: 'Failed to configure integration' });
  }
});

// Test integration connection
router.post('/:id/test', isAuthenticated, requirePermission('integrations', 'test'), async (req, res) => {
  try {
    const integrationId = req.params.id;
    const integration = mockIntegrations.find(i => i.id === integrationId);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Mock connection test
    const testResult = {
      success: Math.random() > 0.2, // 80% success rate
      message: Math.random() > 0.2 ? 'Connection successful' : 'Connection failed: Invalid credentials',
      testedAt: new Date(),
      latency: Math.floor(Math.random() * 1000) + 100 // 100-1100ms
    };

    res.json(testResult);
  } catch (error) {
    console.error('Error testing integration:', error);
    res.status(500).json({ message: 'Failed to test integration' });
  }
});

// Get integration statistics
router.get('/:id/stats', isAuthenticated, async (req, res) => {
  try {
    const integrationId = req.params.id;
    const integration = mockIntegrations.find(i => i.id === integrationId);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Mock statistics
    const stats = {
      totalEvents: Math.floor(Math.random() * 1000) + 100,
      successfulEvents: Math.floor(Math.random() * 900) + 90,
      failedEvents: Math.floor(Math.random() * 50) + 5,
      avgResponseTime: Math.floor(Math.random() * 500) + 100,
      lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      uptime: Math.random() * 10 + 90, // 90-100%
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching integration stats:', error);
    res.status(500).json({ message: 'Failed to fetch integration statistics' });
  }
});

// Webhook endpoints
router.get('/webhooks', isAuthenticated, async (req, res) => {
  try {
    const webhooks = mockIntegrations
      .filter(i => i.webhook && i.isActive)
      .map(i => ({
        integrationId: i.id,
        integrationName: i.name,
        url: i.webhook!.url,
        events: i.webhook!.events,
        lastTriggered: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      }));

    res.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ message: 'Failed to fetch webhooks' });
  }
});

// Create/update webhook
router.post('/webhooks', isAuthenticated, requirePermission('integrations', 'edit'), async (req, res) => {
  try {
    const { integrationId, url, events, secret } = req.body;
    
    const integration = mockIntegrations.find(i => i.id === integrationId);
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    integration.webhook = {
      url,
      events,
      secret: secret || `webhook_secret_${Date.now()}`
    };

    res.json(integration.webhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ message: 'Failed to create webhook' });
  }
});

// API Key management
router.get('/api-keys', isAuthenticated, requirePermission('integrations', 'view'), async (req, res) => {
  try {
    // Filter sensitive information for non-super users
    const safeApiKeys = mockApiKeys.map(key => ({
      ...key,
      key: req.user?.isSuperUser ? key.key : `${key.key.substring(0, 12)}...${key.key.substring(-4)}`
    }));

    res.json(safeApiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ message: 'Failed to fetch API keys' });
  }
});

// Create API key
router.post('/api-keys', isAuthenticated, requirePermission('integrations', 'create'), async (req, res) => {
  try {
    const { name, permissions, expiresIn } = req.body;

    const newApiKey: APIKey = {
      id: Date.now().toString(),
      name,
      key: `gck_${Math.random() > 0.5 ? 'live' : 'test'}_${generateRandomString(32)}`,
      permissions: permissions || ['read:tickets'],
      createdAt: new Date(),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : undefined,
      isActive: true
    };

    mockApiKeys.push(newApiKey);

    res.status(201).json(newApiKey);
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ message: 'Failed to create API key' });
  }
});

// Revoke API key
router.delete('/api-keys/:id', isAuthenticated, requirePermission('integrations', 'delete'), async (req, res) => {
  try {
    const keyId = req.params.id;
    const keyIndex = mockApiKeys.findIndex(k => k.id === keyId);

    if (keyIndex === -1) {
      return res.status(404).json({ message: 'API key not found' });
    }

    // Mark as inactive instead of deleting
    mockApiKeys[keyIndex].isActive = false;

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ message: 'Failed to revoke API key' });
  }
});

// Available integrations catalog
router.get('/catalog', isAuthenticated, async (req, res) => {
  try {
    const catalog = [
      {
        id: 'slack',
        name: 'Slack',
        description: 'Notificações de tickets em canais do Slack',
        category: 'chat',
        features: ['Notificações automáticas', 'Comandos interativos', 'Aprovações'],
        setupComplexity: 'easy'
      },
      {
        id: 'teams',
        name: 'Microsoft Teams',
        description: 'Colaboração e notificações em equipas',
        category: 'chat',
        features: ['Notificações', 'Bot integrado', 'Aprovações'],
        setupComplexity: 'medium'
      },
      {
        id: 'salesforce',
        name: 'Salesforce CRM',
        description: 'Sincronizar clientes e oportunidades',
        category: 'crm',
        features: ['Sync bidirecional', 'Criação automática de casos', 'Relatórios'],
        setupComplexity: 'hard'
      },
      {
        id: 'jira',
        name: 'Atlassian Jira',
        description: 'Sincronização com issues do Jira',
        category: 'crm',
        features: ['Sync issues', 'Comentários automáticos', 'Status mapping'],
        setupComplexity: 'medium'
      }
    ];

    res.json(catalog);
  } catch (error) {
    console.error('Error fetching integration catalog:', error);
    res.status(500).json({ message: 'Failed to fetch integration catalog' });
  }
});

// Helper function
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default router;