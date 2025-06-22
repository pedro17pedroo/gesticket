import { db } from "../db";

export abstract class BaseRepository {
  protected db = db;

  protected handleError(error: any, operation: string): never {
    console.error(`${operation} error:`, error);
    throw new Error(`Database operation failed: ${operation}`);
  }

  protected async executeSafe<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, operationName);
    }
  }
}