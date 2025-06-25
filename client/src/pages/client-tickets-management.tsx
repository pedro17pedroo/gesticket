import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { 
  Search, 
  Filter,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Building2,
  Users
} from 'lucide-react';

interface ClientTicket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  createdAt: string;
  organization: { id: number; name: string };
  department?: { id: number; name: string };
  assignee?: { id: string; firstName: string; lastName: string };
  createdBy: { id: string; firstName: string; lastName: string };
  timeEntries: Array<{
    id: number;
    duration: number;
    user: { id: string; firstName: string; lastName: string };
  }>;
}

interface SystemTechnician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: { id: number; name: string };
}

export default function ClientTicketsManagement() {
  const { user } = useAuth();
  const { getUserAccessibleOrganizations } = useTenant();
  const [tickets, setTickets] = useState<ClientTicket[]>([]);
  const [systemTechnicians, setSystemTechnicians] = useState<SystemTechnician[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningTicket, setAssigningTicket] = useState<number | null>(null);
  
  // Filters
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [selectedOrg, statusFilter, priorityFilter]);

  const fetchInitialData = async () => {
    try {
      // Fetch accessible organizations
      const orgsResponse = await fetch('/api/client-management/organizations');
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json();
        setOrganizations(orgsData.data || []);
      }

      // Fetch system technicians
      const techResponse = await fetch('/api/users?organizationType=system_owner');
      if (techResponse.ok) {
        const techData = await techResponse.json();
        setSystemTechnicians(techData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedOrg) params.append('organizationId', selectedOrg);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      
      const response = await fetch(`/api/client-management/tickets?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.data?.tickets || []);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignTechnician = async (ticketId: number, assigneeId: string) => {
    try {
      setAssigningTicket(ticketId);
      const response = await fetch(`/api/client-management/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId })
      });

      if (response.ok) {
        fetchTickets(); // Refresh tickets
      }
    } catch (error) {
      console.error('Failed to assign technician:', error);
    } finally {
      setAssigningTicket(null);
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

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.organization.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ticketStats = {
    total: filteredTickets.length,
    open: filteredTickets.filter(t => t.status === 'open').length,
    inProgress: filteredTickets.filter(t => t.status === 'in_progress').length,
    unassigned: filteredTickets.filter(t => !t.assignee).length,
    critical: filteredTickets.filter(t => t.priority === 'critical').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Tickets de Clientes</h1>
          <p className="text-muted-foreground">
            Atribuição e gestão de tickets das empresas clientes
          </p>
        </div>
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Sistema GeckoStream
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{ticketStats.total}</p>
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
                <p className="text-2xl font-bold">{ticketStats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Abertos</p>
                <p className="text-2xl font-bold">{ticketStats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Em Progresso</p>
                <p className="text-2xl font-bold">{ticketStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Não Atribuídos</p>
                <p className="text-2xl font-bold">{ticketStats.unassigned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as organizações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as organizações</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="waiting_customer">Aguardando Cliente</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as prioridades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets dos Clientes</CardTitle>
          <CardDescription>
            Lista de todos os tickets das empresas clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
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
                    <p className="text-sm text-muted-foreground mb-1">
                      {ticket.organization.name} • #{ticket.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Criado por: {ticket.createdBy.firstName} {ticket.createdBy.lastName} • {new Date(ticket.createdAt).toLocaleDateString('pt-PT')}
                    </p>
                    {ticket.timeEntries.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tempo registado: {ticket.timeEntries.reduce((sum, entry) => sum + entry.duration, 0)} minutos
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
                          Técnico Atribuído
                        </Badge>
                      </div>
                    ) : (
                      <Select
                        onValueChange={(value) => assignTechnician(ticket.id, value)}
                        disabled={assigningTicket === ticket.id}
                      >
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Atribuir técnico" />
                        </SelectTrigger>
                        <SelectContent>
                          {systemTechnicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              <div className="flex flex-col">
                                <span>{tech.firstName} {tech.lastName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {tech.department?.name} • {tech.role}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/tickets/${ticket.id}`, '_blank')}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredTickets.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum ticket encontrado com os filtros aplicados
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}