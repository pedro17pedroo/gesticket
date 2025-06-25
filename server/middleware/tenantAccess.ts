import { Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { users, organizations, departments, userRoles, roles } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';

export interface TenantUser extends Express.User {
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
  organization?: any;
  department?: any;
  userRoles?: any[];
}

declare global {
  namespace Express {
    interface User extends TenantUser {}
  }
}

/**
 * Middleware to load user tenant information
 */
export async function loadTenantInfo(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.id) {
    return next();
  }

  try {
    const userWithTenant = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
      with: {
        organization: true,
        department: true,
        userRoles: {
          with: {
            role: {
              with: {
                rolePermissions: {
                  with: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (userWithTenant) {
      // Extend user object with tenant information
      req.user = {
        ...req.user,
        ...userWithTenant
      } as TenantUser;
    }

    next();
  } catch (error) {
    console.error('Error loading tenant info:', error);
    next();
  }
}

/**
 * Middleware to ensure user has access to a specific organization
 */
export function requireOrganizationAccess(organizationId?: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as TenantUser;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Super users can access everything
    if (user.isSuperUser || user.canCrossOrganizations) {
      return next();
    }

    // If no specific organization required, check if user has organization access
    if (!organizationId) {
      if (!user.organizationId) {
        return res.status(403).json({ error: 'No organization access' });
      }
      return next();
    }

    // Check if user belongs to the required organization
    if (user.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Organization access denied' });
    }

    next();
  };
}

/**
 * Middleware to ensure user has access to a specific department
 */
export function requireDepartmentAccess(departmentId?: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as TenantUser;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Super users and cross-department users can access everything
    if (user.isSuperUser || user.canCrossDepartments || user.canCrossOrganizations) {
      return next();
    }

    // If no specific department required, check if user has department access
    if (!departmentId) {
      if (!user.departmentId) {
        return res.status(403).json({ error: 'No department access' });
      }
      return next();
    }

    // Check if user belongs to the required department
    if (user.departmentId !== departmentId) {
      return res.status(403).json({ error: 'Department access denied' });
    }

    next();
  };
}

/**
 * Get organizations accessible by user
 */
export async function getAccessibleOrganizations(userId: string): Promise<number[]> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (!user) return [];

  // Super users can access all organizations
  if (user.isSuperUser || user.canCrossOrganizations) {
    const allOrgs = await db.query.organizations.findMany({
      columns: { id: true }
    });
    return allOrgs.map(org => org.id);
  }

  // Regular users can only access their organization
  return user.organizationId ? [user.organizationId] : [];
}

/**
 * Get departments accessible by user
 */
export async function getAccessibleDepartments(userId: string, organizationId?: number): Promise<number[]> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (!user) return [];

  // Super users can access all departments
  if (user.isSuperUser || user.canCrossOrganizations) {
    const query = organizationId 
      ? eq(departments.organizationId, organizationId)
      : undefined;
    
    const allDepts = await db.query.departments.findMany({
      where: query,
      columns: { id: true }
    });
    return allDepts.map(dept => dept.id);
  }

  // Cross-department users can access all departments in their organization
  if (user.canCrossDepartments && user.organizationId) {
    const orgDepts = await db.query.departments.findMany({
      where: eq(departments.organizationId, user.organizationId),
      columns: { id: true }
    });
    return orgDepts.map(dept => dept.id);
  }

  // Regular users can only access their department
  return user.departmentId ? [user.departmentId] : [];
}

/**
 * Filter query based on user access
 */
export function applyTenantFilters(userId: string, baseQuery: any) {
  // This will be implemented based on the specific query requirements
  // For now, return the base query
  return baseQuery;
}