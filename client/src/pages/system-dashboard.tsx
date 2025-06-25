import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/hooks/useAuth';
import { 
  Building2, 
  Users, 
  Ticket, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';

interface SystemDashboardData {
  globalStats: {
    totalClients: number;
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    criticalTickets: number;
    totalClientUsers: number;
    activeClientUsers: number;
    totalHourBanks: number;
    totalHours: number;
    usedHours: number;
  };
  clientOrganizations: Array<{
    id: number;
    name: string;
    ticketCount: number;
    userCount: number;
    hourBankCount: number;
  }>;
  recentTickets: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    organization: { id: number; name: string };
    assignee?: { id: string; firstName: string; lastName: string };
  }>;
  pendingRequests: Array<{
    id: number;
    requestedHours: number;
    totalAmount: number;
    reason: string;
    createdAt: string;
    organization: { id: number; name: string };
    requestedBy: { id: string; firstName: string; lastName: string };
  }>;
}

export default function SystemDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<SystemDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/client-management/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'open': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'waiting_customer': 'bg-purple-100 text-purple-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  const { globalStats, clientOrganizations, recentTickets, pendingRequests } = dashboardData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Sistema</h1>
          <p className="text-muted-foreground">
            Gestão centralizada de todas as empresas clientes
          </p>
        </div>
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Sistema GeckoStream
        </Badge>
      </div>

      {/* Global Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Empresas Clientes</p>
                <p className="text-2xl font-bold">{globalStats.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Ticket className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Tickets</p>
                <p className="text-2xl font-bold">{globalStats.totalTickets}</p>
                <p className="text-xs text-muted-foreground">
                  {globalStats.openTickets} abertos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Tickets Críticos</p>
                <p className="text-2xl font-bold">{globalStats.criticalTickets}</p>
                <p className="text-xs text-muted-foreground">
                  Prioridade alta
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Horas Totais</p>
                <p className="text-2xl font-bold">{globalStats.totalHours}</p>
                <p className="text-xs text-muted-foreground">
                  {globalStats.usedHours} utilizadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organizations">Empresas Clientes</TabsTrigger>
          <TabsTrigger value="tickets">Tickets Recentes</TabsTrigger>
          <TabsTrigger value="requests">Pedidos Pendentes</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Empresas Clientes</CardTitle>
              <CardDescription>
                Visão geral de todas as organizações cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Building2 className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium">{org.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {org.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{org.ticketCount}</p>
                        <p className="text-xs text-muted-foreground">Tickets</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{org.userCount}</p>
                        <p className="text-xs text-muted-foreground">Utilizadores</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{org.hourBankCount}</p>
                        <p className="text-xs text-muted-foreground">Bolsas</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/client-organizations/${org.id}`, '_blank')}
                      >
                        Gerir
                      </Button>
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
              <CardTitle>Tickets Recentes</CardTitle>
              <CardDescription>
                Últimos tickets criados pelas empresas clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{ticket.title}</h4>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ticket.organization.name} • #{ticket.id}
                      </p>
                    </div>
                    <div className="text-right">
                      {ticket.assignee ? (
                        <p className="text-sm font-medium">
                          {ticket.assignee.firstName} {ticket.assignee.lastName}
                        </p>
                      ) : (
                        <Badge variant="outline">Não atribuído</Badge>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos de Horas Pendentes</CardTitle>
              <CardDescription>
                Pedidos de bolsas de horas aguardando aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Não há pedidos pendentes
                    </p>
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">
                            {request.requestedHours}h - €{request.totalAmount}
                          </h4>
                          <Badge variant="outline">Pendente</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.organization.name} • {request.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Por: {request.requestedBy.firstName} {request.requestedBy.lastName}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Aprovar
                        </Button>
                        <Button variant="outline" size="sm">
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}