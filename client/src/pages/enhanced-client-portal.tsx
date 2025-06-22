import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Clock, 
  DollarSign,
  Users,
  User,
  Edit,
  Settings,
  ShoppingCart,
  FileText,
  AlertCircle,
  CheckCircle,
  UserPlus,
  BarChart3
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface Company {
  id: number;
  name: string;
  tier: string;
  hourBankStatus: {
    limit: number;
    used: number;
    remaining: number;
    percentage: number;
  };
}

interface HourBankRequest {
  id: number;
  requestedHours: number;
  hourlyRate: number;
  totalAmount: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface CompanyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  managerId?: string;
}

export default function EnhancedClientPortal() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch company information
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["/api/client/company"],
    enabled: !!user?.companyId,
  });

  // Fetch company users
  const { data: companyUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/client/users"],
    enabled: !!user?.companyId,
  });

  // Fetch hour bank requests
  const { data: hourBankRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/client/hour-bank-requests"],
    enabled: !!user?.companyId,
  });

  // Fetch tickets for the company
  const { data: companyTickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/client/tickets"],
    enabled: !!user?.companyId,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest("/api/client/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      toast({ title: "Usuário criado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/client/users"] });
      setNewUserOpen(false);
    },
  });

  // Create hour bank request mutation
  const createHourRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      return await apiRequest("/api/client/hour-bank-requests", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
    },
    onSuccess: () => {
      toast({ title: "Solicitação de horas enviada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/client/hour-bank-requests"] });
      setNewRequestOpen(false);
    },
  });

  // Update ticket responsible mutation
  const updateTicketResponsibleMutation = useMutation({
    mutationFn: async ({ ticketId, responsibleId }: { ticketId: number; responsibleId: string }) => {
      return await apiRequest(`/api/tickets/${ticketId}/responsible`, {
        method: "PUT",
        body: JSON.stringify({ clientResponsibleId: responsibleId }),
      });
    },
    onSuccess: () => {
      toast({ title: "Responsável do ticket atualizado!" });
      queryClient.invalidateQueries({ queryKey: ["/api/client/tickets"] });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const userData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      role: formData.get("role"),
      managerId: formData.get("managerId") || null,
    };

    createUserMutation.mutate(userData);
  };

  const handleCreateHourRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const requestedHours = parseInt(formData.get("requestedHours") as string);
    const hourlyRate = parseFloat(formData.get("hourlyRate") as string);
    
    const requestData = {
      requestedHours,
      hourlyRate,
      totalAmount: requestedHours * hourlyRate,
      reason: formData.get("reason"),
    };

    createHourRequestMutation.mutate(requestData);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      client_manager: "bg-green-100 text-green-800",
      client_user: "bg-blue-100 text-blue-800"
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
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

  if (companyLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
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
          <h1 className="text-3xl font-bold">Portal do Cliente - {company?.name}</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe, acompanhe tickets e bolsa de horas
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <FileText className="w-4 h-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Clock className="w-4 h-4 mr-2" />
              Bolsa de Horas
            </TabsTrigger>
            <TabsTrigger value="requests">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Solicitações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companyUsers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {companyUsers.filter((u: CompanyUser) => u.role === 'client_manager').length} gestores
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tickets Ativos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {companyTickets.filter((t: any) => !['resolved', 'closed'].includes(t.status)).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    De {companyTickets.length} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Horas Restantes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{company?.hourBankStatus?.remaining || 0}h</div>
                  <p className="text-xs text-muted-foreground">
                    De {company?.hourBankStatus?.limit || 0}h contratadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uso da Bolsa</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{company?.hourBankStatus?.percentage || 0}%</div>
                  <Progress value={company?.hourBankStatus?.percentage || 0} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Status da Bolsa de Horas</CardTitle>
                <CardDescription>Acompanhe o uso das horas contratadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Horas Usadas</span>
                    <span className="font-semibold">{company?.hourBankStatus?.used || 0}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Horas Restantes</span>
                    <span className="font-semibold">{company?.hourBankStatus?.remaining || 0}h</span>
                  </div>
                  <Progress value={company?.hourBankStatus?.percentage || 0} className="h-2" />
                  {(company?.hourBankStatus?.percentage || 0) > 80 && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Atenção: Bolsa de horas com uso alto</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestão de Usuários</CardTitle>
                    <CardDescription>
                      Gerencie os usuários da sua empresa
                    </CardDescription>
                  </div>
                  <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Novo Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Criar Novo Usuário</DialogTitle>
                        <DialogDescription>
                          Adicione um novo usuário à sua empresa
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="firstName">Nome *</Label>
                            <Input id="firstName" name="firstName" required />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Sobrenome *</Label>
                            <Input id="lastName" name="lastName" required />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input id="email" name="email" type="email" required />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="role">Função</Label>
                            <Select name="role" defaultValue="client_user">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="client_manager">Gestor</SelectItem>
                                <SelectItem value="client_user">Usuário</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="managerId">Gestor Superior</Label>
                            <Select name="managerId">
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um gestor" />
                              </SelectTrigger>
                              <SelectContent>
                                {companyUsers
                                  .filter((user: CompanyUser) => user.role === 'client_manager')
                                  .map((manager: CompanyUser) => (
                                    <SelectItem key={manager.id} value={manager.id}>
                                      {manager.firstName} {manager.lastName}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button type="submit" disabled={createUserMutation.isPending}>
                          {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyUsers.map((user: CompanyUser) => (
                    <div key={user.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role === 'client_manager' ? 'Gestor' : 'Usuário'}
                          </Badge>
                          {user.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tickets da Empresa</CardTitle>
                <CardDescription>
                  Acompanhe e gerencie os tickets da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyTickets.map((ticket: any) => (
                    <div key={ticket.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{ticket.title}</h4>
                          <p className="text-sm text-muted-foreground">#{ticket.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline">
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Responsável: {ticket.clientResponsible?.firstName || "Não atribuído"}
                        </div>
                        <Select
                          value={ticket.clientResponsibleId || ""}
                          onValueChange={(value) => 
                            updateTicketResponsibleMutation.mutate({ 
                              ticketId: ticket.id, 
                              responsibleId: value 
                            })
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Alterar responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            {companyUsers.map((user: CompanyUser) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Bolsa de Horas</CardTitle>
                <CardDescription>
                  Informações completas sobre sua bolsa de horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Status Atual</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Contratado:</span>
                        <span className="font-semibold">{company?.hourBankStatus?.limit || 0}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Horas Utilizadas:</span>
                        <span className="font-semibold">{company?.hourBankStatus?.used || 0}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Horas Restantes:</span>
                        <span className="font-semibold text-green-600">{company?.hourBankStatus?.remaining || 0}h</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Uso por Período</h4>
                    <Progress value={company?.hourBankStatus?.percentage || 0} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {company?.hourBankStatus?.percentage?.toFixed(1) || 0}% da bolsa utilizada
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Solicitações de Horas</CardTitle>
                    <CardDescription>
                      Solicite mais horas para sua bolsa
                    </CardDescription>
                  </div>
                  <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Solicitação
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Solicitar Mais Horas</DialogTitle>
                        <DialogDescription>
                          Solicite horas adicionais para sua bolsa
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateHourRequest} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="requestedHours">Horas Solicitadas *</Label>
                            <Input 
                              id="requestedHours" 
                              name="requestedHours" 
                              type="number" 
                              min="1"
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="hourlyRate">Valor por Hora (€) *</Label>
                            <Input 
                              id="hourlyRate" 
                              name="hourlyRate" 
                              type="number" 
                              step="0.01"
                              min="0"
                              required 
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="reason">Justificativa *</Label>
                          <Textarea 
                            id="reason" 
                            name="reason" 
                            placeholder="Explique o motivo da solicitação de horas adicionais"
                            required 
                          />
                        </div>

                        <Button type="submit" disabled={createHourRequestMutation.isPending}>
                          {createHourRequestMutation.isPending ? "Enviando..." : "Enviar Solicitação"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hourBankRequests.map((request: HourBankRequest) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{request.requestedHours} horas solicitadas</h4>
                          <p className="text-sm text-muted-foreground">
                            Total: €{request.totalAmount?.toFixed(2)} (€{request.hourlyRate}/hora)
                          </p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status === 'pending' ? 'Pendente' : 
                           request.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p className="mb-2"><strong>Justificativa:</strong> {request.reason}</p>
                        <p>Solicitado em: {new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}

                  {hourBankRequests.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma solicitação de horas encontrada
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}