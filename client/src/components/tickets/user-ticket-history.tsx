import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  TicketIcon,
  TrendingUpIcon,
  CheckCircleIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserTicketHistoryProps {
  limit?: number;
  showStats?: boolean;
}

interface TicketStats {
  total: number;
  open: number;
  resolved: number;
  avgResolutionTime: number;
  lastTicketDate?: string;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical": return "bg-red-100 text-red-800";
    case "high": return "bg-orange-100 text-orange-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    case "low": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open": return "bg-blue-100 text-blue-800";
    case "in_progress": return "bg-purple-100 text-purple-800";
    case "waiting_customer": return "bg-yellow-100 text-yellow-800";
    case "resolved": return "bg-green-100 text-green-800";
    case "closed": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  const labels = {
    "open": "Aberto",
    "in_progress": "Em Andamento",
    "waiting_customer": "Aguardando",
    "resolved": "Resolvido",
    "closed": "Fechado"
  };
  return labels[status as keyof typeof labels] || status;
};

const getPriorityLabel = (priority: string) => {
  const labels = {
    "critical": "Crítica",
    "high": "Alta",
    "medium": "Média",
    "low": "Baixa"
  };
  return labels[priority as keyof typeof labels] || priority;
};

export default function UserTicketHistory({ limit = 5, showStats = true }: UserTicketHistoryProps) {
  const { user } = useAuth();

  // Fetch user's tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: [`/api/tickets/user/${user?.id}`, { limit }],
    enabled: !!user?.id,
  });

  // Fetch user ticket statistics
  const { data: stats } = useQuery<TicketStats>({
    queryKey: [`/api/tickets/user/${user?.id}/stats`],
    enabled: !!user?.id && showStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5" />
                Estatísticas dos Meus Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              Histórico de Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showStats && stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Estatísticas dos Meus Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
                <div className="text-sm text-yellow-600">Abertos</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-sm text-green-600">Resolvidos</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.avgResolutionTime ? `${Math.round(stats.avgResolutionTime)}h` : "-"}
                </div>
                <div className="text-sm text-purple-600">Tempo Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            Histórico de Tickets
            {limit && tickets.length > 0 && (
              <Badge variant="secondary">{tickets.length} de {stats?.total || "..."}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ticket encontrado</h3>
              <p className="text-gray-500">Você ainda não criou nenhum ticket.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket: any) => (
                <div key={ticket.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 line-clamp-2">
                        #{ticket.id} - {ticket.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                      {ticket.category && (
                        <span className="text-gray-500">
                          {ticket.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(new Date(ticket.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      {ticket.resolvedAt && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircleIcon className="h-3 w-3" />
                          Resolvido
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {ticket.assignee && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                      <UserIcon className="h-3 w-3" />
                      Atribuído para: {ticket.assignee.name || ticket.assignee.email}
                    </div>
                  )}
                </div>
              ))}
              
              {limit && stats && stats.total > limit && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    Ver todos os {stats.total} tickets
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}