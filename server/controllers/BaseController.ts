import type { Request, Response } from "express";
import type { ApiResponse, AuthenticatedUser } from "../models";

export abstract class BaseController {
  protected success<T>(res: Response, data: T, message?: string): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    res.json(response);
  }

  protected error(res: Response, message: string, statusCode: number = 500): void {
    const response: ApiResponse = {
      success: false,
      error: message,
    };
    res.status(statusCode).json(response);
  }

  protected getAuthenticatedUser(req: Request): AuthenticatedUser {
    const user = (req as any).user;
    if (!user || !user.claims) {
      throw new Error("User not authenticated");
    }

    return {
      id: user.claims.sub,
      email: user.claims.email,
      firstName: user.claims.first_name,
      lastName: user.claims.last_name,
      role: user.claims.role || 'client_user',
      profileImageUrl: user.claims.profile_image_url,
    };
  }

  protected async handleRequest<T>(
    req: Request,
    res: Response,
    handler: () => Promise<T>
  ): Promise<void> {
    try {
      const result = await handler();
      this.success(res, result);
    } catch (error) {
      console.error("Controller error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      this.error(res, message);
    }
  }
}