export interface DashboardStats {
  activeTickets: number;
  slaCompliance: number;
  avgResponseTime: number;
  csatScore: number;
}

export interface HourBankStatus {
  limit: number;
  used: number;
  remaining: number;
  percentage: number;
}

export interface WebSocketMessage {
  type: 'welcome' | 'ticket_created' | 'ticket_updated' | 'sla_alert' | 'ping' | 'pong';
  data?: any;
  message?: string;
}

export interface ActiveTimer {
  ticketId: number;
  startTime: Date;
  duration: number; // in seconds
  isRunning: boolean;
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketType = 'support' | 'incident' | 'optimization' | 'feature_request';
export type UserRole = 'end_user' | 'agent' | 'manager' | 'admin';
