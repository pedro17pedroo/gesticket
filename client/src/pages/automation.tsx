import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Zap, Play, Pause, Settings, AlertCircle } from 'lucide-react';

export default function AutomationPage() {
  const { data: automationRules = [], isLoading } = useQuery({
    queryKey: ['/api/automation'],
  });

  const toggleRule = (ruleId: string, enabled: boolean) => {
    // In real implementation, would call API to toggle rule
    console.log(`Toggle rule ${ruleId} to ${enabled}`);
  };

  const getTriggerBadge = (trigger: string) => {
    const colors = {
      'ticket_created': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'ticket_updated': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'ticket_resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'sla_breach': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'customer_satisfaction': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[trigger as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Automação</h1>
            <p className="text-muted-foreground">
              Gerir regras de automação e fluxos de trabalho
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Regra
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 desde o mês passado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Execuções Hoje</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">145</div>
              <p className="text-xs text-muted-foreground">
                +12% desde ontem
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.2%</div>
              <p className="text-xs text-muted-foreground">
                +0.5% desde a semana passada
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falhas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                -2 desde ontem
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Regras de Automação</CardTitle>
            <CardDescription>
              Visualizar e gerir todas as regras de automação ativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">A carregar regras de automação...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Execuções</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ativa</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automationRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Zap className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">Nenhuma regra de automação encontrada</p>
                          <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Criar primeira regra
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    automationRules.map((rule: any) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <Badge className={getTriggerBadge(rule.trigger)} variant="secondary">
                            {rule.trigger}
                          </Badge>
                        </TableCell>
                        <TableCell>{rule.action}</TableCell>
                        <TableCell>{rule.executionCount || 0}</TableCell>
                        <TableCell>
                          <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                            {rule.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}