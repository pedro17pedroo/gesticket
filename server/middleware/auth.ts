import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, userRoles, roles, permissions, rolePermissions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { AuthService } from '../services/AuthService';

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
    // Development mode: Check for valid session or create test user
    if (process.env.NODE_ENV === 'development') {
      if (!req.user && !req.session?.user) {
        // Only create test user if no session exists
        const testUser = await createDevelopmentUser();
        req.user = testUser;
        return next();
      }
    }

    // Check if user is authenticated via session
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
    console.error('Authentication error:', error);
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