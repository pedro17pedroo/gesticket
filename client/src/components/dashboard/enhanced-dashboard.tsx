import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TicketIcon, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface DashboardStats {
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  priority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  customers: number;
  users: number;
  recentTickets: Array<{
    id: number;
    title: string;
    priority: string;
    status: string;
    createdAt: string;
    customer?: { name: string };
  }>;
  metrics: {
    avgResponseTime: string;
    slaCompliance: string;
    satisfaction: string;
  };
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6'
};

const PRIORITY_COLORS = {
  critical: COLORS.danger,
  high: COLORS.warning,
  medium: COLORS.info,
  low: COLORS.success
};

export default function EnhancedDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: trends } = useQuery({
    queryKey: ['/api/dashboard/trends'],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const ticketStatusData = [
    { name: 'Abertos', value: stats.tickets.open, color: COLORS.warning },
    { name: 'Em Progresso', value: stats.tickets.inProgress, color: COLORS.info },
    { name: 'Resolvidos', value: stats.tickets.resolved, color: COLORS.success },
    { name: 'Fechados', value: stats.tickets.closed, color: '#6b7280' }
  ];

  const priorityData = [
    { name: 'Crítica', value: stats.priority.critical, color: PRIORITY_COLORS.critical },
    { name: 'Alta', value: stats.priority.high, color: PRIORITY_COLORS.high },
    { name: 'Média', value: stats.priority.medium, color: PRIORITY_COLORS.medium },
    { name: 'Baixa', value: stats.priority.low, color: PRIORITY_COLORS.low }
  ];

  const slaCompliance = parseFloat(stats.metrics.slaCompliance);
  const satisfactionScore = parseFloat(stats.metrics.satisfaction.split('/')[0]) * 20; // Convert to percentage

  return (
    <div className="space-y-6 p-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tickets.total}</p>
                <p className="text-xs text-green-600">
                  {stats.tickets.resolved} resolvidos
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TicketIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
                <p className="text-xs text-blue-600">
                  {stats.users} utilizadores
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio de Resposta</p>
                <p className="text-2xl font-bold text-gray-900">{stats.metrics.avgResponseTime}</p>
                <p className="text-xs text-green-600">
                  SLA: {stats.metrics.slaCompliance}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfação do Cliente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.metrics.satisfaction}</p>
                <Progress value={satisfactionScore} className="mt-2" />
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tickets">Análise de Tickets</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recent">Atividade Recente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={ticketStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {ticketStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {ticketStatusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribuição por Prioridade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart */}
          {trends && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Tendência de Tickets (7 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="created"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Urgent Tickets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Tickets Urgentes
                </CardTitle>
                <CardDescription>
                  Prioridade crítica e alta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {stats.priority.critical + stats.priority.high}
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Crítica</span>
                    <Badge variant="destructive">{stats.priority.critical}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Alta</span>
                    <Badge variant="secondary">{stats.priority.high}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SLA Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Conformidade SLA
                </CardTitle>
                <CardDescription>
                  Taxa de cumprimento dos acordos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.metrics.slaCompliance}
                </div>
                <Progress value={slaCompliance} className="mt-4" />
                <p className="text-sm text-gray-600 mt-2">
                  Meta: 95%
                </p>
              </CardContent>
            </Card>

            {/* Resolution Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Activity className="h-5 w-5" />
                  Taxa de Resolução
                </CardTitle>
                <CardDescription>
                  Tickets resolvidos vs. total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.tickets.total > 0 
                    ? Math.round((stats.tickets.resolved / stats.tickets.total) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {stats.tickets.resolved} de {stats.tickets.total} tickets
                </div>
                <Progress 
                  value={stats.tickets.total > 0 ? (stats.tickets.resolved / stats.tickets.total) * 100 : 0} 
                  className="mt-4" 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tempo Médio de Resposta</span>
                  <Badge variant="outline">{stats.metrics.avgResponseTime}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Satisfação do Cliente</span>
                  <Badge variant="outline">{stats.metrics.satisfaction}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">SLA Compliance</span>
                  <Badge variant="outline">{stats.metrics.slaCompliance}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <TicketIcon className="mr-2 h-4 w-4" />
                  Criar Novo Ticket
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Ver Tickets Urgentes
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Relatórios Detalhados
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gestão de Clientes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tickets Recentes
              </CardTitle>
              <CardDescription>
                Últimos tickets criados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{ticket.title}</h4>
                      <p className="text-xs text-gray-600">
                        Cliente: {ticket.customer?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={ticket.priority === 'critical' ? 'destructive' : 'secondary'}
                      >
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}