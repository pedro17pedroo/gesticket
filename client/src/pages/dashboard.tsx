import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import MainLayout from "@/components/layout/main-layout";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentTickets from "@/components/dashboard/recent-tickets";
import SlaAlerts from "@/components/dashboard/sla-alerts";
import TimeTracker from "@/components/dashboard/time-tracker";
import HourBank from "@/components/dashboard/hour-bank";
import AnalyticsCharts from "@/components/dashboard/analytics-charts";
import { DashboardStats, WebSocketMessage } from "@/types";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
    };
    
    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message:', message);
        
        switch (message.type) {
          case 'ticket_created':
          case 'ticket_updated':
            // Refetch tickets and stats when tickets are updated
            // This will be handled by individual components
            break;
          case 'sla_alert':
            toast({
              title: "SLA Alert",
              description: message.message || "SLA deadline approaching",
              variant: "destructive",
            });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [isAuthenticated, toast]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: isAuthenticated,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [statsError, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout 
      title="Dashboard" 
      subtitle="Visão geral do sistema de tickets"
    >
      {/* Stats Cards */}
      <div className="mb-8">
        <StatsCards stats={stats} isLoading={statsLoading} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Tickets */}
        <div className="xl:col-span-2">
          <RecentTickets />
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          <SlaAlerts />
          <TimeTracker />
          <HourBank />
        </div>
      </div>
      
      {/* Analytics Charts */}
      <div className="mt-8">
        <AnalyticsCharts />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button 
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 group"
          onClick={() => {
            // TODO: Open new ticket modal
            toast({
              title: "New Ticket",
              description: "Opening new ticket form...",
            });
          }}
        >
          <PlusIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </Button>
      </div>
    </MainLayout>
  );
}
