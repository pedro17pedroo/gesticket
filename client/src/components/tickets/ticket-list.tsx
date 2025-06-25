import { useState } from "react";
import { TicketWithRelations } from "@shared/schema";
import TicketCard from "./ticket-card";
import TicketStatusBadge from "./ticket-status-badge";
import TicketPriorityBadge from "./ticket-priority-badge";
import EmptyState from "@/components/ui/empty-state";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, Trash2, LayoutGrid, List, Ticket } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

interface TicketListProps {
  tickets: TicketWithRelations[];
  isLoading?: boolean;
  view?: "grid" | "table";
  onViewChange?: (view: "grid" | "table") => void;
}

export default function TicketList({ 
  tickets, 
  isLoading = false, 
  view = "grid",
  onViewChange 
}: TicketListProps) {
  const [, setLocation] = useLocation();
  const { hasPermission } = usePermissions();

  const columns: ColumnDef<TicketWithRelations>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm">#{row.getValue("id")}</span>
      ),
    },
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <div className="max-w-xs truncate font-medium">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <TicketStatusBadge status={row.getValue("status")} />
      ),
    },
    {
      accessorKey: "priority",
      header: "Prioridade",
      cell: ({ row }) => (
        <TicketPriorityBadge priority={row.getValue("priority")} />
      ),
    },
    {
      accessorKey: "customer",
      header: "Cliente",
      cell: ({ row }) => {
        const customer = row.original.customer;
        return customer ? customer.name : "N/A";
      },
    },
    {
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString("pt-BR");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ticket = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocation(`/tickets/${ticket.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              {hasPermission('tickets', 'update') && (
                <DropdownMenuItem onClick={() => setLocation(`/tickets/${ticket.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {hasPermission('tickets', 'delete') && (
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<Ticket className="h-12 w-12" />}
        title="Nenhum ticket encontrado"
        description="Não há tickets correspondentes aos filtros aplicados."
        action={
          hasPermission('tickets', 'create') ? {
            label: "Criar Ticket",
            onClick: () => setLocation("/tickets/new")
          } : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      {onViewChange && (
        <div className="flex justify-end">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("grid")}
              className="h-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("table")}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={tickets}
          searchKey="title"
          searchPlaceholder="Buscar tickets..."
        />
      )}
    </div>
  );
}