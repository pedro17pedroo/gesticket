import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/language-context";
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface SLAMetric {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  status: 'meeting' | 'warning' | 'breach';
}

interface SLAConfig {
  id: string;
  name: string;
  description: string;
  priority: string;
  responseTime: number;
  resolutionTime: number;
  active: boolean;
}

export default function SLA() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: slaMetrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/sla/metrics'],
    queryFn: () => [
      {
        id: '1',
        name: 'Tempo Médio de Resposta',
        target: 2,
        current: 1.8,
        unit: 'horas',
        status: 'meeting' as const
      },
      {
        id: '2',
        name: 'Taxa de Resolução no Prazo',
        target: 95,
        current: 92,
        unit: '%',
        status: 'warning' as const
      },
      {
        id: '3',
        name: 'Satisfação do Cliente (CSAT)',
        target: 4.5,
        current: 4.7,
        unit: '/5',
        status: 'meeting' as const
      },
      {
        id: '4',
        name: 'Tickets Escalados',
        target: 5,
        current: 8,
        unit: '%',
        status: 'breach' as const
      }
    ]
  });

  const { data: slaConfigs = [], isLoading: configsLoading } = useQuery({
    queryKey: ['/api/sla/configs'],
    queryFn: () => [
      {
        id: '1',
        name: 'Bronze SLA',
        description: 'Nível básico de suporte',
        priority: 'low',
        responseTime: 24,
        resolutionTime: 72,
        active: true
      },
      {
        id: '2',
        name: 'Silver SLA',
        description: 'Nível intermediário de suporte',
        priority: 'medium',
        responseTime: 8,
        resolutionTime: 48,
        active: true
      },
      {
        id: '3',
        name: 'Gold SLA',
        description: 'Nível premium de suporte',
        priority: 'high',
        responseTime: 4,
        resolutionTime: 24,
        active: true
      }
    ]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'meeting': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'breach': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'meeting': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <Clock className="h-4 w-4" />;
      case 'breach': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <MainLayout
      title="SLAs" 
      subtitle="Monitore acordos de nível de serviço"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 min-w-max">
              <TabsTrigger value="overview" className="whitespace-nowrap">Visão Geral</TabsTrigger>
              <TabsTrigger value="configs" className="whitespace-nowrap">Configurações</TabsTrigger>
            </TabsList>
          </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {slaMetrics.map((metric) => (
                  <Card key={metric.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {metric.name}
                      </CardTitle>
                      {getStatusIcon(metric.status)}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metric.current}{metric.unit}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Meta: {metric.target}{metric.unit}
                      </p>
                      <div className="mt-3">
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status === 'meeting' ? 'Atingindo Meta' : 
                           metric.status === 'warning' ? 'Atenção' : 'Fora da Meta'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Geral do SLA</CardTitle>
                  <CardDescription>
                    Percentual de tickets que atendem aos requisitos de SLA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Compliance Geral</span>
                      <span className="text-sm text-muted-foreground">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-green-600">156</div>
                        <div className="text-muted-foreground">Dentro do SLA</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-yellow-600">18</div>
                        <div className="text-muted-foreground">Em risco</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-red-600">6</div>
                        <div className="text-muted-foreground">Fora do SLA</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <div className="grid gap-6">
                {slaMetrics.map((metric) => (
                  <Card key={metric.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{metric.name}</CardTitle>
                          <CardDescription>
                            Meta: {metric.target}{metric.unit} | Atual: {metric.current}{metric.unit}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status === 'meeting' ? 'OK' : 
                           metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso</span>
                          <span>{Math.round((metric.current / metric.target) * 100)}%</span>
                        </div>
                        <Progress 
                          value={Math.min((metric.current / metric.target) * 100, 100)} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground">
                          {metric.status === 'meeting' 
                            ? 'Meta sendo atingida com sucesso' 
                            : metric.status === 'warning'
                            ? 'Atenção: próximo do limite da meta'
                            : 'Crítico: meta não está sendo atingida'
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="configs" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">Configurações de SLA</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie os acordos de nível de serviço por tipo de cliente
                </p>
              </div>
              <Button className="w-full sm:w-auto">
                <TrendingUp className="h-4 w-4 mr-2" />
                Nova Configuração
              </Button>
            </div>

            <div className="grid gap-4">
                {slaConfigs.map((config) => (
                  <Card key={config.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{config.name}</CardTitle>
                          <CardDescription>{config.description}</CardDescription>
                        </div>
                        <Badge variant={config.active ? "default" : "secondary"}>
                          {config.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground">Prioridade</div>
                          <div className="mt-1 capitalize">{config.priority}</div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">Tempo de Resposta</div>
                          <div className="mt-1">{config.responseTime}h</div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">Tempo de Resolução</div>
                          <div className="mt-1">{config.resolutionTime}h</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">Editar</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
      </div>
    </MainLayout>
  );
}
