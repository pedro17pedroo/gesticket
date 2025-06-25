import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Zap, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Clock,
  AlertTriangle,
  Mail,
  MessageSquare,
  UserPlus,
  CheckCircle
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: {
    type: 'ticket_created' | 'ticket_updated' | 'sla_warning' | 'time_based';
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: 'assign_user' | 'send_email' | 'update_priority' | 'add_comment' | 'escalate';
    parameters: Record<string, any>;
  }>;
  lastTriggered?: Date;
  timesTriggered: number;
  createdAt: Date;
}

const mockRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Auto-atribuição por Categoria',
    description: 'Atribui automaticamente tickets de Hardware ao João Silva',
    isActive: true,
    trigger: {
      type: 'ticket_created',
      conditions: {
        category: 'Hardware'
      }
    },
    actions: [
      {
        type: 'assign_user',
        parameters: {
          userId: 'joao.silva@company.com'
        }
      }
    ],
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
    timesTriggered: 15,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Escalação SLA Crítico',
    description: 'Escala tickets críticos próximos do prazo SLA',
    isActive: true,
    trigger: {
      type: 'sla_warning',
      conditions: {
        priority: 'critical',
        timeRemaining: 30 // minutes
      }
    },
    actions: [
      {
        type: 'send_email',
        parameters: {
          to: 'manager@company.com',
          template: 'sla_warning'
        }
      },
      {
        type: 'update_priority',
        parameters: {
          priority: 'critical'
        }
      }
    ],
    lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000),
    timesTriggered: 3,
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Notificação Cliente Resolução',
    description: 'Envia email ao cliente quando ticket é resolvido',
    isActive: true,
    trigger: {
      type: 'ticket_updated',
      conditions: {
        status: 'resolved'
      }
    },
    actions: [
      {
        type: 'send_email',
        parameters: {
          to: 'customer',
          template: 'ticket_resolved'
        }
      }
    ],
    lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000),
    timesTriggered: 28,
    createdAt: new Date('2024-01-05')
  }
];

const triggerTypes = {
  ticket_created: 'Ticket Criado',
  ticket_updated: 'Ticket Atualizado',
  sla_warning: 'Aviso SLA',
  time_based: 'Baseado em Tempo'
};

const actionTypes = {
  assign_user: 'Atribuir Utilizador',
  send_email: 'Enviar Email',
  update_priority: 'Atualizar Prioridade',
  add_comment: 'Adicionar Comentário',
  escalate: 'Escalar'
};

const ActionIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'assign_user':
      return <UserPlus className="h-4 w-4" />;
    case 'send_email':
      return <Mail className="h-4 w-4" />;
    case 'update_priority':
      return <AlertTriangle className="h-4 w-4" />;
    case 'add_comment':
      return <MessageSquare className="h-4 w-4" />;
    case 'escalate':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};

export default function AutomationRules() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const queryClient = useQueryClient();

  // Mock query - in real app would fetch from API
  const { data: rules = mockRules } = useQuery<AutomationRule[]>({
    queryKey: ['/api/automation/rules'],
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ruleId, isActive };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/rules'] });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return ruleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/rules'] });
    },
  });

  const handleToggleRule = (ruleId: string, currentState: boolean) => {
    toggleRuleMutation.mutate({
      ruleId,
      isActive: !currentState
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Tem certeza que deseja eliminar esta regra?')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  const RuleCard = ({ rule }: { rule: AutomationRule }) => (
    <Card className={`transition-all ${rule.isActive ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{rule.name}</CardTitle>
              <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                {rule.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            <CardDescription className="mt-1">
              {rule.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={rule.isActive}
              onCheckedChange={() => handleToggleRule(rule.id, rule.isActive)}
              disabled={toggleRuleMutation.isPending}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Trigger */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Trigger</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {triggerTypes[rule.trigger.type]}
            </Badge>
            {Object.entries(rule.trigger.conditions).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {key}: {value}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Ações</h4>
          <div className="flex flex-wrap gap-2">
            {rule.actions.map((action, index) => (
              <div key={index} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                <ActionIcon type={action.type} />
                <span>{actionTypes[action.type]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <div className="flex items-center gap-4">
            <span>Executada {rule.timesTriggered}x</span>
            {rule.lastTriggered && (
              <span>Última: {rule.lastTriggered.toLocaleDateString('pt-PT')}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRule(rule)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteRule(rule.id)}
              disabled={deleteRuleMutation.isPending}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CreateRuleForm = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="ruleName">Nome da Regra</Label>
          <Input id="ruleName" placeholder="Ex: Auto-atribuição por categoria" />
        </div>
        
        <div>
          <Label htmlFor="ruleDescription">Descrição</Label>
          <Input id="ruleDescription" placeholder="Descrição do que a regra faz" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Trigger</h3>
        
        <div>
          <Label htmlFor="triggerType">Tipo de Trigger</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar trigger" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(triggerTypes).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="conditionField">Campo</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Campo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Prioridade</SelectItem>
                <SelectItem value="category">Categoria</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="assignee">Responsável</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="conditionValue">Valor</Label>
            <Input id="conditionValue" placeholder="Valor da condição" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Ações</h3>
        
        <div>
          <Label htmlFor="actionType">Tipo de Ação</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar ação" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(actionTypes).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="actionValue">Parâmetros da Ação</Label>
          <Input id="actionValue" placeholder="Ex: user@company.com" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
          Cancelar
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(false)}>
          Criar Regra
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automação</h1>
          <p className="text-gray-600">Gerir regras de automação e workflows</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Regra de Automação</DialogTitle>
              <DialogDescription>
                Configure triggers e ações para automatizar processos
              </DialogDescription>
            </DialogHeader>
            <CreateRuleForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regras Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {rules.filter(r => r.isActive).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Play className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Regras</p>
                <p className="text-2xl font-bold text-blue-600">{rules.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Execuções Hoje</p>
                <p className="text-2xl font-bold text-purple-600">
                  {rules.reduce((sum, rule) => sum + rule.timesTriggered, 0)}
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
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-yellow-600">98.5%</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas as Regras ({rules.length})</TabsTrigger>
          <TabsTrigger value="active">Ativas ({rules.filter(r => r.isActive).length})</TabsTrigger>
          <TabsTrigger value="inactive">Inativas ({rules.filter(r => !r.isActive).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {rules.map(rule => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {rules.filter(r => r.isActive).map(rule => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {rules.filter(r => !r.isActive).map(rule => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </TabsContent>
      </Tabs>

      {rules.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma regra de automação
            </h3>
            <p className="text-gray-600 mb-4">
              Crie regras para automatizar processos repetitivos.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Regra
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}