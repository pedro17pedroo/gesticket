import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/components/layout/main-layout";
import AnalyticsOverview from "@/components/dashboard/analytics-overview";
import QuickActions from "@/components/dashboard/quick-actions";
import ConsistentCard from "@/components/common/consistent-card";
import PageHeader from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrendingUpIcon, ClockIcon, CheckCircleIcon, UsersIcon, TicketIcon, AlertTriangleIcon, BarChart3Icon } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { hasPermission } = usePermissions();

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    retry: false,
  });

  const breadcrumbs = [
    { label: "Dashboard" }
  ];

  const headerActions = hasPermission('tickets', 'create') ? (
    <Button onClick={() => setLocation('/tickets/new')}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Novo Ticket
    </Button>
  ) : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Visão geral do sistema de tickets"
          breadcrumbs={breadcrumbs}
          actions={headerActions}
        />

        {/* Analytics Overview */}
        <AnalyticsOverview stats={stats} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Recent Tickets */}
          <ConsistentCard
            title="Tickets Recentes"
            description="Últimos tickets criados"
            variant="elevated"
          >
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">Ticket #{i}00{i}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Problema de conexão</p>
                  </div>
                  <Badge variant="secondary">Aberto</Badge>
                </div>
              ))}
            </div>
          </ConsistentCard>

          {/* SLA Status */}
          <ConsistentCard
            title="Status SLA"
            description="Conformidade com acordos"
            variant="elevated"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Crítico</span>
                <Badge variant="destructive">88%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Alto</span>
                <Badge variant="default">94%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Médio</span>
                <Badge variant="secondary">92%</Badge>
              </div>
            </div>
          </ConsistentCard>

          {/* System Health */}
          <ConsistentCard
            title="Saúde do Sistema"
            description="Status dos componentes"
            variant="elevated"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">API</span>
                </div>
                <span className="text-sm text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Base de Dados</span>
                </div>
                <span className="text-sm text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">WebSocket</span>
                </div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
          </ConsistentCard>
        </div>
      </div>
    </MainLayout>
  );
}
