import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Clock, Users, Star, AlertTriangle,
  Download, Calendar, Filter, Target, DollarSign 
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, subDays, format } from "date-fns";
import MainLayout from "@/components/layout/main-layout";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdvancedReports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedMetric, setSelectedMetric] = useState("tickets");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");

  // Fetch comprehensive analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["advanced-analytics", dateRange, selectedMetric, selectedCustomer],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange?.from?.toISOString() || "",
        to: dateRange?.to?.toISOString() || "",
        metric: selectedMetric,
        customer: selectedCustomer,
      });
      
      const response = await fetch(`/api/analytics/comprehensive?${params}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    enabled: !!dateRange,
  });

  // Fetch customers for filter
  const { data: customers = [] } = useQuery({
    queryKey: ["customers-list"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  // Mock data for demonstration (replace with real data)
  const mockData = {
    slaPerformance: [
      { name: "Crítico", target: 95, actual: 88, tickets: 45 },
      { name: "Alto", target: 90, actual: 94, tickets: 120 },
      { name: "Médio", target: 85, actual: 92, tickets: 280 },
      { name: "Baixo", target: 80, actual: 96, tickets: 150 },
    ],
    ticketTrends: [
      { date: "2024-01-01", created: 45, resolved: 42, backlog: 3 },
      { date: "2024-01-02", created: 52, resolved: 48, backlog: 7 },
      { date: "2024-01-03", created: 38, resolved: 45, backlog: 0 },
      { date: "2024-01-04", created: 41, resolved: 39, backlog: 2 },
      { date: "2024-01-05", created: 48, resolved: 50, backlog: 0 },
    ],
    categoryDistribution: [
      { name: "Suporte", value: 45, color: "#0088FE" },
      { name: "Incidente", value: 30, color: "#00C49F" },
      { name: "Otimização", value: 15, color: "#FFBB28" },
      { name: "Feature", value: 10, color: "#FF8042" },
    ],
    agentPerformance: [
      { name: "João Silva", resolved: 145, avgTime: 2.3, satisfaction: 4.8 },
      { name: "Maria Santos", resolved: 132, avgTime: 1.9, satisfaction: 4.9 },
      { name: "Pedro Costa", resolved: 118, avgTime: 2.1, satisfaction: 4.7 },
      { name: "Ana Oliveira", resolved: 98, avgTime: 2.5, satisfaction: 4.6 },
    ],
    customerSatisfaction: [
      { month: "Jan", score: 4.2, responses: 234 },
      { month: "Fev", score: 4.3, responses: 198 },
      { month: "Mar", score: 4.5, responses: 267 },
      { month: "Abr", score: 4.4, responses: 245 },
      { month: "Mai", score: 4.6, responses: 289 },
    ],
    financialMetrics: {
      totalRevenue: 125000,
      totalCosts: 85000,
      profitMargin: 32,
      hourlyRates: [
        { customer: "Cliente A", rate: 120, hours: 85 },
        { customer: "Cliente B", rate: 95, hours: 120 },
        { customer: "Cliente C", rate: 150, hours: 65 },
      ]
    }
  };

  const exportReport = () => {
    // Implementation for PDF/Excel export
    console.log("Exporting report...");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Relatórios Avançados</h1>
            <p className="text-muted-foreground">
              Análises detalhadas e métricas de performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="text-sm font-medium">Período</label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Clientes</SelectItem>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Métrica</label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tickets">Tickets</SelectItem>
                    <SelectItem value="sla">SLA</SelectItem>
                    <SelectItem value="satisfaction">Satisfação</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sla">Performance SLA</TabsTrigger>
            <TabsTrigger value="agents">Agentes</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tickets Resolvidos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">493</div>
                  <p className="text-xs text-muted-foreground">
                    +12% em relação ao mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio de Resolução</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.3h</div>
                  <p className="text-xs text-muted-foreground">
                    -8% em relação ao mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfação (CSAT)</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.6/5</div>
                  <p className="text-xs text-muted-foreground">
                    +0.2 pontos este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance SLA</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground">
                    Meta: 95%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Ticket Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Tickets</CardTitle>
                <CardDescription>
                  Criação vs Resolução de tickets ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockData.ticketTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="created" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="resolved" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={mockData.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockData.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Satisfação do Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={mockData.customerSatisfaction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[3, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sla" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance de SLA por Prioridade</CardTitle>
                <CardDescription>
                  Comparação entre metas e performance atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.slaPerformance.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.name}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.tickets} tickets
                          </span>
                        </div>
                        <div className="text-sm">
                          {item.actual}% / {item.target}%
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress value={item.actual} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Atual: {item.actual}%</span>
                          <span>Meta: {item.target}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Agentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.agentPerformance.map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {agent.resolved} tickets resolvidos
                        </p>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{agent.avgTime}h</div>
                          <div className="text-muted-foreground">Tempo médio</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {agent.satisfaction}
                          </div>
                          <div className="text-muted-foreground">Satisfação</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {mockData.financialMetrics.totalRevenue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Custos Totais</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {mockData.financialMetrics.totalCosts.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockData.financialMetrics.profitMargin}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Receita por Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockData.financialMetrics.hourlyRates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="customer" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" fill="#8884d8" name="Taxa Horária (R$)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}