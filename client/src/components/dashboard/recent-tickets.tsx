import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PriorityBadge from "@/components/common/priority-badge";
import StatusBadge from "@/components/common/status-badge";
import { TicketWithRelations } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RecentTickets() {
  const { data: tickets = [], isLoading } = useQuery<TicketWithRelations[]>({
    queryKey: ['/api/tickets', { limit: 10 }],
  });

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Tickets Recentes
          </CardTitle>
          <Button variant="ghost" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Ver todos
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nenhum ticket encontrado
          </div>
        ) : (
          <div className="overflow-hidden">
            {tickets.map((ticket, index) => (
              <div 
                key={ticket.id} 
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  index < tickets.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-mono text-gray-500">
                        #TKT-{ticket.id.toString().padStart(4, '0')}
                      </span>
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                    
                    <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {ticket.title}
                    </h3>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      Cliente: {ticket.customer?.name || 'N/A'} • Criado {
                        formatDistanceToNow(new Date(ticket.createdAt), { 
                          addSuffix: true,
                          locale: ptBR 
                        })
                      }
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <span>
                        {ticket.assignee 
                          ? `Atribuído para: ${ticket.assignee.firstName} ${ticket.assignee.lastName}` 
                          : 'Não atribuído'
                        }
                      </span>
                      <span className="mx-2">•</span>
                      <span className="text-success-600">SLA: Dentro do prazo</span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    {ticket.assignee && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={ticket.assignee.profileImageUrl || ""} 
                          alt={`${ticket.assignee.firstName} ${ticket.assignee.lastName}`}
                        />
                        <AvatarFallback>
                          {ticket.assignee.firstName?.[0]}{ticket.assignee.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
