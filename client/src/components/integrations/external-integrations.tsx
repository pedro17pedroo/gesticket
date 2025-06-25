import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Link2, 
  Settings, 
  Check, 
  X, 
  Plus, 
  Zap,
  MessageSquare,
  Mail,
  Database,
  Globe,
  Shield,
  AlertCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'crm' | 'chat' | 'email' | 'monitoring' | 'storage' | 'auth';
  icon: React.ReactNode;
  isActive: boolean;
  status: 'connected' | 'error' | 'inactive';
  lastSync?: Date;
  config?: Record<string, any>;
  webhook?: {
    url: string;
    secret: string;
    events: string[];
  };
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  authentication: 'bearer' | 'apikey' | 'basic';
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

const availableIntegrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    description: 'Sincronizar clientes e oportunidades',
    category: 'crm',
    icon: <Database className="h-6 w-6" />,
    isActive: false,
    status: 'inactive'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Notificações de tickets em canais',
    category: 'chat',
    icon: <MessageSquare className="h-6 w-6" />,
    isActive: true,
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    webhook: {
      url: 'https://hooks.slack.com/services/...',
      secret: 'slack_webhook_secret',
      events: ['ticket_created', 'ticket_resolved']
    }
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Criar tickets a partir de emails',
    category: 'email',
    icon: <Mail className="h-6 w-6" />,
    isActive: true,
    status: 'connected',
    lastSync: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Colaboração e notificações em equipas',
    category: 'chat',
    icon: <MessageSquare className="h-6 w-6" />,
    isActive: false,
    status: 'inactive'
  },
  {
    id: 'azure-ad',
    name: 'Azure Active Directory',
    description: 'Autenticação e sincronização de utilizadores',
    category: 'auth',
    icon: <Shield className="h-6 w-6" />,
    isActive: false,
    status: 'inactive'
  },
  {
    id: 'jira',
    name: 'Atlassian Jira',
    description: 'Sincronização com issues do Jira',
    category: 'crm',
    icon: <Link2 className="h-6 w-6" />,
    isActive: false,
    status: 'inactive'
  }
];

const apiEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/api/tickets',
    description: 'Listar todos os tickets',
    authentication: 'bearer',
    parameters: [
      { name: 'status', type: 'string', required: false, description: 'Filtrar por status' },
      { name: 'priority', type: 'string', required: false, description: 'Filtrar por prioridade' },
      { name: 'limit', type: 'number', required: false, description: 'Número de resultados' }
    ]
  },
  {
    method: 'POST',
    path: '/api/tickets',
    description: 'Criar novo ticket',
    authentication: 'bearer',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Título do ticket' },
      { name: 'description', type: 'string', required: true, description: 'Descrição detalhada' },
      { name: 'priority', type: 'string', required: false, description: 'Prioridade (low, medium, high, critical)' }
    ]
  },
  {
    method: 'GET',
    path: '/api/customers',
    description: 'Listar clientes',
    authentication: 'bearer'
  },
  {
    method: 'POST',
    path: '/api/webhooks',
    description: 'Registar webhook',
    authentication: 'apikey',
    parameters: [
      { name: 'url', type: 'string', required: true, description: 'URL do webhook' },
      { name: 'events', type: 'array', required: true, description: 'Eventos a subscrever' }
    ]
  }
];

const statusColors = {
  connected: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800'
};

const categoryIcons = {
  crm: <Database className="h-4 w-4" />,
  chat: <MessageSquare className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  monitoring: <Globe className="h-4 w-4" />,
  storage: <Database className="h-4 w-4" />,
  auth: <Shield className="h-4 w-4" />
};

export default function ExternalIntegrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const queryClient = useQueryClient();

  const { data: integrations = availableIntegrations } = useQuery<Integration[]>({
    queryKey: ['/api/integrations'],
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ integrationId, isActive }: { integrationId: string; isActive: boolean }) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { integrationId, isActive };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
  });

  const configureIntegrationMutation = useMutation({
    mutationFn: async ({ integrationId, config }: { integrationId: string; config: Record<string, any> }) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { integrationId, config };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setIsConfigDialogOpen(false);
    },
  });

  const handleToggleIntegration = (integrationId: string, currentState: boolean) => {
    toggleIntegrationMutation.mutate({
      integrationId,
      isActive: !currentState
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const IntegrationCard = ({ integration }: { integration: Integration }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              {integration.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </div>
          </div>
          <Switch
            checked={integration.isActive}
            onCheckedChange={() => handleToggleIntegration(integration.id, integration.isActive)}
            disabled={toggleIntegrationMutation.isPending}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {categoryIcons[integration.category]}
            <span className="text-sm capitalize">{integration.category}</span>
          </div>
          <Badge className={statusColors[integration.status]}>
            {integration.status === 'connected' && <Check className="mr-1 h-3 w-3" />}
            {integration.status === 'error' && <X className="mr-1 h-3 w-3" />}
            {integration.status === 'inactive' && <AlertCircle className="mr-1 h-3 w-3" />}
            {integration.status}
          </Badge>
        </div>

        {integration.lastSync && (
          <div className="text-sm text-gray-600">
            Última sincronização: {integration.lastSync.toLocaleString('pt-PT')}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedIntegration(integration);
              setIsConfigDialogOpen(true);
            }}
          >
            <Settings className="mr-1 h-3 w-3" />
            Configurar
          </Button>
          
          {integration.webhook && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(integration.webhook!.url)}
            >
              <Copy className="mr-1 h-3 w-3" />
              Webhook
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const ConfigurationDialog = () => (
    <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Configurar {selectedIntegration?.name}
          </DialogTitle>
          <DialogDescription>
            Configure os parâmetros de integração
          </DialogDescription>
        </DialogHeader>

        {selectedIntegration && (
          <div className="space-y-6">
            {/* Basic Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuração Básica</h3>
              
              {selectedIntegration.category === 'crm' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-url">URL da API</Label>
                    <Input id="api-url" placeholder="https://api.example.com" />
                  </div>
                  <div>
                    <Label htmlFor="api-key">Chave da API</Label>
                    <div className="relative">
                      <Input 
                        id="api-key" 
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="Inserir chave da API" 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedIntegration.category === 'chat' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <Input 
                      id="webhook-url" 
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..." 
                    />
                  </div>
                  <div>
                    <Label>Eventos</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['ticket_created', 'ticket_updated', 'ticket_resolved', 'ticket_closed'].map(event => (
                        <div key={event} className="flex items-center space-x-2">
                          <input type="checkbox" id={event} />
                          <Label htmlFor={event} className="text-sm">{event}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedIntegration.category === 'email' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-server">Servidor IMAP</Label>
                    <Input id="email-server" placeholder="imap.outlook.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email-username">Utilizador</Label>
                      <Input id="email-username" placeholder="user@company.com" />
                    </div>
                    <div>
                      <Label htmlFor="email-password">Password</Label>
                      <Input id="email-password" type="password" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Webhook Configuration */}
            {selectedIntegration.webhook && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuração de Webhook</h3>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Use este URL para receber notificações automáticas do sistema.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <Label>URL do Webhook</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={selectedIntegration.webhook.url}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(selectedIntegration.webhook!.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Secret</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={selectedIntegration.webhook.secret}
                      type={showApiKey ? 'text' : 'password'}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  configureIntegrationMutation.mutate({
                    integrationId: selectedIntegration.id,
                    config: {} // Would collect form data
                  });
                }}
                disabled={configureIntegrationMutation.isPending}
              >
                {configureIntegrationMutation.isPending ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrações Externas</h1>
          <p className="text-gray-600">Conectar com sistemas externos e APIs</p>
        </div>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="api">API REST</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{integrations.length}</p>
                  </div>
                  <Link2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ativas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {integrations.filter(i => i.isActive).length}
                    </p>
                  </div>
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conectadas</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {integrations.filter(i => i.status === 'connected').length}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Com Erros</p>
                    <p className="text-2xl font-bold text-red-600">
                      {integrations.filter(i => i.status === 'error').length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map(integration => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API REST</CardTitle>
              <CardDescription>
                Documentação da API para integrações personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* API Key */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Autenticação</h3>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Use a chave da API no cabeçalho Authorization: Bearer YOUR_API_KEY
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-4">
                    <Label>Chave da API</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value="gck_live_1234567890abcdef"
                        type={showApiKey ? 'text' : 'password'}
                        readOnly
                        className="font-mono"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => copyToClipboard('gck_live_1234567890abcdef')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Endpoints */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Endpoints Disponíveis</h3>
                  <div className="space-y-4">
                    {apiEndpoints.map((endpoint, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="font-mono">
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {endpoint.path}
                            </code>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
                          
                          {endpoint.parameters && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Parâmetros</h4>
                              <div className="space-y-1">
                                {endpoint.parameters.map((param, i) => (
                                  <div key={i} className="text-xs">
                                    <code className="bg-gray-100 px-1 rounded">{param.name}</code>
                                    <span className="text-gray-500"> ({param.type})</span>
                                    {param.required && <span className="text-red-500"> *</span>}
                                    <span className="text-gray-600"> - {param.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
              <CardDescription>
                Receba notificações automáticas quando eventos ocorrem no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Webhooks */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Webhooks Ativos</h3>
                  <div className="space-y-3">
                    {integrations
                      .filter(i => i.webhook && i.isActive)
                      .map(integration => (
                        <Card key={integration.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{integration.name}</h4>
                                <p className="text-sm text-gray-600">{integration.webhook?.url}</p>
                                <div className="flex gap-1 mt-1">
                                  {integration.webhook?.events.map(event => (
                                    <Badge key={event} variant="outline" className="text-xs">
                                      {event}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Badge className={statusColors[integration.status]}>
                                {integration.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Available Events */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Eventos Disponíveis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'ticket_created',
                      'ticket_updated', 
                      'ticket_resolved',
                      'ticket_closed',
                      'customer_created',
                      'user_created',
                      'sla_breach'
                    ].map(event => (
                      <div key={event} className="p-3 border rounded-lg">
                        <code className="text-sm">{event}</code>
                        <p className="text-xs text-gray-600 mt-1">
                          Disparado quando {event.replace('_', ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfigurationDialog />
    </div>
  );
}