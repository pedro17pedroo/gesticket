import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Timer
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
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Legend,
  ComposedChart
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalTickets: number;
    avgResolutionTime: number;
    slaCompliance: number;
    customerSatisfaction: number;
    firstResponseTime: number;
    escalationRate: number;
  };
  trends: {
    ticketVolume: Array<{
      date: string;
      created: number;
      resolved: number;
      backlog: number;
    }>;
    responseTime: Array<{
      date: string;
      avgTime: number;
      target: number;
    }>;
    satisfaction: Array<{
      date: string;
      score: number;
      responses: number;
    }>;
  };
  performance: {
    byAgent: Array<{
      name: string;
      resolved: number;
      avgTime: number;
      satisfaction: number;
      active: number;
    }>;
    byCategory: Array<{
      category: string;
      count: number;
      avgResolution: number;
      escalations: number;
    }>;
    byPriority: Array<{
      priority: string;
      count: number;
      percentage: number;
      avgTime: number;
    }>;
  };
  sla: {
    compliance: Array<{
      level: string;
      target: number;
      actual: number;
      tickets: number;
    }>;
    breaches: Array<{
      date: string;
      breaches: number;
      total: number;
    }>;
  };
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  gray: '#6b7280'
};

// Mock data - in real app this would come from API
const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalTickets: 1247,
    avgResolutionTime: 4.2,
    slaCompliance: 94.5,
    customerSatisfaction: 4.3,
    firstResponseTime: 0.8,
    escalationRate: 12.3
  },
  trends: {
    ticketVolume: [
      { date: '2024-01-01', created: 45, resolved: 42, backlog: 15 },
      { date: '2024-01-02', created: 52, resolved: 48, backlog: 19 },
      { date: '2024-01-03', created: 38, resolved: 45, backlog: 12 },
      { date: '2024-01-04', created: 41, resolved: 39, backlog: 14 },
      { date: '2024-01-05', created: 48, resolved: 51, backlog: 11 },
      { date: '2024-01-06', created: 55, resolved: 49, backlog: 17 },
      { date: '2024-01-07', created: 43, resolved: 46, backlog: 14 }
    ],
    responseTime: [
      { date: '2024-01-01', avgTime: 0.9, target: 1.0 },
      { date: '2024-01-02', avgTime: 1.2, target: 1.0 },
      { date: '2024-01-03', avgTime: 0.7, target: 1.0 },
      { date: '2024-01-04', avgTime: 0.8, target: 1.0 },
      { date: '2024-01-05', avgTime: 1.1, target: 1.0 },
      { date: '2024-01-06', avgTime: 1.3, target: 1.0 },
      { date: '2024-01-07', avgTime: 0.6, target: 1.0 }
    ],
    satisfaction: [
      { date: '2024-01-01', score: 4.2, responses: 15 },
      { date: '2024-01-02', score: 4.1, responses: 18 },
      { date: '2024-01-03', score: 4.4, responses: 12 },
      { date: '2024-01-04', score: 4.3, responses: 16 },
      { date: '2024-01-05', score: 4.5, responses: 14 },
      { date: '2024-01-06', score: 4.0, responses: 20 },
      { date: '2024-01-07', score: 4.6, responses: 13 }
    ]
  },
  performance: {
    byAgent: [
      { name: 'João Silva', resolved: 45, avgTime: 3.2, satisfaction: 4.5, active: 8 },
      { name: 'Maria Santos', resolved: 52, avgTime: 2.8, satisfaction: 4.3, active: 12 },
      { name: 'Pedro Costa', resolved: 38, avgTime: 4.1, satisfaction: 4.1, active: 6 },
      { name: 'Ana Ferreira', resolved: 41, avgTime: 3.5, satisfaction: 4.4, active: 9 }
    ],
    byCategory: [
      { category: 'Hardware', count: 145, avgResolution: 6.2, escalations: 8 },
      { category: 'Software', count: 203, avgResolution: 3.1, escalations: 12 },
      { category: 'Rede', count: 89, avgResolution: 4.5, escalations: 15 },
      { category: 'Email', count: 67, avgResolution: 2.3, escalations: 3 },
      { category: 'Acesso', count: 78, avgResolution: 1.8, escalations: 2 }
    ],
    byPriority: [
      { priority: 'Crítica', count: 23, percentage: 4.1, avgTime: 1.2 },
      { priority: 'Alta', count: 87, percentage: 15.5, avgTime: 2.8 },
      { priority: 'Média', count: 298, percentage: 53.1, avgTime: 4.2 },
      { priority: 'Baixa', count: 153, percentage: 27.3, avgTime: 8.5 }
    ]
  },
  sla: {
    compliance: [
      { level: 'Crítica (1h)', target: 95, actual: 92, tickets: 23 },
      { level: 'Alta (4h)', target: 90, actual: 94, tickets: 87 },
      { level: 'Média (8h)', target: 85, actual: 96, tickets: 298 },
      { level: 'Baixa (24h)', target: 80, actual: 98, tickets: 153 }
    ],
    breaches: [
      { date: '2024-01-01', breaches: 3, total: 45 },
      { date: '2024-01-02', breaches: 5, total: 52 },
      { date: '2024-01-03', breaches: 2, total: 38 },
      { date: '2024-01-04', breaches: 4, total: 41 },
      { date: '2024-01-05', breaches: 3, total: 48 },
      { date: '2024-01-06', breaches: 6, total: 55 },
      { date: '2024-01-07', breaches: 2, total: 43 }
    ]
  }
};

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const { data: analytics = mockAnalyticsData } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics', timeRange, selectedMetric],
    staleTime: 300000, // 5 minutes
  });

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    trend, 
    trendValue, 
    icon, 
    color = 'blue' 
  }: {
    title: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">{value}</p>
              {unit && <span className="text-sm text-gray-500">{unit}</span>}
            </div>
            {trend && trendValue && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análises Avançadas</h1>
          <p className="text-gray-600">Métricas detalhadas e insights de performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total de Tickets"
          value={analytics.overview.totalTickets}
          trend="up"
          trendValue="+12%"
          icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
          color="blue"
        />
        <MetricCard
          title="Tempo Médio de Resolução"
          value={analytics.overview.avgResolutionTime}
          unit="h"
          trend="down"
          trendValue="-8%"
          icon={<Clock className="h-6 w-6 text-green-600" />}
          color="green"
        />
        <MetricCard
          title="Conformidade SLA"
          value={analytics.overview.slaCompliance}
          unit="%"
          trend="up"
          trendValue="+2%"
          icon={<Target className="h-6 w-6 text-purple-600" />}
          color="purple"
        />
        <MetricCard
          title="Satisfação do Cliente"
          value={analytics.overview.customerSatisfaction}
          unit="/5"
          trend="up"
          trendValue="+0.2"
          icon={<CheckCircle className="h-6 w-6 text-yellow-600" />}
          color="yellow"
        />
        <MetricCard
          title="Primeira Resposta"
          value={analytics.overview.firstResponseTime}
          unit="h"
          trend="down"
          trendValue="-15%"
          icon={<Timer className="h-6 w-6 text-indigo-600" />}
          color="indigo"
        />
        <MetricCard
          title="Taxa de Escalação"
          value={analytics.overview.escalationRate}
          unit="%"
          trend="down"
          trendValue="-3%"
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          color="red"
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Volume Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Volume de Tickets</CardTitle>
                <CardDescription>Criados vs. Resolvidos ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analytics.trends.ticketVolume}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="created" fill={COLORS.primary} name="Criados" />
                    <Bar dataKey="resolved" fill={COLORS.success} name="Resolvidos" />
                    <Line type="monotone" dataKey="backlog" stroke={COLORS.warning} name="Backlog" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Response Time Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Tempo de Primeira Resposta</CardTitle>
                <CardDescription>Tempo médio vs. meta SLA</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends.responseTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgTime" stroke={COLORS.primary} name="Tempo Médio" />
                    <Line type="monotone" dataKey="target" stroke={COLORS.danger} strokeDasharray="5 5" name="Meta" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle>Satisfação do Cliente</CardTitle>
                <CardDescription>Pontuação média e número de respostas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analytics.trends.satisfaction}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="score" domain={[0, 5]} />
                    <YAxis yAxisId="responses" orientation="right" />
                    <Tooltip />
                    <Area yAxisId="score" type="monotone" dataKey="score" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.6} name="Pontuação" />
                    <Bar yAxisId="responses" dataKey="responses" fill={COLORS.info} name="Respostas" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Prioridade</CardTitle>
                <CardDescription>Percentagem de tickets por nível</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analytics.performance.byPriority}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      nameKey="priority"
                    >
                      {analytics.performance.byPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance by Agent */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Agente</CardTitle>
                <CardDescription>Tickets resolvidos e tempo médio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.performance.byAgent.map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{agent.name}</h4>
                        <p className="text-sm text-gray-600">
                          {agent.resolved} resolvidos • {agent.active} ativos
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{agent.avgTime}h média</div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">★</span>
                          <span className="text-sm">{agent.satisfaction}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Categoria</CardTitle>
                <CardDescription>Volume e tempo de resolução</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.performance.byCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.primary} name="Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SLA Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Conformidade SLA por Nível</CardTitle>
                <CardDescription>Meta vs. Performance atual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.sla.compliance.map((sla) => (
                  <div key={sla.level} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{sla.level}</span>
                      <span className="text-sm">
                        {sla.actual}% / {sla.target}%
                      </span>
                    </div>
                    <Progress 
                      value={(sla.actual / sla.target) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      {sla.tickets} tickets processados
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SLA Breaches */}
            <Card>
              <CardHeader>
                <CardTitle>Violações de SLA</CardTitle>
                <CardDescription>Número de violações ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analytics.sla.breaches}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="breaches" fill={COLORS.danger} name="Violações" />
                    <Line type="monotone" dataKey="total" stroke={COLORS.info} name="Total Tickets" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {analytics.performance.byCategory.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total de Tickets</span>
                    <Badge variant="outline">{category.count}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tempo Médio</span>
                    <span className="text-sm font-medium">{category.avgResolution}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Escalações</span>
                    <Badge variant={category.escalations > 10 ? "destructive" : "default"}>
                      {category.escalations}
                    </Badge>
                  </div>
                  <Progress 
                    value={(category.count / analytics.overview.totalTickets) * 100} 
                    className="h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}