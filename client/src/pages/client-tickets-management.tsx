import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { 
  Ticket, 
  Users, 
  Calendar, 
  Clock,
  AlertTriangle,
  Building2,
  Search
} from 'lucide-react';

interface ClientTicket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  organization: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  timeEntries: Array<{
    id: number;
    duration: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

interface SystemTechnician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function ClientTicketsManagement() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<ClientTicket[]>([]);
  const [technicians, setTechnicians] = useState<SystemTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    organizationId: '',
    search: ''
  });
  const [assigningTicket, setAssigningTicket] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 0,
    totalCount: 0
  });

  useEffect(() => {
    fetchTickets();
    fetchTechnicians();
  }, [filters, pagination.page]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/client-management/tickets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.data.tickets || []);
        setPagination(prev => ({
          ...prev,
          ...data.data.pagination
        }));
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/users?organizationType=system_owner&role=system_admin,system_agent');
      if (response.ok) {
        const data = await response.json();
        setTechnicians(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch technicians:', error);
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
        await fetchTickets(); // Refresh tickets
      }
    } catch (error) {
      console.error('Failed to assign ticket:', error);
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

  if (!user?.isSuperUser && user?.organization?.type !== 'system_owner') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Acesso negado - apenas utilizadores do sistema</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Tickets de Clientes</h1>
          <p className="text-muted-foreground">
            Atribuição e gestão de todos os tickets das empresas clientes
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-600 text-white">
          {pagination.totalCount} tickets
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="waiting_customer">Aguardando Cliente</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Prioridade</label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Pesquisa</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Título ou descrição..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={() => setFilters({ status: '', priority: '', organizationId: '', search: '' })}>
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Nenhum ticket encontrado</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{ticket.title}</h3>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4" />
                        <span>{ticket.organization.name}</span>
                      </div>
                      {ticket.department && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{ticket.department.name}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString('pt-PT')}</span>
                      </div>
                      {ticket.timeEntries.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {ticket.timeEntries.reduce((sum, entry) => sum + entry.duration, 0)} min
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      Criado por: {ticket.createdBy.firstName} {ticket.createdBy.lastName}
                    </div>
                  </div>
                  
                  <div className="ml-6 min-w-0 flex-shrink-0">
                    {ticket.assignee ? (
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {ticket.assignee.firstName} {ticket.assignee.lastName}
                          </span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Atribuído
                        </Badge>
                      </div>
                    ) : (
                      <div className="w-64">
                        <label className="text-sm font-medium mb-2 block">
                          Atribuir Técnico
                        </label>
                        <Select
                          onValueChange={(value) => assignTicket(ticket.id, value)}
                          disabled={assigningTicket === ticket.id}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar técnico">
                              {assigningTicket === ticket.id && "Atribuindo..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {technicians.map((tech) => (
                              <SelectItem key={tech.id} value={tech.id}>
                                <div className="flex flex-col">
                                  <span>{tech.firstName} {tech.lastName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {tech.role.replace('_', ' ')}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages} ({pagination.totalCount} tickets)
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}