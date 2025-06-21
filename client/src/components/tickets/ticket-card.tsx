import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PriorityBadge from "@/components/common/priority-badge";
import StatusBadge from "@/components/common/status-badge";
import { TicketWithRelations } from "@shared/schema";
import { ClockIcon, UserIcon } from "lucide-react";

interface TicketCardProps {
  ticket: TicketWithRelations;
  onClick?: () => void;
}

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  const getSlaStatus = () => {
    // Mock SLA logic - in real app this would be calculated based on SLA deadlines
    const hoursCreated = (new Date().getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
    
    if (hoursCreated > 24) {
      return { text: "SLA vencido", color: "text-danger-600" };
    } else if (hoursCreated > 20) {
      return { text: "SLA: 4h restantes", color: "text-danger-600" };
    } else if (hoursCreated > 16) {
      return { text: "SLA: 8h restantes", color: "text-warning-600" };
    }
    return { text: "SLA: Dentro do prazo", color: "text-success-600" };
  };

  const slaStatus = getSlaStatus();

  return (
    <Card 
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-mono text-gray-500">
                #TKT-{ticket.id.toString().padStart(4, '0')}
              </span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
            
            <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
              {ticket.title}
            </h3>
            
            {ticket.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {ticket.description}
              </p>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0">
            {ticket.assignee ? (
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={ticket.assignee.profileImageUrl || ""} 
                  alt={`${ticket.assignee.firstName} ${ticket.assignee.lastName}`}
                />
                <AvatarFallback className="text-xs">
                  {ticket.assignee.firstName?.[0]}{ticket.assignee.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Cliente: {ticket.customer?.name || 'N/A'}</span>
            <span className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(ticket.createdAt), { 
                addSuffix: true,
                locale: ptBR 
              })}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {ticket.assignee 
                ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` 
                : 'Não atribuído'
              }
            </span>
            <span className={slaStatus.color}>
              {slaStatus.text}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
