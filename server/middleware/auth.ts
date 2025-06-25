import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, userRoles, roles, permissions, rolePermissions, organizations } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { AuthService } from '../services/AuthService';
import { logger } from '../utils/logger';

// Development user creation for secure local testing
async function createDevelopmentUser() {
  try {
    // Get or create system organization
    let systemOrg = await db.query.organizations.findFirst({
      where: eq(organizations.type, 'system_owner'),
    });

    if (!systemOrg) {
      [systemOrg] = await db.insert(organizations).values({
        name: 'GeckoStream System',
        type: 'system_owner',
        isActive: true,
      }).returning();
    }

    // Check if development user already exists
    const devUserId = 'dev-user-' + Date.now();
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, 'admin@geckostream.com'),
    });

    if (existingUser) {
      return await AuthService.getUserWithPermissions(existingUser.id);
    }

    // Create development user with super admin privileges
    const [newUser] = await db.insert(users).values({
      id: devUserId,
      email: 'admin@geckostream.com',
      firstName: 'Development',
      lastName: 'Admin',
      role: 'super_admin',
      organizationId: systemOrg.id,
      isActive: true,
    }).returning();

    logger.info('Created development user', { userId: newUser.id, email: newUser.email });
    return await AuthService.getUserWithPermissions(newUser.id);
  } catch (error) {
    logger.error('Failed to create development user', { error });
    throw error;
  }
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        role: string;
        organizationId?: number;
        departmentId?: number;
        isSuperUser: boolean;
        canCrossDepartments: boolean;
        canCrossOrganizations: boolean;
        permissions: string[];
      };
    }
  }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Development mode: Check for valid session first, then create test user if needed
    if (process.env.NODE_ENV === 'development') {
      // If no user in session and no user object, try to create development user
      if (!req.user && !req.session?.user) {
        try {
          const testUser = await createDevelopmentUser();
          req.user = testUser;
          req.session.user = { id: testUser.id };
          return next();
        } catch (devError) {
          logger.error('Failed to create development user', { error: devError });
          return res.status(500).json({ message: 'Development authentication failed' });
        }
      }
      
      // If user exists in session but not populated, load it
      if (!req.user && req.session?.user) {
        try {
          const userWithPermissions = await AuthService.getUserWithPermissions(req.session.user.id);
          if (userWithPermissions) {
            req.user = {
              id: userWithPermissions.id,
              email: userWithPermissions.email || undefined,
              firstName: userWithPermissions.firstName || undefined,
              lastName: userWithPermissions.lastName || undefined,
              role: userWithPermissions.role,
              organizationId: userWithPermissions.organizationId || undefined,
              departmentId: userWithPermissions.departmentId || undefined,
              isSuperUser: userWithPermissions.isSuperUser,
              canCrossDepartments: userWithPermissions.canCrossDepartments,
              canCrossOrganizations: userWithPermissions.canCrossOrganizations,
              permissions: userWithPermissions.permissions,
            };
            return next();
          }
        } catch (loadError) {
          logger.error('Failed to load user from session', { userId: req.session.user.id, error: loadError });
        }
      }
      
      // If we have a user object, proceed
      if (req.user) {
        return next();
      }
    }

    // Production mode: Strict authentication required
    if (!req.user && !req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // If user is in session but not in req.user, populate it
    if (!req.user && req.session?.user) {
      const userWithPermissions = await AuthService.getUserWithPermissions(req.session.user.id);

      if (!userWithPermissions) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = {
        id: userWithPermissions.id,
        email: userWithPermissions.email || undefined,
        firstName: userWithPermissions.firstName || undefined,
        lastName: userWithPermissions.lastName || undefined,
        role: userWithPermissions.role,
        organizationId: userWithPermissions.organizationId || undefined,
        departmentId: userWithPermissions.departmentId || undefined,
        isSuperUser: userWithPermissions.isSuperUser,
        canCrossDepartments: userWithPermissions.canCrossDepartments,
        canCrossOrganizations: userWithPermissions.canCrossOrganizations,
        permissions: userWithPermissions.permissions,
      };
    }

    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    res.status(500).json({ message: 'Authentication error' });
  }
};

export const requirePermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Super admin has all permissions
    if (req.user.isSuperUser || req.user.permissions.includes('*')) {
      return next();
    }

    // Check specific permission
    const permissionName = `${action}_${resource}`;
    if (req.user.permissions.includes(permissionName)) {
      return next();
    }

    return res.status(403).json({ message: 'Insufficient permissions' });
  };
};

export const requireRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.isSuperUser || requiredRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ message: 'Insufficient role permissions' });
  };
};