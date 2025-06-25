import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Calendar,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
  Grid3X3,
  List
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  type: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: number;
    name: string;
    email: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const priorityColors = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

const statusColors = {
  open: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  waiting_customer: 'bg-orange-100 text-orange-800 border-orange-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityLabels = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa'
};

const statusLabels = {
  open: 'Aberto',
  in_progress: 'Em Progresso',
  waiting_customer: 'Aguarda Cliente',
  resolved: 'Resolvido',
  closed: 'Fechado'
};

export default function TicketListView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets', { status: statusFilter, priority: priorityFilter }],
  });

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'my' && ticket.assignee?.id === 'current-user') ||
                      (activeTab === 'urgent' && ['critical', 'high'].includes(ticket.priority)) ||
                      (activeTab === 'recent' && new Date(ticket.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesTab;
  });

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/tickets/${ticket.id}`}>
              <CardTitle className="text-lg hover:text-blue-600 transition-colors">
                {ticket.title}
              </CardTitle>
            </Link>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {ticket.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem>Atribuir</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Fechar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={priorityColors[ticket.priority]}>
              {priorityLabels[ticket.priority]}
            </Badge>
            <Badge className={statusColors[ticket.status]}>
              {statusLabels[ticket.status]}
            </Badge>
          </div>
          <span className="text-xs text-gray-500">#{ticket.id}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {ticket.customer && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{ticket.customer.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(ticket.createdAt).toLocaleDateString('pt-PT')}</span>
            </div>
          </div>
          {ticket.assignee && (
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                {ticket.assignee.firstName?.[0]}{ticket.assignee.lastName?.[0]}
              </div>
              <span className="text-xs">{ticket.assignee.firstName} {ticket.assignee.lastName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const TicketRow = ({ ticket }: { ticket: Ticket }) => (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <Link href={`/tickets/${ticket.id}`}>
              <h3 className="font-medium hover:text-blue-600 transition-colors">
                {ticket.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 truncate">{ticket.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={priorityColors[ticket.priority]}>
              {priorityLabels[ticket.priority]}
            </Badge>
            <Badge className={statusColors[ticket.status]}>
              {statusLabels[ticket.status]}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            {ticket.customer?.name || 'Sem cliente'}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {new Date(ticket.createdAt).toLocaleDateString('pt-PT')}
            </span>
            {ticket.assignee && (
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                  {ticket.assignee.firstName?.[0]}{ticket.assignee.lastName?.[0]}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Atribuir</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Fechar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Gerir e acompanhar pedidos de suporte</p>
        </div>
        <Link href="/tickets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Ticket
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="open">Abertos</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                  <SelectItem value="closed">Fechados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos ({tickets.length})</TabsTrigger>
          <TabsTrigger value="my">Os Meus</TabsTrigger>
          <TabsTrigger value="urgent" className="text-red-600">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Urgentes
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="mr-1 h-3 w-3" />
            Recentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum ticket encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Não existem tickets que correspondam aos filtros selecionados.
                </p>
                <Link href="/tickets/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Ticket
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }>
              {filteredTickets.map((ticket) => 
                viewMode === 'grid' 
                  ? <TicketCard key={ticket.id} ticket={ticket} />
                  : <TicketRow key={ticket.id} ticket={ticket} />
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Stats Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {tickets.filter(t => t.status === 'open').length}
              </div>
              <div className="text-sm text-gray-600">Abertos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {tickets.filter(t => t.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">Em Progresso</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {tickets.filter(t => ['critical', 'high'].includes(t.priority)).length}
              </div>
              <div className="text-sm text-gray-600">Urgentes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {tickets.filter(t => t.status === 'resolved').length}
              </div>
              <div className="text-sm text-gray-600">Resolvidos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}