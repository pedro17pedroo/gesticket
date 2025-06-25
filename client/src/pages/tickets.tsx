import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/components/layout/main-layout";
import TicketCard from "@/components/tickets/ticket-card";
import TicketList from "@/components/tickets/ticket-list";
import EnhancedTicketForm from "@/components/tickets/enhanced-ticket-form";
import PageHeader from "@/components/common/page-header";
import TicketStatusBadge from "@/components/tickets/ticket-status-badge";
import TicketPriorityBadge from "@/components/tickets/ticket-priority-badge";
import { usePermissions } from "@/hooks/usePermissions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, SearchIcon, FilterIcon } from "lucide-react";
import { TicketWithRelations } from "@shared/schema";

export default function Tickets() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { hasPermission } = usePermissions();

  // Breadcrumbs and actions for PageHeader
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Tickets" }
  ];

  const actions = hasPermission('tickets', 'create') ? (
    <Button onClick={() => setLocation('/tickets/new')}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Novo Ticket
    </Button>
  ) : null;

  // Fetch tickets
  const { data: tickets = [], isLoading } = useQuery<TicketWithRelations[]>({
    queryKey: ['/api/tickets', { status: statusFilter !== 'all' ? statusFilter : undefined, priority: priorityFilter !== 'all' ? priorityFilter : undefined }],
  });

  // Filter tickets based on search
  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(search.toLowerCase()) ||
    ticket.description?.toLowerCase().includes(search.toLowerCase()) ||
    ticket.customer?.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group tickets by status for tabs
  const openTickets = filteredTickets.filter(t => t.status === 'open');
  const inProgressTickets = filteredTickets.filter(t => t.status === 'in_progress');
  const waitingTickets = filteredTickets.filter(t => t.status === 'waiting_customer');
  const resolvedTickets = filteredTickets.filter(t => t.status === 'resolved');

  return (
    <MainLayout 
      title="Tickets" 
      subtitle="Gerencie todos os tickets de suporte"
    >
      <div className="space-y-6">
        <PageHeader
          title="Tickets"
          subtitle="Gerencie todos os tickets de suporte"
          breadcrumbs={breadcrumbs}
          actions={actions}
        />
        
        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="waiting_customer">Aguardando Cliente</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Prioridades</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
              
              {hasPermission('tickets', 'create') && (
                <Button onClick={() => setLocation('/tickets/new')}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Novo Ticket
                </Button>
              )}
            </div>
        </div>

        {/* Abas de Tickets */}
        <Tabs defaultValue="all" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid grid-cols-5 w-full min-w-max">
              <TabsTrigger value="all" className="text-xs md:text-sm whitespace-nowrap">
                Todos ({filteredTickets.length})
              </TabsTrigger>
              <TabsTrigger value="open" className="text-xs md:text-sm whitespace-nowrap">
                Abertos ({openTickets.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs md:text-sm whitespace-nowrap">
                Em Andamento ({inProgressTickets.length})
              </TabsTrigger>
              <TabsTrigger value="waiting" className="text-xs md:text-sm whitespace-nowrap">
                Aguardando ({waitingTickets.length})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs md:text-sm whitespace-nowrap">
                Resolvidos ({resolvedTickets.length})
              </TabsTrigger>
            </TabsList>
          </div>
            
            <TabsContent value="all" className="mt-6">
              <TicketList 
                tickets={filteredTickets} 
                isLoading={isLoading} 
                view={viewMode}
                onViewChange={setViewMode}
              />
            </TabsContent>
            
            <TabsContent value="open" className="mt-6">
              <TicketList 
                tickets={openTickets} 
                isLoading={isLoading} 
                view={viewMode}
                onViewChange={setViewMode}
              />
            </TabsContent>
            
            <TabsContent value="in_progress" className="mt-6">
              <TicketList 
                tickets={inProgressTickets} 
                isLoading={isLoading} 
                view={viewMode}
                onViewChange={setViewMode}
              />
            </TabsContent>
            
            <TabsContent value="waiting" className="mt-6">
              <TicketList 
                tickets={waitingTickets} 
                isLoading={isLoading} 
                view={viewMode}
                onViewChange={setViewMode}
              />
            </TabsContent>
            
            <TabsContent value="resolved" className="mt-6">
              <TicketList 
                tickets={resolvedTickets} 
                isLoading={isLoading} 
                view={viewMode}
                onViewChange={setViewMode}
              />
            </TabsContent>
          </Tabs>
      </div>
      

    </MainLayout>
  );
}


