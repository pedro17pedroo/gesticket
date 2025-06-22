import type { Request, Response } from "express";
import { BaseController } from "./BaseController";
import { UserService } from "../services/UserService";

export class UserController extends BaseController {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const authenticatedUser = this.getAuthenticatedUser(req);
      const user = await this.userService.getCurrentUser(authenticatedUser);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      return user;
    });
  }
}