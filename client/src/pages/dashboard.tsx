import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ModernLayout from "@/components/layout/modern-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PlusIcon, 
  TrendingUpIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  UsersIcon, 
  TicketIcon, 
  AlertTriangleIcon, 
  BarChart3Icon,
  ArrowUpIcon,
  ArrowDownIcon
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  activeTickets: number;
  slaCompliance: number;
  avgResponseTime: number;
  csatScore: number;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: statsResponse, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    retry: false,
  });

  const stats: DashboardStats = statsResponse?.data || {
    activeTickets: 0,
    slaCompliance: 0,
    avgResponseTime: 0,
    csatScore: 0
  };

  const StatCard = ({ title, value, icon: Icon, description, trend, trendValue, isLoading = false }: {
    title: string;
    value: string | number;
    icon: any;
    description: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    isLoading?: boolean;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{description}</span>
              {trend && trendValue && (
                <div className={`ml-2 flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {trend === 'up' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                  <span className="ml-1">{trendValue}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, action, icon: Icon, buttonText }: {
    title: string;
    description: string;
    action: () => void;
    icon: any;
    buttonText: string;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button onClick={action} className="w-full">
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <ModernLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo, {user?.firstName || 'Utilizador'}
          </h1>
          <p className="text-muted-foreground">
            Aqui está uma visão geral do seu sistema de tickets.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tickets Ativos"
            value={stats.activeTickets}
            icon={TicketIcon}
            description="Em aberto atualmente"
            trend="up"
            trendValue="+12%"
            isLoading={isLoading}
          />
          <StatCard
            title="SLA Compliance"
            value={`${stats.slaCompliance}%`}
            icon={CheckCircleIcon}
            description="Taxa de cumprimento"
            trend="up"
            trendValue="+5.2%"
            isLoading={isLoading}
          />
          <StatCard
            title="Tempo Resposta"
            value={`${stats.avgResponseTime}h`}
            icon={ClockIcon}
            description="Tempo médio"
            trend="down"
            trendValue="-15min"
            isLoading={isLoading}
          />
          <StatCard
            title="CSAT Score"
            value={`${stats.csatScore}%`}
            icon={TrendingUpIcon}
            description="Satisfação cliente"
            trend="up"
            trendValue="+3.1%"
            isLoading={isLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hasPermission('tickets', 'create') && (
            <QuickActionCard
              title="Novo Ticket"
              description="Criar um novo ticket de suporte rapidamente"
              action={() => setLocation('/tickets/new')}
              icon={PlusIcon}
              buttonText="Criar Ticket"
            />
          )}
          
          {hasPermission('tickets', 'list') && (
            <QuickActionCard
              title="Ver Tickets"
              description="Visualizar e gerir todos os tickets ativos"
              action={() => setLocation('/tickets')}
              icon={TicketIcon}
              buttonText="Ver Tickets"
            />
          )}
          
          {hasPermission('reports', 'view') && (
            <QuickActionCard
              title="Relatórios"
              description="Aceder a relatórios e análises detalhadas"
              action={() => setLocation('/reports')}
              icon={BarChart3Icon}
              buttonText="Ver Relatórios"
            />
          )}
        </div>

        {/* Priority Distribution */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangleIcon className="h-5 w-5" />
                <span>Tickets por Prioridade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Crítica</span>
                  <Badge variant="destructive">3</Badge>
                </div>
                <Progress value={15} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Alta</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <Progress value={60} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Média</span>
                  <Badge variant="outline">25</Badge>
                </div>
                <Progress value={80} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Baixa</span>
                  <Badge variant="outline">8</Badge>
                </div>
                <Progress value={40} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3Icon className="h-5 w-5" />
                <span>Performance Mensal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+12.5%</div>
              <p className="text-xs text-muted-foreground mb-4">
                +2.1% face ao mês anterior
              </p>
              <Progress value={75} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UsersIcon className="h-5 w-5" />
                <span>Utilizadores Ativos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground mb-4">
                +4.3% desde a semana passada
              </p>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                <span>Tendência positiva</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernLayout>
  );
}