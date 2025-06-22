import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../models";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("Global error handler:", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const response: ApiResponse = {
    success: false,
    error: message,
  };

  res.status(status).json(response);
}