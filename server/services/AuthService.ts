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
      console.error('Error creating/updating user:', error);
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
          // Simplified query to avoid complex nested relations
        }
      });

      if (!user) {
        return null;
      }

      // Build permissions array
      const userPermissions: string[] = [];
      user.userRoles.forEach(userRole => {
        userRole.role.rolePermissions.forEach(rolePermission => {
          userPermissions.push(rolePermission.permission.name);
        });
      });

      return {
        ...user,
        permissions: userPermissions,
      };
    } catch (error) {
      console.error('Error fetching user with permissions:', error);
      throw error;
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