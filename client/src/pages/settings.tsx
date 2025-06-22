import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Mail, 
  Shield, 
  Globe, 
  Database, 
  Key,
  Webhook,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [newWebhookOpen, setNewWebhookOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      // Mock settings data (replace with real API)
      return {
        general: {
          companyName: "GeckoStream",
          supportEmail: "suporte@geckostream.com",
          timezone: "America/Sao_Paulo",
          language: "pt-BR",
          dateFormat: "DD/MM/YYYY",
          businessHours: {
            start: "08:00",
            end: "18:00",
            workdays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
          }
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          slackIntegration: true,
          ticketCreated: true,
          ticketAssigned: true,
          slaBreached: true,
          customerReplied: true
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 480, // minutes
          maxLoginAttempts: 5,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          }
        },
        integrations: {
          slack: {
            enabled: true,
            webhookUrl: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
          },
          email: {
            provider: "smtp",
            smtpHost: "smtp.gmail.com",
            smtpPort: 587,
            username: "noreply@geckostream.com"
          }
        }
      };
    },
  });

  // Fetch webhooks
  const { data: webhooks = [] } = useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      // Mock webhooks data
      return [
        {
          id: 1,
          name: "Slack Notifications",
          url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
          events: ["ticket.created", "ticket.assigned", "sla.breached"],
          active: true,
          lastTriggered: "2024-01-20T15:30:00Z"
        },
        {
          id: 2,
          name: "External CRM",
          url: "https://api.crm.example.com/webhooks/tickets",
          events: ["ticket.created", "ticket.resolved"],
          active: true,
          lastTriggered: "2024-01-20T14:45:00Z"
        },
        {
          id: 3,
          name: "Analytics Platform",
          url: "https://analytics.example.com/api/events",
          events: ["ticket.created", "ticket.resolved", "customer.satisfaction"],
          active: false,
          lastTriggered: null
        }
      ];
    },
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      // Mock save (replace with real API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      return settingsData;
    },
    onSuccess: () => {
      toast({ title: "Configurações salvas com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: async (webhookData: any) => {
      // Mock webhook creation
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id: Date.now(), ...webhookData };
    },
    onSuccess: () => {
      toast({ title: "Webhook criado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      setNewWebhookOpen(false);
    },
  });

  const handleSaveSettings = (e: React.FormEvent, section: string) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const settingsData = Object.fromEntries(formData.entries());
    
    saveSettingsMutation.mutate({
      section,
      data: settingsData
    });
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const webhookData = {
      name: formData.get("name"),
      url: formData.get("url"),
      events: formData.getAll("events"),
      active: formData.get("active") === "on"
    };
    createWebhookMutation.mutate(webhookData);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema, integrações e webhooks
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configure as informações básicas da empresa e preferências do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSaveSettings(e, "general")} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="companyName">Nome da Empresa</Label>
                      <Input 
                        id="companyName" 
                        name="companyName" 
                        defaultValue={settings?.general?.companyName}
                      />
                    </div>
                    <div>
                      <Label htmlFor="supportEmail">Email de Suporte</Label>
                      <Input 
                        id="supportEmail" 
                        name="supportEmail" 
                        type="email"
                        defaultValue={settings?.general?.supportEmail}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="timezone">Fuso Horário</Label>
                      <Select name="timezone" defaultValue={settings?.general?.timezone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Sao_Paulo">América/São Paulo</SelectItem>
                          <SelectItem value="America/New_York">América/Nova York</SelectItem>
                          <SelectItem value="Europe/London">Europa/Londres</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Idioma</Label>
                      <Select name="language" defaultValue={settings?.general?.language}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Horário de Funcionamento</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="startTime">Início</Label>
                        <Input 
                          id="startTime" 
                          name="startTime" 
                          type="time"
                          defaultValue={settings?.general?.businessHours?.start}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">Fim</Label>
                        <Input 
                          id="endTime" 
                          name="endTime" 
                          type="time"
                          defaultValue={settings?.general?.businessHours?.end}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={saveSettingsMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {saveSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificação</CardTitle>
                <CardDescription>
                  Configure quando e como receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSaveSettings(e, "notifications")} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificações por Email</Label>
                        <p className="text-sm text-muted-foreground">Receber notificações via email</p>
                      </div>
                      <Switch 
                        name="emailNotifications" 
                        defaultChecked={settings?.notifications?.emailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificações SMS</Label>
                        <p className="text-sm text-muted-foreground">Receber notificações via SMS</p>
                      </div>
                      <Switch 
                        name="smsNotifications" 
                        defaultChecked={settings?.notifications?.smsNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Integração Slack</Label>
                        <p className="text-sm text-muted-foreground">Enviar notificações para o Slack</p>
                      </div>
                      <Switch 
                        name="slackIntegration" 
                        defaultChecked={settings?.notifications?.slackIntegration}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Eventos de Notificação</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Ticket Criado</Label>
                        <Switch 
                          name="ticketCreated" 
                          defaultChecked={settings?.notifications?.ticketCreated}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Ticket Atribuído</Label>
                        <Switch 
                          name="ticketAssigned" 
                          defaultChecked={settings?.notifications?.ticketAssigned}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>SLA Violado</Label>
                        <Switch 
                          name="slaBreached" 
                          defaultChecked={settings?.notifications?.slaBreached}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Resposta do Cliente</Label>
                        <Switch 
                          name="customerReplied" 
                          defaultChecked={settings?.notifications?.customerReplied}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={saveSettingsMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {saveSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>
                  Configure políticas de segurança e autenticação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSaveSettings(e, "security")} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-muted-foreground">Adicionar camada extra de segurança</p>
                    </div>
                    <Switch 
                      name="twoFactorAuth" 
                      defaultChecked={settings?.security?.twoFactorAuth}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                      <Input 
                        id="sessionTimeout" 
                        name="sessionTimeout" 
                        type="number"
                        defaultValue={settings?.security?.sessionTimeout}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLoginAttempts">Máximo de Tentativas de Login</Label>
                      <Input 
                        id="maxLoginAttempts" 
                        name="maxLoginAttempts" 
                        type="number"
                        defaultValue={settings?.security?.maxLoginAttempts}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Política de Senha</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="minLength">Comprimento Mínimo</Label>
                        <Input 
                          id="minLength" 
                          name="minLength" 
                          type="number"
                          defaultValue={settings?.security?.passwordPolicy?.minLength}
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Requer Maiúsculas</Label>
                          <Switch 
                            name="requireUppercase" 
                            defaultChecked={settings?.security?.passwordPolicy?.requireUppercase}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Requer Números</Label>
                          <Switch 
                            name="requireNumbers" 
                            defaultChecked={settings?.security?.passwordPolicy?.requireNumbers}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Requer Caracteres Especiais</Label>
                          <Switch 
                            name="requireSpecialChars" 
                            defaultChecked={settings?.security?.passwordPolicy?.requireSpecialChars}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={saveSettingsMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {saveSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
                <CardDescription>
                  Configure integrações com serviços externos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Slack Integration */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Key className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Slack</h4>
                          <p className="text-sm text-muted-foreground">Enviar notificações para canais do Slack</p>
                        </div>
                      </div>
                      <Badge variant={settings?.integrations?.slack?.enabled ? "default" : "secondary"}>
                        {settings?.integrations?.slack?.enabled ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="slackWebhook">Webhook URL</Label>
                        <Input 
                          id="slackWebhook" 
                          defaultValue={settings?.integrations?.slack?.webhookUrl}
                          placeholder="https://hooks.slack.com/services/..."
                        />
                      </div>
                      <Button variant="outline">Testar Conexão</Button>
                    </div>
                  </div>

                  {/* Email Integration */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Email (SMTP)</h4>
                          <p className="text-sm text-muted-foreground">Configurar servidor de email</p>
                        </div>
                      </div>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Label htmlFor="smtpHost">Servidor SMTP</Label>
                        <Input 
                          id="smtpHost" 
                          defaultValue={settings?.integrations?.email?.smtpHost}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPort">Porta</Label>
                        <Input 
                          id="smtpPort" 
                          type="number"
                          defaultValue={settings?.integrations?.email?.smtpPort}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpUsername">Usuário</Label>
                        <Input 
                          id="smtpUsername" 
                          defaultValue={settings?.integrations?.email?.username}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtpPassword">Senha</Label>
                        <Input id="smtpPassword" type="password" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>APIs & Webhooks</CardTitle>
                    <CardDescription>
                      Gerencie webhooks para integração com sistemas externos
                    </CardDescription>
                  </div>
                  <Dialog open={newWebhookOpen} onOpenChange={setNewWebhookOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Webhook
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Criar Novo Webhook</DialogTitle>
                        <DialogDescription>
                          Configure um webhook para receber eventos do sistema
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateWebhook} className="space-y-4">
                        <div>
                          <Label htmlFor="webhookName">Nome</Label>
                          <Input id="webhookName" name="name" required />
                        </div>
                        <div>
                          <Label htmlFor="webhookUrl">URL</Label>
                          <Input 
                            id="webhookUrl" 
                            name="url" 
                            type="url" 
                            placeholder="https://api.exemplo.com/webhook"
                            required 
                          />
                        </div>
                        <div>
                          <Label>Eventos</Label>
                          <div className="space-y-2 mt-2">
                            {[
                              { id: "ticket.created", label: "Ticket Criado" },
                              { id: "ticket.assigned", label: "Ticket Atribuído" },
                              { id: "ticket.resolved", label: "Ticket Resolvido" },
                              { id: "sla.breached", label: "SLA Violado" },
                              { id: "customer.satisfaction", label: "Avaliação de Satisfação" }
                            ].map((event) => (
                              <div key={event.id} className="flex items-center space-x-2">
                                <input 
                                  type="checkbox" 
                                  id={event.id} 
                                  name="events" 
                                  value={event.id}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={event.id} className="text-sm">{event.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="webhookActive" name="active" defaultChecked />
                          <Label htmlFor="webhookActive">Ativo</Label>
                        </div>
                        <Button type="submit" disabled={createWebhookMutation.isPending}>
                          {createWebhookMutation.isPending ? "Criando..." : "Criar Webhook"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhooks.map((webhook: any) => (
                    <div key={webhook.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{webhook.name}</h4>
                          <p className="text-sm text-muted-foreground">{webhook.url}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={webhook.active ? "default" : "secondary"}>
                            {webhook.active ? "Ativo" : "Inativo"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {webhook.events.map((event: string) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Último acionamento: {
                            webhook.lastTriggered 
                              ? new Date(webhook.lastTriggered).toLocaleString()
                              : "Nunca"
                          }
                        </span>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Testar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}