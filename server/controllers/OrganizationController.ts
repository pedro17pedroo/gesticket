import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
import { db } from '../db.js';
import { organizations, departments, users, companies } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { TenantUser, getAccessibleOrganizations } from '../middleware/tenantAccess.js';

export class OrganizationController extends BaseController {
  
  /**
   * Get organizations accessible by current user
   */
  async getOrganizations(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      
      if (!user) {
        return this.sendError(res, 'Unauthorized', 401);
      }

      const accessibleOrgIds = await getAccessibleOrganizations(user.id);
      
      let organizations;
      if (user.isSuperUser || user.canCrossOrganizations) {
        // Super users can see all organizations
        organizations = await db.query.organizations.findMany({
          with: {
            departments: true,
            users: {
              columns: { id: true, firstName: true, lastName: true, email: true }
            },
            companies: true
          }
        });
      } else {
        // Regular users see only their organization
        organizations = await db.query.organizations.findMany({
          where: eq(organizations.id, user.organizationId!),
          with: {
            departments: true,
            users: {
              columns: { id: true, firstName: true, lastName: true, email: true }
            },
            companies: true
          }
        });
      }

      return this.sendSuccess(res, organizations);
    } catch (error) {
      return this.sendError(res, 'Failed to fetch organizations', 500);
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganization(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const orgId = parseInt(req.params.id);
      
      if (!user) {
        return this.sendError(res, 'Unauthorized', 401);
      }

      // Check access permissions
      if (!user.isSuperUser && !user.canCrossOrganizations && user.organizationId !== orgId) {
        return this.sendError(res, 'Access denied to this organization', 403);
      }

      const organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, orgId),
        with: {
          departments: {
            with: {
              users: {
                columns: { id: true, firstName: true, lastName: true, email: true, role: true }
              }
            }
          },
          users: {
            columns: { id: true, firstName: true, lastName: true, email: true, role: true }
          },
          companies: true
        }
      });

      if (!organization) {
        return this.sendError(res, 'Organization not found', 404);
      }

      return this.sendSuccess(res, organization);
    } catch (error) {
      return this.sendError(res, 'Failed to fetch organization', 500);
    }
  }

  /**
   * Create new organization (system admin only)
   */
  async createOrganization(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      
      if (!user?.isSuperUser && user?.role !== 'system_admin') {
        return this.sendError(res, 'Only system administrators can create organizations', 403);
      }

      const { name, type, email, phone, address, website, taxId, industry, tier } = req.body;

      const [newOrg] = await db.insert(organizations).values({
        name,
        type,
        email,
        phone,
        address,
        website,
        taxId,
        industry,
        tier: tier || 'basic',
        isActive: true
      }).returning();

      // Create default departments for client organizations
      if (type === 'client_company') {
        const defaultDepartments = [
          { name: 'Administração', description: 'Administração geral' },
          { name: 'TI', description: 'Tecnologias de Informação' },
          { name: 'Suporte', description: 'Suporte ao utilizador' }
        ];

        await db.insert(departments).values(
          defaultDepartments.map(dept => ({
            ...dept,
            organizationId: newOrg.id,
            isActive: true
          }))
        );
      }

      return this.sendSuccess(res, newOrg);
    } catch (error) {
      return this.sendError(res, 'Failed to create organization', 500);
    }
  }

  /**
   * Update organization
   */
  async updateOrganization(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const orgId = parseInt(req.params.id);
      
      if (!user) {
        return this.sendError(res, 'Unauthorized', 401);
      }

      // Check permissions: super user, system admin, or company admin of the org
      const canEdit = user.isSuperUser || 
                      user.role === 'system_admin' ||
                      (user.organizationId === orgId && user.role === 'company_admin');

      if (!canEdit) {
        return this.sendError(res, 'Insufficient permissions to edit this organization', 403);
      }

      const { name, email, phone, address, website, taxId, industry, tier, isActive } = req.body;

      const [updatedOrg] = await db.update(organizations)
        .set({
          name,
          email,
          phone,
          address,
          website,
          taxId,
          industry,
          tier,
          isActive,
          updatedAt: new Date()
        })
        .where(eq(organizations.id, orgId))
        .returning();

      if (!updatedOrg) {
        return this.sendError(res, 'Organization not found', 404);
      }

      return this.sendSuccess(res, updatedOrg);
    } catch (error) {
      return this.sendError(res, 'Failed to update organization', 500);
    }
  }

  /**
   * Get organization dashboard data
   */
  async getOrganizationDashboard(req: Request, res: Response) {
    try {
      const user = req.user as TenantUser;
      const orgId = parseInt(req.params.id);
      
      if (!user) {
        return this.sendError(res, 'Unauthorized', 401);
      }

      // Check access permissions
      if (!user.isSuperUser && !user.canCrossOrganizations && user.organizationId !== orgId) {
        return this.sendError(res, 'Access denied to this organization', 403);
      }

      // Get organization with related data
      const organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, orgId),
        with: {
          departments: {
            with: {
              tickets: {
                columns: { id: true, status: true, priority: true, createdAt: true }
              }
            }
          },
          tickets: {
            columns: { id: true, status: true, priority: true, createdAt: true }
          },
          users: {
            columns: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true }
          },
          companies: {
            columns: { id: true, name: true, tier: true, isActive: true }
          }
        }
      });

      if (!organization) {
        return this.sendError(res, 'Organization not found', 404);
      }

      // Calculate statistics
      const stats = {
        totalTickets: organization.tickets?.length || 0,
        openTickets: organization.tickets?.filter(t => t.status === 'open').length || 0,
        inProgressTickets: organization.tickets?.filter(t => t.status === 'in_progress').length || 0,
        resolvedTickets: organization.tickets?.filter(t => t.status === 'resolved').length || 0,
        totalDepartments: organization.departments?.length || 0,
        totalUsers: organization.users?.length || 0,
        activeUsers: organization.users?.filter(u => u.isActive).length || 0,
        totalCompanies: organization.companies?.length || 0,
        activeCompanies: organization.companies?.filter(c => c.isActive).length || 0
      };

      return this.sendSuccess(res, {
        organization,
        stats
      });
    } catch (error) {
      return this.sendError(res, 'Failed to fetch organization dashboard', 500);
    }
  }
}