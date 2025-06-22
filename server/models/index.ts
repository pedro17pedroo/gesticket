// Re-export all types from shared schema
export * from "@shared/schema";

// Additional model types specific to the backend
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  overdueTickets: number;
  avgResolutionTime: number;
  slaCompliance: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  profileImageUrl?: string;
}