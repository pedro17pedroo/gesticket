import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
import { db } from '../db.js';
import { departments, users, tickets } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { TenantUser, getAccessibleDepartments } from '../middleware/tenantAccess.js';

export class DepartmentController extends BaseController {
  
  /**
   * Get departments accessible by current user
   */
  async getDepartments(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
      
      if (!user) {
        return this.sendError(res, 'Unauthorized', 401);
      }

      let departmentsList;
      
      if (user.isSuperUser || user.canCrossOrganizations) {
        // Super users can see all departments
        const query = organizationId 
          ? eq(departments.organizationId, organizationId)
          : undefined;
        
        departmentsList = await db.query.departments.findMany({
          where: query,
          with: {
            organization: {
              columns: { id: true, name: true, type: true }
            },
            manager: {
              columns: { id: true, firstName: true, lastName: true, email: true }
            },
            users: {
              columns: { id: true, firstName: true, lastName: true, email: true, role: true }
            },
            tickets: {
              columns: { id: true, status: true, priority: true, createdAt: true }
            }
          }
        });
      } else if (user.canCrossDepartments && user.organizationId) {
        // Cross-department users see all departments in their organization
        departmentsList = await db.query.departments.findMany({
          where: eq(departments.organizationId, user.organizationId),
          with: {
            organization: {
              columns: { id: true, name: true, type: true }
            },
            manager: {
              columns: { id: true, firstName: true, lastName: true, email: true }
            },
            users: {
              columns: { id: true, firstName: true, lastName: true, email: true, role: true }
            },
            tickets: {
              columns: { id: true, status: true, priority: true, createdAt: true }
            }
          }
        });
      } else if (user.departmentId) {
        // Regular users see only their department
        departmentsList = await db.query.departments.findMany({
          where: eq(departments.id, user.departmentId),
          with: {
            organization: {
              columns: { id: true, name: true, type: true }
            },
            manager: {
              columns: { id: true, firstName: true, lastName: true, email: true }
            },
            users: {
              columns: { id: true, firstName: true, lastName: true, email: true, role: true }
            },
            tickets: {
              columns: { id: true, status: true, priority: true, createdAt: true }
            }
          }
        });
      } else {
        departmentsList = [];
      }

      return this.sendSuccess(res, departmentsList);
    } catch (error) {
      return this.sendError(res, 'Failed to fetch departments', 500);
    }
  }

  /**
   * Get department by ID
   */
  async getDepartment(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const deptId = parseInt(req.params.id);
      
      if (!user) {
        return this.sendError(res, 'Unauthorized', 401);
      }

      const department = await db.query.departments.findFirst({
        where: eq(departments.id, deptId),
        with: {
          organization: true,
          parentDepartment: true,
          subDepartments: true,
          manager: {
            columns: { id: true, firstName: true, lastName: true, email: true, role: true }
          },
          users: {
            columns: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true }
          },
          tickets: {
            with: {
              assignee: {
                columns: { id: true, firstName: true, lastName: true }
              },
              createdBy: {
                columns: { id: true, firstName: true, lastName: true }
              }
            }
          }
        }
      });

      if (!department) {
        return this.sendError(res, 'Department not found', 404);
      }

      // Check access permissions
      const hasAccess = user.isSuperUser || 
                       user.canCrossOrganizations ||
                       (user.canCrossDepartments && user.organizationId === department.organizationId) ||
                       user.departmentId === deptId;

      if (!hasAccess) {
        return this.sendError(res, 'Access denied to this department', 403);
      }

      return this.sendSuccess(res, department);
    } catch (error) {
      return this.sendError(res, 'Failed to fetch department', 500);
    }
  }

  /**
   * Create new department
   */
  async createDepartment(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      
      if (!user) {
        return this.sendError(res, 'Unauthorized', 401);
      }

      const { name, description, organizationId, parentDepartmentId, managerId } = req.body;

      // Check permissions: super user, system admin, or company admin of the organization
      const canCreate = user.isSuperUser || 
                       user.role === 'system_admin' ||
                       (user.organizationId === organizationId && 
                        (user.role === 'company_admin' || user.role === 'company_manager'));

      if (!canCreate) {
        return this.sendError(res, 'Insufficient permissions to create department', 403);
      }

      const [newDept] = await db.insert(departments).values({
        name,
        description,
        organizationId,
        parentDepartmentId,
        managerId,
        isActive: true
      }).returning();

      return this.sendSuccess(res, newDept);
    } catch (error) {
      return this.sendError(res, 'Failed to create department', 500);
    }
  }

  /**
   * Update department
   */
  async updateDepartment(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const deptId = parseInt(req.params.id);
      
      if (!user) {
        return this.sendError(res, 'Unauthorized', 401);
      }

      // Get department to check organization
      const existingDept = await db.query.departments.findFirst({
        where: eq(departments.id, deptId)
      });

      if (!existingDept) {
        return this.sendError(res, 'Department not found', 404);
      }

      // Check permissions
      const canEdit = user.isSuperUser || 
                     user.role === 'system_admin' ||
                     (user.organizationId === existingDept.organizationId && 
                      (user.role === 'company_admin' || user.role === 'company_manager'));

      if (!canEdit) {
        return this.sendError(res, 'Insufficient permissions to edit this department', 403);
      }

      const { name, description, parentDepartmentId, managerId, isActive } = req.body;

      const [updatedDept] = await db.update(departments)
        .set({
          name,
          description,
          parentDepartmentId,
          managerId,
          isActive,
          updatedAt: new Date()
        })
        .where(eq(departments.id, deptId))
        .returning();

      return this.sendSuccess(res, updatedDept);
    } catch (error) {
      return this.sendError(res, 'Failed to update department', 500);
    }
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const deptId = parseInt(req.params.id);
      
      if (!user) {
        return this.sendError(res, 'Unauthorized', 401);
      }

      const department = await db.query.departments.findFirst({
        where: eq(departments.id, deptId),
        with: {
          users: {
            columns: { id: true, isActive: true }
          },
          tickets: {
            columns: { id: true, status: true, priority: true, createdAt: true }
          }
        }
      });

      if (!department) {
        return this.sendError(res, 'Department not found', 404);
      }

      // Check access permissions
      const hasAccess = user.isSuperUser || 
                       user.canCrossOrganizations ||
                       (user.canCrossDepartments && user.organizationId === department.organizationId) ||
                       user.departmentId === deptId;

      if (!hasAccess) {
        return this.sendError(res, 'Access denied to this department', 403);
      }

      // Calculate statistics
      const stats = {
        totalUsers: department.users?.length || 0,
        activeUsers: department.users?.filter(u => u.isActive).length || 0,
        totalTickets: department.tickets?.length || 0,
        openTickets: department.tickets?.filter(t => t.status === 'open').length || 0,
        inProgressTickets: department.tickets?.filter(t => t.status === 'in_progress').length || 0,
        resolvedTickets: department.tickets?.filter(t => t.status === 'resolved').length || 0,
        criticalTickets: department.tickets?.filter(t => t.priority === 'critical').length || 0,
        highPriorityTickets: department.tickets?.filter(t => t.priority === 'high').length || 0
      };

      return this.sendSuccess(res, {
        department: {
          id: department.id,
          name: department.name,
          description: department.description
        },
        stats
      });
    } catch (error) {
      return this.sendError(res, 'Failed to fetch department statistics', 500);
    }
  }

  /**
   * Assign user to department
   */
  async assignUserToDepartment(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const deptId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!user) {
        return this.sendError(res, 'Unauthorized', 401);
      }

      // Get department to check organization
      const department = await db.query.departments.findFirst({
        where: eq(departments.id, deptId)
      });

      if (!department) {
        return this.sendError(res, 'Department not found', 404);
      }

      // Check permissions
      const canAssign = user.isSuperUser || 
                       user.role === 'system_admin' ||
                       (user.organizationId === department.organizationId && 
                        (user.role === 'company_admin' || user.role === 'company_manager'));

      if (!canAssign) {
        return this.sendError(res, 'Insufficient permissions to assign users', 403);
      }

      // Update user's department
      const [updatedUser] = await db.update(users)
        .set({ 
          departmentId: deptId,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return this.sendError(res, 'User not found', 404);
      }

      return this.sendSuccess(res, { message: 'User assigned to department successfully' });
    } catch (error) {
      return this.sendError(res, 'Failed to assign user to department', 500);
    }
  }
}