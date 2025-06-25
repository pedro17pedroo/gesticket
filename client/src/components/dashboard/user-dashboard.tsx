import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import UserTicketHistory from "@/components/tickets/user-ticket-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserIcon, 
  BuildingIcon, 
  MailIcon, 
  PhoneIcon,
  PlusIcon,
  AlertTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from "lucide-react";
import { useLocation } from "wouter";

interface UserDashboardProps {
  className?: string;
}

export default function UserDashboard({ className }: UserDashboardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch user's active tickets summary
  const { data: activeSummary } = useQuery({
    queryKey: [`/api/tickets/user/${user?.id}/stats`],
    enabled: !!user?.id,
  });

  // Fetch recent tickets
  const { data: recentTickets = [] } = useQuery({
    queryKey: [`/api/tickets/user/${user?.id}`, { limit: 3 }],
    enabled: !!user?.id,
  });

  if (!user) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Bem-vindo, {user.name || user.email}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Informações do Perfil</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4 text-gray-400" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="h-4 w-4 text-gray-400" />
                    <span>{user.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Ações Rápidas</h3>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => setLocation('/tickets/new')}
                  className="w-full justify-start"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Criar Novo Ticket
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/tickets')}
                  className="w-full justify-start"
                >
                  Ver Todos os Meus Tickets
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {activeSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tickets Abertos</p>
                  <p className="text-2xl font-bold text-orange-600">{activeSummary.open}</p>
                </div>
                <AlertTriangleIcon className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Tickets</p>
                  <p className="text-2xl font-bold text-blue-600">{activeSummary.total}</p>
                </div>
                <ClockIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolvidos</p>
                  <p className="text-2xl font-bold text-green-600">{activeSummary.resolved}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Tickets Preview */}
      {recentTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Meus Tickets Recentes</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/tickets')}
              >
                Ver Todos
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.slice(0, 3).map((ticket: any) => (
                <div key={ticket.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">#{ticket.id} - {ticket.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <Badge 
                        variant="secondary" 
                        className={
                          ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {ticket.status === 'open' ? 'Aberto' :
                         ticket.status === 'in_progress' ? 'Em Andamento' :
                         ticket.status === 'resolved' ? 'Resolvido' : ticket.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Ticket History */}
      <UserTicketHistory limit={5} showStats={false} />
    </div>
  );
}