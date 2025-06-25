import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Users, 
  Ticket, 
  Clock, 
  AlertTriangle,
  UserCheck,
  Calendar,
  DollarSign
} from 'lucide-react';

interface ClientOrgDetail {
  organization: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    industry?: string;
    tier: string;
    departments: Array<{
      id: number;
      name: string;
      users: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        isActive: boolean;
      }>;
      tickets: Array<{
        id: number;
        title: string;
        status: string;
        priority: string;
        assignee?: { id: string; firstName: string; lastName: string };
      }>;
    }>;
    users: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      isActive: boolean;
      department?: { id: number; name: string };
    }>;
    tickets: Array<{
      id: number;
      title: string;
      status: string;
      priority: string;
      createdAt: string;
      assignee?: { id: string; firstName: string; lastName: string };
      timeEntries: Array<{
        id: number;
        duration: number;
        user: { id: string; firstName: string; lastName: string };
      }>;
    }>;
    hourBanks: Array<{
      id: number;
      totalHours: number;
      usedHours: number;
      remainingHours: number;
      hourlyRate?: number;
    }>;
  };
  stats: {
    tickets: {
      total: number;
      open: number;
      inProgress: number;
      resolved: number;
      critical: number;
      high: number;
    };
    users: {
      total: number;
      active: number;
      admins: number;
      managers: number;
      agents: number;
    };
    departments: {
      total: number;
      withUsers: number;
    };
    hours: {
      totalBanks: number;
      totalHours: number;
      usedHours: number;
      remainingHours: number;
      pendingRequests: number;
    };
  };
}

export default function ClientOrganizationDetail() {
  const [match, params] = useRoute('/client-organizations/:id');
  const [orgDetail, setOrgDetail] = useState<ClientOrgDetail | null>(null);
  const [systemTechnicians, setSystemTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningTicket, setAssigningTicket] = useState<number | null>(null);

  useEffect(() => {
    if (params?.id) {
      fetchOrganizationDetail(parseInt(params.id));
      fetchSystemTechnicians();
    }
  }, [params?.id]);

  const fetchOrganizationDetail = async (orgId: number) => {
    try {
      const response = await fetch(`/api/client-management/organizations/${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setOrgDetail(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch organization detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemTechnicians = async () => {
    try {
      const response = await fetch('/api/users?organizationType=system_owner');
      if (response.ok) {
        const data = await response.json();
        setSystemTechnicians(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch system technicians:', error);
    }
  };

  const assignTicket = async (ticketId: number, assigneeId: string) => {
    try {
      setAssigningTicket(ticketId);
      const response = await fetch(`/api/client-management/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId })
      });

      if (response.ok) {
        // Refresh data
        if (params?.id) {
          fetchOrganizationDetail(parseInt(params.id));
        }
      }
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    } finally {
      setAssigningTicket(null);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'company_admin': 'bg-green-100 text-green-800',
      'company_manager': 'bg-yellow-100 text-yellow-800',
      'company_agent': 'bg-cyan-100 text-cyan-800',
      'company_user': 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  if (!orgDetail) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Organização não encontrada</p>
      </div>
    );
  }

  const { organization, stats } = orgDetail;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{organization.name}</h1>
          <p className="text-muted-foreground">{organization.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Cliente
          </Badge>
          <Badge variant="outline">
            {organization.tier?.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Ticket className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Tickets</p>
                <p className="text-2xl font-bold">{stats.tickets.total}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.tickets.open} abertos
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
                <p className="text-sm font-medium">Críticos</p>
                <p className="text-2xl font-bold">{stats.tickets.critical}</p>
                <p className="text-xs text-muted-foreground">
                  Alta prioridade
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Utilizadores</p>
                <p className="text-2xl font-bold">{stats.users.total}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.users.active} ativos
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
                <p className="text-sm font-medium">Horas</p>
                <p className="text-2xl font-bold">{stats.hours.remainingHours}</p>
                <p className="text-xs text-muted-foreground">
                  de {stats.hours.totalHours} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="users">Utilizadores</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="hours">Bolsas de Horas</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Tickets</CardTitle>
              <CardDescription>
                Atribuir técnicos do sistema aos tickets dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organization.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{ticket.title}</h4>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ticket #{ticket.id} • {new Date(ticket.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                      {ticket.timeEntries.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {ticket.timeEntries.reduce((sum, entry) => sum + entry.duration, 0)} min registados
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {ticket.assignee ? (
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {ticket.assignee.firstName} {ticket.assignee.lastName}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            Atribuído
                          </Badge>
                        </div>
                      ) : (
                        <Select
                          onValueChange={(value) => assignTicket(ticket.id, value)}
                          disabled={assigningTicket === ticket.id}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Atribuir técnico" />
                          </SelectTrigger>
                          <SelectContent>
                            {systemTechnicians.map((tech) => (
                              <SelectItem key={tech.id} value={tech.id}>
                                {tech.firstName} {tech.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilizadores da Organização</CardTitle>
              <CardDescription>
                Gestão de utilizadores e departamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organization.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        {user.department && (
                          <p className="text-xs text-muted-foreground">
                            {user.department.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.replace('company_', '').replace('_', ' ')}
                      </Badge>
                      {user.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      ) : (
                        <Badge variant="outline">Inativo</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Departamentos</CardTitle>
              <CardDescription>
                Estrutura departamental da organização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organization.departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{dept.name}</h4>
                      <div className="flex space-x-2">
                        <Badge variant="outline">
                          {dept.users.length} utilizadores
                        </Badge>
                        <Badge variant="outline">
                          {dept.tickets.length} tickets
                        </Badge>
                      </div>
                    </div>
                    {dept.users.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {dept.users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-2 bg-muted rounded"
                          >
                            <span className="text-sm">
                              {user.firstName} {user.lastName}
                            </span>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role.replace('company_', '')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bolsas de Horas</CardTitle>
              <CardDescription>
                Gestão de horas contratadas e utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organization.hourBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          Bolsa #{bank.id}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {bank.hourlyRate && `€${bank.hourlyRate}/hora`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {bank.remainingHours}h restantes
                        </p>
                        <p className="text-sm text-muted-foreground">
                          de {bank.totalHours}h total
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {bank.usedHours}h utilizadas
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${((bank.totalHours - bank.remainingHours) / bank.totalHours) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                {organization.hourBanks.length === 0 && (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma bolsa de horas configurada
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}