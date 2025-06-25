import { db } from '../db';
import { users, userRoles, roles, permissions, rolePermissions, organizations } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { cache, CacheHelpers, CacheInvalidation } from '../utils/cache';
import { logger } from '../utils/logger';

export class AuthService {
  static async createOrUpdateUser(userData: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  }) {
    try {
      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userData.id),
      });

      if (existingUser) {
        // Update existing user
        const [updatedUser] = await db.update(users)
          .set({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userData.id))
          .returning();

        return updatedUser;
      } else {
        // Create new user - assign to system organization by default
        const systemOrg = await db.query.organizations.findFirst({
          where: eq(organizations.type, 'system_owner'),
        });

        const [newUser] = await db.insert(users)
          .values({
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            role: 'company_user',
            organizationId: systemOrg?.id || 1,
            isActive: true,
          })
          .returning();

        // Assign default role
        const defaultRole = await db.query.roles.findFirst({
          where: eq(roles.name, 'Utilizador Empresa'),
        });

        if (defaultRole) {
          await db.insert(userRoles)
            .values({
              userId: newUser.id,
              roleId: defaultRole.id,
              assignedBy: 'system',
            });
        }

        return newUser;
      }
    } catch (error) {
      logger.error('Error creating/updating user', { error, userData });
      throw error;
    }
  }

  static async getUserWithPermissions(userId: string) {
    try {
      // Use cache for frequently accessed user permissions
      const cacheKey = CacheHelpers.userPermissionsKey(userId);
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
          organization: true,
          department: true,
        }
      });

      if (!user) {
        return null;
      }

      // Get user permissions through direct query for better performance
      const userPermissions = await db
        .select({ name: permissions.name })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.isActive, true)
        ));

      const userWithPermissions = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        isSuperUser: user.role === 'super_admin',
        canCrossOrganizations: user.role === 'super_admin' || user.role === 'system_admin',
        canCrossDepartments: 
          user.role === 'super_admin' || 
          user.role === 'system_admin' || 
          user.role === 'company_admin' ||
          user.role === 'company_manager',
        permissions: userPermissions.map(p => p.name),
        organization: user.organization,
        department: user.department
      };

      // Cache the result for 5 minutes
      cache.set(cacheKey, userWithPermissions, 300000);
      return userWithPermissions;
    } catch (error) {
      logger.error('Error fetching user with permissions', { error, userId });
      return null;
    }
  }

  static async assignRole(userId: string, roleId: number, assignedBy: string) {
    try {
      // Check if user already has this role
      const existingAssignment = await db.query.userRoles.findFirst({
        where: and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        ),
      });

      if (existingAssignment) {
        // Update existing assignment
        const [updated] = await db.update(userRoles)
          .set({
            isActive: true,
            assignedBy,
            assignedAt: new Date(),
          })
          .where(eq(userRoles.id, existingAssignment.id))
          .returning();

        return updated;
      } else {
        // Create new role assignment
        const [newAssignment] = await db.insert(userRoles)
          .values({
            userId,
            roleId,
            assignedBy,
            isActive: true,
          })
          .returning();

        return newAssignment;
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  static async removeRole(userId: string, roleId: number) {
    try {
      const [removed] = await db.update(userRoles)
        .set({
          isActive: false,
        })
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        ))
        .returning();

      return removed;
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  }
}