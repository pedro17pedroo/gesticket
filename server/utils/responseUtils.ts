import type { Response } from "express";
import type { ApiResponse } from "../models";

export function sendSuccess<T>(res: Response, data: T, message?: string): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  res.json(response);
}

export function sendError(res: Response, message: string, statusCode: number = 500): void {
  const response: ApiResponse = {
    success: false,
    error: message,
  };
  res.status(statusCode).json(response);
}