import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Settings, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Target,
  Calendar,
  Users
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SLARule {
  id: number;
  name: string;
  priority: string;
  customerTier: string;
  responseTime: number;
  resolutionTime: number;
  active: boolean;
  businessHoursOnly: boolean;
  escalationRules: {
    enabled: boolean;
    levels: Array<{
      level: number;
      timeMinutes: number;
      assignTo: string;
    }>;
  };
}

export default function SLAConfig() {
  const [newRuleOpen, setNewRuleOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SLARule | null>(null);
  const [selectedTab, setSelectedTab] = useState("rules");
  const queryClient = useQueryClient();

  // Fetch SLA rules
  const { data: slaRules = [], isLoading } = useQuery({
    queryKey: ["sla-rules"],
    queryFn: async () => {
      // Mock SLA rules data
      return [
        {
          id: 1,
          name: "Clientes Premium - Crítico",
          priority: "critical",
          customerTier: "premium",
          responseTime: 15, // minutes
          resolutionTime: 60, // minutes
          active: true,
          businessHoursOnly: false,
          escalationRules: {
            enabled: true,
            levels: [
              { level: 1, timeMinutes: 30, assignTo: "manager" },
              { level: 2, timeMinutes: 60, assignTo: "director" }
            ]
          }
        },
        {
          id: 2,
          name: "Clientes Premium - Alto",
          priority: "high",
          customerTier: "premium",
          responseTime: 30,
          resolutionTime: 120,
          active: true,
          businessHoursOnly: false,
          escalationRules: {
            enabled: true,
            levels: [
              { level: 1, timeMinutes: 60, assignTo: "manager" }
            ]
          }
        },
        {
          id: 3,
          name: "Clientes Standard - Crítico",
          priority: "critical",
          customerTier: "standard",
          responseTime: 60,
          resolutionTime: 240,
          active: true,
          businessHoursOnly: true,
          escalationRules: {
            enabled: false,
            levels: []
          }
        },
        {
          id: 4,
          name: "Clientes Standard - Alto",
          priority: "high",
          customerTier: "standard",
          responseTime: 120,
          resolutionTime: 480,
          active: true,
          businessHoursOnly: true,
          escalationRules: {
            enabled: false,
            levels: []
          }
        },
        {
          id: 5,
          name: "Clientes Basic - Médio",
          priority: "medium",
          customerTier: "basic",
          responseTime: 240,
          resolutionTime: 1440,
          active: true,
          businessHoursOnly: true,
          escalationRules: {
            enabled: false,
            levels: []
          }
        }
      ];
    },
  });

  // Fetch global SLA settings
  const { data: globalSettings } = useQuery({
    queryKey: ["sla-global-settings"],
    queryFn: async () => {
      return {
        businessHours: {
          start: "09:00",
          end: "18:00",
          timezone: "America/Sao_Paulo",
          workdays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
        },
        notifications: {
          warningThreshold: 80, // % of time remaining
          escalationEnabled: true,
          slackNotifications: true,
          emailNotifications: true
        },
        metrics: {
          targetCompliance: 95,
          reportingPeriod: "monthly"
        }
      };
    },
  });

  // Create/Update SLA rule mutation
  const saveRuleMutation = useMutation({
    mutationFn: async (ruleData: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return ruleData;
    },
    onSuccess: () => {
      toast({ title: "Regra SLA salva com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["sla-rules"] });
      setNewRuleOpen(false);
      setEditingRule(null);
    },
  });

  // Delete SLA rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: number) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return ruleId;
    },
    onSuccess: () => {
      toast({ title: "Regra SLA excluída com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["sla-rules"] });
    },
  });

  // Save global settings mutation
  const saveGlobalSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return settingsData;
    },
    onSuccess: () => {
      toast({ title: "Configurações globais salvas com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["sla-global-settings"] });
    },
  });

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const ruleData = {
      id: editingRule?.id || Date.now(),
      name: formData.get("name"),
      priority: formData.get("priority"),
      customerTier: formData.get("customerTier"),
      responseTime: parseInt(formData.get("responseTime") as string),
      resolutionTime: parseInt(formData.get("resolutionTime") as string),
      active: formData.get("active") === "on",
      businessHoursOnly: formData.get("businessHoursOnly") === "on",
      escalationRules: {
        enabled: formData.get("escalationEnabled") === "on",
        levels: [] // Simplified for demo
      }
    };

    saveRuleMutation.mutate(ruleData);
  };

  const handleSaveGlobalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const settingsData = {
      businessHours: {
        start: formData.get("startTime"),
        end: formData.get("endTime"),
        timezone: formData.get("timezone"),
        workdays: formData.getAll("workdays")
      },
      notifications: {
        warningThreshold: parseInt(formData.get("warningThreshold") as string),
        escalationEnabled: formData.get("escalationEnabled") === "on",
        slackNotifications: formData.get("slackNotifications") === "on",
        emailNotifications: formData.get("emailNotifications") === "on"
      },
      metrics: {
        targetCompliance: parseInt(formData.get("targetCompliance") as string),
        reportingPeriod: formData.get("reportingPeriod")
      }
    };

    saveGlobalSettingsMutation.mutate(settingsData);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTierColor = (tier: string) => {
    const colors = {
      premium: "bg-purple-100 text-purple-800",
      standard: "bg-blue-100 text-blue-800",
      basic: "bg-gray-100 text-gray-800"
    };
    return colors[tier as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Configurações de SLA</h1>
            <p className="text-muted-foreground">
              Gerencie regras de SLA, tempos de resposta e escalações
            </p>
          </div>
          
          <Dialog open={newRuleOpen} onOpenChange={setNewRuleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Regra SLA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? "Editar Regra SLA" : "Criar Nova Regra SLA"}
                </DialogTitle>
                <DialogDescription>
                  Configure os tempos de resposta e resolução para diferentes tipos de tickets
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveRule} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Regra</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={editingRule?.name}
                    placeholder="Ex: Clientes Premium - Crítico"
                    required 
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select name="priority" defaultValue={editingRule?.priority} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Crítica</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="customerTier">Nível do Cliente</Label>
                    <Select name="customerTier" defaultValue={editingRule?.customerTier} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="basic">Básico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="responseTime">Tempo de Resposta (minutos)</Label>
                    <Input 
                      id="responseTime" 
                      name="responseTime" 
                      type="number"
                      defaultValue={editingRule?.responseTime}
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="resolutionTime">Tempo de Resolução (minutos)</Label>
                    <Input 
                      id="resolutionTime" 
                      name="resolutionTime" 
                      type="number"
                      defaultValue={editingRule?.resolutionTime}
                      required 
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Apenas Horário Comercial</Label>
                      <p className="text-sm text-muted-foreground">
                        SLA aplicado apenas durante horário comercial
                      </p>
                    </div>
                    <Switch 
                      name="businessHoursOnly" 
                      defaultChecked={editingRule?.businessHoursOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Escalação Automática</Label>
                      <p className="text-sm text-muted-foreground">
                        Escalar automaticamente se não for resolvido
                      </p>
                    </div>
                    <Switch 
                      name="escalationEnabled" 
                      defaultChecked={editingRule?.escalationRules?.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Regra Ativa</Label>
                      <p className="text-sm text-muted-foreground">
                        Esta regra está ativa no sistema
                      </p>
                    </div>
                    <Switch 
                      name="active" 
                      defaultChecked={editingRule?.active ?? true}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={saveRuleMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {saveRuleMutation.isPending ? "Salvando..." : "Salvar Regra"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">
              <Target className="w-4 h-4 mr-2" />
              Regras SLA
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Configurações Globais
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Calendar className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regras de SLA Ativas</CardTitle>
                <CardDescription>
                  Configure diferentes SLAs baseados na prioridade e nível do cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {slaRules.map((rule) => (
                      <div key={rule.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge className={getPriorityColor(rule.priority)}>
                              {rule.priority}
                            </Badge>
                            <Badge className={getTierColor(rule.customerTier)}>
                              {rule.customerTier}
                            </Badge>
                            {rule.active ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingRule(rule);
                                setNewRuleOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteRuleMutation.mutate(rule.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Resposta</p>
                              <p className="text-sm text-muted-foreground">
                                {formatTime(rule.responseTime)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Resolução</p>
                              <p className="text-sm text-muted-foreground">
                                {formatTime(rule.resolutionTime)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Escalação</p>
                              <p className="text-sm text-muted-foreground">
                                {rule.escalationRules.enabled ? 
                                  `${rule.escalationRules.levels.length} níveis` : 
                                  "Desabilitada"
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {rule.businessHoursOnly ? "Horário comercial" : "24/7"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Globais de SLA</CardTitle>
                <CardDescription>
                  Configure as configurações que se aplicam a todas as regras de SLA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGlobalSettings} className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Horário Comercial</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label htmlFor="startTime">Início</Label>
                        <Input 
                          id="startTime" 
                          name="startTime" 
                          type="time"
                          defaultValue={globalSettings?.businessHours?.start}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">Fim</Label>
                        <Input 
                          id="endTime" 
                          name="endTime" 
                          type="time"
                          defaultValue={globalSettings?.businessHours?.end}
                        />
                      </div>
                      <div>
                        <Label htmlFor="timezone">Fuso Horário</Label>
                        <Select name="timezone" defaultValue={globalSettings?.businessHours?.timezone}>
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
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Notificações</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="warningThreshold">Limite de Aviso (%)</Label>
                        <Input 
                          id="warningThreshold" 
                          name="warningThreshold" 
                          type="number"
                          min="1"
                          max="100"
                          defaultValue={globalSettings?.notifications?.warningThreshold}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Notificar quando restarem X% do tempo de SLA
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Escalação Automática</Label>
                          <Switch 
                            name="escalationEnabled" 
                            defaultChecked={globalSettings?.notifications?.escalationEnabled}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Notificações Slack</Label>
                          <Switch 
                            name="slackNotifications" 
                            defaultChecked={globalSettings?.notifications?.slackNotifications}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Notificações Email</Label>
                          <Switch 
                            name="emailNotifications" 
                            defaultChecked={globalSettings?.notifications?.emailNotifications}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Métricas e Relatórios</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="targetCompliance">Meta de Conformidade (%)</Label>
                        <Input 
                          id="targetCompliance" 
                          name="targetCompliance" 
                          type="number"
                          min="1"
                          max="100"
                          defaultValue={globalSettings?.metrics?.targetCompliance}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="reportingPeriod">Período de Relatório</Label>
                        <Select name="reportingPeriod" defaultValue={globalSettings?.metrics?.reportingPeriod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="quarterly">Trimestral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={saveGlobalSettingsMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {saveGlobalSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates de SLA</CardTitle>
                <CardDescription>
                  Templates pré-configurados para diferentes tipos de negócio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      name: "SaaS Enterprise",
                      description: "Para produtos SaaS com clientes empresariais",
                      rules: [
                        "Crítico: 15min resposta / 1h resolução",
                        "Alto: 30min resposta / 4h resolução",
                        "Médio: 2h resposta / 8h resolução"
                      ]
                    },
                    {
                      name: "E-commerce",
                      description: "Para lojas online e marketplace",
                      rules: [
                        "Crítico: 30min resposta / 2h resolução",
                        "Alto: 1h resposta / 6h resolução",
                        "Médio: 4h resposta / 24h resolução"
                      ]
                    },
                    {
                      name: "Suporte Técnico",
                      description: "Para empresas de tecnologia e software",
                      rules: [
                        "Crítico: 1h resposta / 4h resolução",
                        "Alto: 2h resposta / 8h resolução",
                        "Médio: 8h resposta / 48h resolução"
                      ]
                    },
                    {
                      name: "Financeiro",
                      description: "Para instituições financeiras",
                      rules: [
                        "Crítico: 10min resposta / 30min resolução",
                        "Alto: 20min resposta / 2h resolução",
                        "Médio: 1h resposta / 4h resolução"
                      ]
                    }
                  ].map((template, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {template.rules.map((rule, ruleIndex) => (
                            <div key={ruleIndex} className="text-sm">
                              • {rule}
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full">
                          <Users className="w-4 h-4 mr-2" />
                          Aplicar Template
                        </Button>
                      </CardContent>
                    </Card>
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