import { Router } from 'express';
import { simpleAuth } from '../middleware/simpleAuth';

const router = Router();

// Get user permissions - simplified for development
router.get('/permissions', simpleAuth, (req, res) => {
  // In development, super admin has all permissions
  const allPermissions = [
    'tickets:list', 'tickets:create', 'tickets:view', 'tickets:edit', 'tickets:delete',
    'sla:view', 'sla:config', 'time:list', 'reports:view', 'reports:advanced',
    'knowledge:list', 'gamification:view', 'client_portal:view', 'client_portal:advanced',
    'settings:view', 'companies:manage', 'access_control:manage', 'organizations:manage',
    'system:manage', 'client_management:manage', 'users:manage'
  ];

  res.json({
    success: true,
    permissions: allPermissions
  });
});

export default router;