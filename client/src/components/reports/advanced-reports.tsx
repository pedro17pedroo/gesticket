import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  Filter,
  PieChart,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  Send,
  Settings
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { pt } from 'date-fns/locale';
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
  Legend
} from 'recharts';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'productivity' | 'sla' | 'financial' | 'custom';
  parameters: Array<{
    name: string;
    type: 'date' | 'select' | 'multiselect' | 'number' | 'text';
    label: string;
    options?: string[];
    required: boolean;
  }>;
  isScheduled?: boolean;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
}

interface ReportData {
  summary: {
    totalTickets: number;
    resolvedTickets: number;
    avgResolutionTime: number;
    slaCompliance: number;
    customerSatisfaction: number;
  };
  trends: Array<{
    date: string;
    created: number;
    resolved: number;
    backlog: number;
  }>;
  performance: {
    byAgent: Array<{
      name: string;
      tickets: number;
      avgTime: number;
      satisfaction: number;
    }>;
    byCategory: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    byPriority: Array<{
      priority: string;
      count: number;
      avgResolution: number;
    }>;
  };
  sla: {
    compliance: number;
    breaches: number;
    criticalTickets: number;
  };
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'performance-summary',
    name: 'Relatório de Performance',
    description: 'Análise completa de performance da equipa e SLA',
    category: 'performance',
    parameters: [
      {
        name: 'dateRange',
        type: 'date',
        label: 'Período',
        required: true
      },
      {
        name: 'agents',
        type: 'multiselect',
        label: 'Agentes',
        options: ['Todos', 'João Silva', 'Maria Santos', 'Pedro Costa'],
        required: false
      }
    ]
  },
  {
    id: 'sla-compliance',
    name: 'Conformidade SLA',
    description: 'Relatório detalhado de cumprimento de SLA',
    category: 'sla',
    parameters: [
      {
        name: 'dateRange',
        type: 'date',
        label: 'Período',
        required: true
      },
      {
        name: 'slaLevel',
        type: 'select',
        label: 'Nível SLA',
        options: ['Todos', 'Crítico', 'Alto', 'Médio', 'Baixo'],
        required: false
      }
    ]
  },
  {
    id: 'productivity-analysis',
    name: 'Análise de Produtividade',
    description: 'Métricas de produtividade individual e de equipa',
    category: 'productivity',
    parameters: [
      {
        name: 'dateRange',
        type: 'date',
        label: 'Período',
        required: true
      },
      {
        name: 'department',
        type: 'select',
        label: 'Departamento',
        options: ['Todos', 'Suporte Técnico', 'Atendimento', 'Vendas'],
        required: false
      }
    ]
  },
  {
    id: 'financial-summary',
    name: 'Resumo Financeiro',
    description: 'Análise de custos e receitas por cliente',
    category: 'financial',
    parameters: [
      {
        name: 'dateRange',
        type: 'date',
        label: 'Período',
        required: true
      },
      {
        name: 'customers',
        type: 'multiselect',
        label: 'Clientes',
        options: ['Todos', 'Empresa Exemplo', 'TechCorp', 'InnovaCorp'],
        required: false
      }
    ]
  }
];

const mockReportData: ReportData = {
  summary: {
    totalTickets: 1247,
    resolvedTickets: 1089,
    avgResolutionTime: 4.2,
    slaCompliance: 94.5,
    customerSatisfaction: 4.3
  },
  trends: [
    { date: '2024-01-01', created: 45, resolved: 42, backlog: 15 },
    { date: '2024-01-02', created: 52, resolved: 48, backlog: 19 },
    { date: '2024-01-03', created: 38, resolved: 45, backlog: 12 },
    { date: '2024-01-04', created: 41, resolved: 39, backlog: 14 },
    { date: '2024-01-05', created: 48, resolved: 51, backlog: 11 },
    { date: '2024-01-06', created: 55, resolved: 49, backlog: 17 },
    { date: '2024-01-07', created: 43, resolved: 46, backlog: 14 }
  ],
  performance: {
    byAgent: [
      { name: 'João Silva', tickets: 45, avgTime: 3.2, satisfaction: 4.5 },
      { name: 'Maria Santos', tickets: 52, avgTime: 2.8, satisfaction: 4.3 },
      { name: 'Pedro Costa', tickets: 38, avgTime: 4.1, satisfaction: 4.1 },
      { name: 'Ana Ferreira', tickets: 41, avgTime: 3.5, satisfaction: 4.4 }
    ],
    byCategory: [
      { category: 'Hardware', count: 145, percentage: 25.8 },
      { category: 'Software', count: 203, percentage: 36.1 },
      { category: 'Rede', count: 89, percentage: 15.8 },
      { category: 'Email', count: 67, percentage: 11.9 },
      { category: 'Acesso', count: 58, percentage: 10.3 }
    ],
    byPriority: [
      { priority: 'Crítica', count: 23, avgResolution: 1.2 },
      { priority: 'Alta', count: 87, avgResolution: 2.8 },
      { priority: 'Média', count: 298, avgResolution: 4.2 },
      { priority: 'Baixa', count: 153, avgResolution: 8.5 }
    ]
  },
  sla: {
    compliance: 94.5,
    breaches: 23,
    criticalTickets: 15
  }
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdvancedReports() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportParameters, setReportParameters] = useState<Record<string, any>>({});
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: scheduledReports = [] } = useQuery({
    queryKey: ['/api/reports/scheduled'],
    staleTime: 300000, // 5 minutes
  });

  const generateReport = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGeneratedReport(mockReportData);
    setIsGenerating(false);
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // In real implementation, would call API to generate and download report
    console.log(`Exporting report in ${format} format`);
  };

  const scheduleReport = () => {
    // In real implementation, would save schedule to database
    console.log('Scheduling report');
  };

  const ReportPreview = () => {
    if (!generatedReport) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold">{generatedReport.summary.totalTickets}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolvidos</p>
                  <p className="text-2xl font-bold text-green-600">{generatedReport.summary.resolvedTickets}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-orange-600">{generatedReport.summary.avgResolutionTime}h</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">SLA</p>
                  <p className="text-2xl font-bold text-purple-600">{generatedReport.summary.slaCompliance}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Satisfação</p>
                  <p className="text-2xl font-bold text-yellow-600">{generatedReport.summary.customerSatisfaction}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ticket Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={generatedReport.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="created" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={generatedReport.performance.byCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="category"
                  >
                    {generatedReport.performance.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Agente</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={generatedReport.performance.byAgent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análise por Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedReport.performance.byPriority.map((item, index) => (
                  <div key={item.priority} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="font-medium">{item.priority}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.count} tickets</div>
                      <div className="text-sm text-gray-500">{item.avgResolution}h média</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Exportar Relatório</CardTitle>
            <CardDescription>Escolha o formato para exportação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => exportReport('pdf')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button onClick={() => exportReport('excel')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button onClick={() => exportReport('csv')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button onClick={scheduleReport} variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Agendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600">Gerar e gerir relatórios personalizados</p>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração do Relatório</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template">Template</Label>
                    <Select onValueChange={(value) => {
                      const template = reportTemplates.find(t => t.id === value);
                      setSelectedTemplate(template || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar template" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">{selectedTemplate.description}</p>
                        <Badge variant="outline">{selectedTemplate.category}</Badge>
                      </div>

                      {selectedTemplate.parameters.map(param => (
                        <div key={param.name}>
                          <Label htmlFor={param.name}>
                            {param.label}
                            {param.required && <span className="text-red-500">*</span>}
                          </Label>
                          
                          {param.type === 'date' && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {dateRange.from ? (
                                    dateRange.to ? (
                                      `${format(dateRange.from, 'dd/MM/yyyy', { locale: pt })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: pt })}`
                                    ) : (
                                      format(dateRange.from, 'dd/MM/yyyy', { locale: pt })
                                    )
                                  ) : (
                                    'Selecionar período'
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="range"
                                  selected={dateRange}
                                  onSelect={(range) => range && setDateRange(range)}
                                  numberOfMonths={2}
                                />
                              </PopoverContent>
                            </Popover>
                          )}

                          {param.type === 'select' && param.options && (
                            <Select onValueChange={(value) => setReportParameters(prev => ({ ...prev, [param.name]: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder={`Selecionar ${param.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {param.options.map(option => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {param.type === 'multiselect' && param.options && (
                            <div className="space-y-2">
                              {param.options.map(option => (
                                <div key={option} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${param.name}-${option}`}
                                    onCheckedChange={(checked) => {
                                      const currentValues = reportParameters[param.name] || [];
                                      if (checked) {
                                        setReportParameters(prev => ({
                                          ...prev,
                                          [param.name]: [...currentValues, option]
                                        }));
                                      } else {
                                        setReportParameters(prev => ({
                                          ...prev,
                                          [param.name]: currentValues.filter((v: string) => v !== option)
                                        }));
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`${param.name}-${option}`}>{option}</Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      <Button 
                        onClick={generateReport}
                        className="w-full"
                        disabled={isGenerating}
                      >
                        {isGenerating ? 'A gerar...' : 'Gerar Relatório'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Report Preview */}
            <div className="lg:col-span-2">
              {generatedReport ? (
                <ReportPreview />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum relatório gerado
                    </h3>
                    <p className="text-gray-600">
                      Selecione um template e configure os parâmetros para gerar um relatório.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="outline">{template.category}</Badge>
                    <div className="text-sm text-gray-600">
                      <p>{template.parameters.length} parâmetros configuráveis</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      Usar Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Agendados</CardTitle>
              <CardDescription>Geração automática de relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum relatório agendado
                </h3>
                <p className="text-gray-600 mb-4">
                  Configure relatórios para serem gerados automaticamente.
                </p>
                <Button>Configurar Agendamento</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}