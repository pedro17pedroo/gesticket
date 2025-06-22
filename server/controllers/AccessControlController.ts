import { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { storage } from "../storage";
import { 
  insertDepartmentSchema, 
  insertRoleSchema, 
  insertPermissionSchema, 
  insertRolePermissionSchema,
  insertUserRoleSchema 
} from "@shared/schema";

export class AccessControlController extends BaseController {
  // Department operations
  async getDepartments(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      return await storage.getDepartments();
    });
  }

  async getDepartmentById(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        throw new Error("Department not found");
      }
      return department;
    });
  }

  async createDepartment(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const validatedData = insertDepartmentSchema.parse(req.body);
      return await storage.createDepartment(validatedData);
    });
  }

  async updateDepartment(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      const validatedData = insertDepartmentSchema.partial().parse(req.body);
      return await storage.updateDepartment(id, validatedData);
    });
  }

  async deleteDepartment(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      await storage.deleteDepartment(id);
      return { message: "Department deleted successfully" };
    });
  }

  // Role operations
  async getRoles(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      return await storage.getRoles();
    });
  }

  async getRoleById(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      const role = await storage.getRole(id);
      if (!role) {
        throw new Error("Role not found");
      }
      return role;
    });
  }

  async createRole(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const validatedData = insertRoleSchema.parse(req.body);
      return await storage.createRole(validatedData);
    });
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      const validatedData = insertRoleSchema.partial().parse(req.body);
      return await storage.updateRole(id, validatedData);
    });
  }

  async deleteRole(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      await storage.deleteRole(id);
      return { message: "Role deleted successfully" };
    });
  }

  // Permission operations
  async getPermissions(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      return await storage.getPermissions();
    });
  }

  async getPermissionById(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const id = parseInt(req.params.id);
      const permission = await storage.getPermission(id);
      if (!permission) {
        throw new Error("Permission not found");
      }
      return permission;
    });
  }

  async createPermission(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const validatedData = insertPermissionSchema.parse(req.body);
      return await storage.createPermission(validatedData);
    });
  }

  // Role-Permission operations
  async getRolePermissions(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const roleId = parseInt(req.params.roleId);
      return await storage.getRolePermissions(roleId);
    });
  }

  async assignPermissionToRole(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const validatedData = insertRolePermissionSchema.parse(req.body);
      return await storage.assignPermissionToRole(validatedData);
    });
  }

  async removePermissionFromRole(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);
      await storage.removePermissionFromRole(roleId, permissionId);
      return { message: "Permission removed from role successfully" };
    });
  }

  // User-Role operations
  async getUserRoles(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const userId = req.params.userId;
      return await storage.getUserRoles(userId);
    });
  }

  async assignRoleToUser(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const currentUser = this.getAuthenticatedUser(req);
      const validatedData = insertUserRoleSchema.parse({
        ...req.body,
        assignedBy: currentUser.id
      });
      return await storage.assignRoleToUser(validatedData);
    });
  }

  async removeRoleFromUser(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const userId = req.params.userId;
      const roleId = parseInt(req.params.roleId);
      await storage.removeRoleFromUser(userId, roleId);
      return { message: "Role removed from user successfully" };
    });
  }
}