import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ZapIcon, 
  ClockIcon, 
  UserIcon,
  BellIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  SettingsIcon
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'time_based' | 'status_change' | 'priority_change' | 'keyword_detected';
    condition: string;
  };
  actions: Array<{
    type: 'assign_user' | 'change_priority' | 'send_notification' | 'add_tag' | 'escalate';
    value: string;
  }>;
  isActive: boolean;
  lastTriggered?: string;
  triggeredCount: number;
}

export default function WorkflowAutomation() {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'auto-assign-hardware',
      name: 'Auto-atribuição Hardware',
      description: 'Atribui tickets de hardware automaticamente para o especialista',
      trigger: {
        type: 'keyword_detected',
        condition: 'categoria = hardware'
      },
      actions: [
        { type: 'assign_user', value: 'specialist-hardware' },
        { type: 'add_tag', value: 'auto-assigned' }
      ],
      isActive: true,
      triggeredCount: 23,
      lastTriggered: '2024-01-15T10:30:00Z'
    },
    {
      id: 'sla-warning',
      name: 'Alerta de SLA',
      description: 'Notifica quando ticket está próximo do vencimento do SLA',
      trigger: {
        type: 'time_based',
        condition: '80% do tempo de SLA decorrido'
      },
      actions: [
        { type: 'send_notification', value: 'assignee' },
        { type: 'add_tag', value: 'sla-warning' }
      ],
      isActive: true,
      triggeredCount: 45,
      lastTriggered: '2024-01-15T14:15:00Z'
    },
    {
      id: 'priority-escalation',
      name: 'Escalação por Prioridade',
      description: 'Escalação automática para tickets críticos sem resposta em 1 hora',
      trigger: {
        type: 'time_based',
        condition: 'prioridade = crítica AND sem resposta por 1 hora'
      },
      actions: [
        { type: 'escalate', value: 'manager' },
        { type: 'change_priority', value: 'critical' },
        { type: 'send_notification', value: 'manager' }
      ],
      isActive: true,
      triggeredCount: 8,
      lastTriggered: '2024-01-14T16:45:00Z'
    },
    {
      id: 'keyword-urgent',
      name: 'Detecção de Urgência',
      description: 'Aumenta prioridade quando detecta palavras de urgência',
      trigger: {
        type: 'keyword_detected',
        condition: 'contém: "urgente", "crítico", "parado", "!!!"'
      },
      actions: [
        { type: 'change_priority', value: 'high' },
        { type: 'send_notification', value: 'team-lead' },
        { type: 'add_tag', value: 'urgent-keyword' }
      ],
      isActive: true,
      triggeredCount: 67,
      lastTriggered: '2024-01-15T15:20:00Z'
    },
    {
      id: 'customer-satisfaction',
      name: 'Follow-up de Satisfação',
      description: 'Envia pesquisa de satisfação 24h após resolução',
      trigger: {
        type: 'status_change',
        condition: 'status mudou para "resolvido"'
      },
      actions: [
        { type: 'send_notification', value: 'customer-survey' },
        { type: 'add_tag', value: 'survey-sent' }
      ],
      isActive: false,
      triggeredCount: 156,
      lastTriggered: '2024-01-13T09:10:00Z'
    }
  ]);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'time_based':
        return <ClockIcon className="h-4 w-4" />;
      case 'status_change':
      case 'priority_change':
        return <ArrowRightIcon className="h-4 w-4" />;
      case 'keyword_detected':
        return <ZapIcon className="h-4 w-4" />;
      default:
        return <SettingsIcon className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'assign_user':
        return <UserIcon className="h-3 w-3" />;
      case 'send_notification':
        return <BellIcon className="h-3 w-3" />;
      case 'escalate':
        return <ArrowRightIcon className="h-3 w-3" />;
      default:
        return <SettingsIcon className="h-3 w-3" />;
    }
  };

  const getActionLabel = (type: string, value: string) => {
    switch (type) {
      case 'assign_user':
        return `Atribuir para ${value}`;
      case 'change_priority':
        return `Alterar prioridade para ${value}`;
      case 'send_notification':
        return `Notificar ${value}`;
      case 'add_tag':
        return `Adicionar tag "${value}"`;
      case 'escalate':
        return `Escalar para ${value}`;
      default:
        return `${type}: ${value}`;
    }
  };

  const activeRules = rules.filter(rule => rule.isActive).length;
  const totalTriggers = rules.reduce((sum, rule) => sum + rule.triggeredCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ZapIcon className="h-6 w-6" />
            Automação de Workflows
          </h2>
          <p className="text-gray-600 mt-1">
            Configure regras para automatizar processos de tickets
          </p>
        </div>
        <Button>
          <SettingsIcon className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Regras Ativas</p>
                <p className="text-2xl font-bold text-green-600">{activeRules}</p>
              </div>
              <PlayIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Regras</p>
                <p className="text-2xl font-bold text-blue-600">{rules.length}</p>
              </div>
              <SettingsIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Execuções Totais</p>
                <p className="text-2xl font-bold text-purple-600">{totalTriggers}</p>
              </div>
              <ZapIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{rule.name}</h3>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rule.triggeredCount} execuções
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {rule.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  {rule.isActive ? (
                    <PlayIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <PauseIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Trigger */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {getTriggerIcon(rule.trigger.type)}
                  <span className="font-medium text-sm">Gatilho:</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm">
                  {rule.trigger.condition}
                </div>
              </div>

              {/* Actions */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRightIcon className="h-4 w-4" />
                  <span className="font-medium text-sm">Ações:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rule.actions.map((action, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded px-3 py-1 text-sm flex items-center gap-1">
                      {getActionIcon(action.type)}
                      {getActionLabel(action.type, action.value)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Last triggered */}
              {rule.lastTriggered && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  Última execução: {new Date(rule.lastTriggered).toLocaleString('pt-BR')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-medium text-green-800 mb-1">
                Automação Efetiva
              </h4>
              <p className="text-sm text-green-700">
                Suas regras de automação processaram {totalTriggers} tickets este mês, 
                economizando aproximadamente 12 horas de trabalho manual.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-800 mb-1">
                Regra Mais Utilizada
              </h4>
              <p className="text-sm text-blue-700">
                "Detecção de Urgência" foi executada 67 vezes, sendo a automação mais acionada.
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
              <h4 className="font-medium text-orange-800 mb-1">
                Oportunidade de Melhoria
              </h4>
              <p className="text-sm text-orange-700">
                Considere ativar "Follow-up de Satisfação" para melhorar o feedback dos clientes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}