import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SLATicket {
  id: number;
  title: string;
  priority: string;
  status: string;
  customer: string;
  responseDeadline: string;
  resolutionDeadline: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  slaStatus: 'on_track' | 'at_risk' | 'breached';
  timeRemaining: number; // in minutes
}

export default function SLAMonitor() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch SLA tickets
  const { data: slaTickets = [], isLoading, refetch } = useQuery<SLATicket[]>({
    queryKey: ["sla-tickets"],
    queryFn: async () => {
      // Mock SLA data (replace with real API call)
      return [
        {
          id: 1001,
          title: "Sistema de login não funciona",
          priority: "critical",
          status: "open",
          customer: "Empresa A",
          responseDeadline: new Date(Date.now() + 30 * 60000).toISOString(), // 30 min
          resolutionDeadline: new Date(Date.now() + 4 * 3600000).toISOString(), // 4 hours
          slaStatus: 'at_risk',
          timeRemaining: 28
        },
        {
          id: 1002,
          title: "Relatório não está sendo gerado",
          priority: "high",
          status: "in_progress",
          customer: "Empresa B",
          responseDeadline: new Date(Date.now() - 30 * 60000).toISOString(), // Already responded
          resolutionDeadline: new Date(Date.now() + 6 * 3600000).toISOString(), // 6 hours
          firstResponseAt: new Date(Date.now() - 45 * 60000).toISOString(),
          slaStatus: 'on_track',
          timeRemaining: 340
        },
        {
          id: 1003,
          title: "Solicitação de nova funcionalidade",
          priority: "medium",
          status: "open",
          customer: "Empresa C",
          responseDeadline: new Date(Date.now() - 60 * 60000).toISOString(), // Breached
          resolutionDeadline: new Date(Date.now() + 20 * 3600000).toISOString(),
          slaStatus: 'breached',
          timeRemaining: -60
        },
        {
          id: 1004,
          title: "Problema de performance",
          priority: "high",
          status: "resolved",
          customer: "Empresa D",
          responseDeadline: new Date(Date.now() - 8 * 3600000).toISOString(),
          resolutionDeadline: new Date(Date.now() - 2 * 3600000).toISOString(),
          firstResponseAt: new Date(Date.now() - 7.5 * 3600000).toISOString(),
          resolvedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
          slaStatus: 'on_track',
          timeRemaining: 0
        }
      ];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 0) {
      const absMinutes = Math.abs(minutes);
      const hours = Math.floor(absMinutes / 60);
      const mins = absMinutes % 60;
      return `Vencido há ${hours > 0 ? `${hours}h ` : ''}${mins}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m restantes`;
  };

  const getSLAStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'at_risk':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'breached':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSLAStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'breached':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSLAProgress = (ticket: SLATicket) => {
    const now = currentTime.getTime();
    const deadline = new Date(ticket.resolutionDeadline).getTime();
    const created = now - (24 * 3600000); // Assuming ticket was created 24h ago for demo
    
    const totalTime = deadline - created;
    const elapsed = now - created;
    const progress = Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
    
    return progress;
  };

  // Statistics
  const onTrackTickets = slaTickets.filter(t => t.slaStatus === 'on_track').length;
  const atRiskTickets = slaTickets.filter(t => t.slaStatus === 'at_risk').length;
  const breachedTickets = slaTickets.filter(t => t.slaStatus === 'breached').length;
  const totalActive = slaTickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Monitor SLA</h2>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* SLA Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dentro do Prazo</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onTrackTickets}</div>
            <p className="text-xs text-muted-foreground">
              {totalActive > 0 ? Math.round((onTrackTickets / totalActive) * 100) : 0}% dos tickets ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{atRiskTickets}</div>
            <p className="text-xs text-muted-foreground">
              Próximos do vencimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{breachedTickets}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalActive > 0 ? Math.round(((onTrackTickets + atRiskTickets) / totalActive) * 100) : 100}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa de conformidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SLA Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets com SLA Ativo</CardTitle>
          <CardDescription>
            Monitoramento em tempo real dos prazos de SLA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {slaTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 rounded-lg border-2 ${
                    ticket.slaStatus === 'breached'
                      ? 'border-red-200 bg-red-50'
                      : ticket.slaStatus === 'at_risk'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">#{ticket.id} - {ticket.title}</h4>
                        {getSLAStatusIcon(ticket.slaStatus)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>{ticket.customer}</span>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline">
                          {ticket.status}
                        </Badge>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Prazo de Resposta</div>
                          <div className="text-sm">
                            {new Date(ticket.responseDeadline).toLocaleString()}
                            {ticket.firstResponseAt && (
                              <span className="text-green-600 ml-2">✓ Respondido</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Prazo de Resolução</div>
                          <div className="text-sm">
                            {new Date(ticket.resolutionDeadline).toLocaleString()}
                            {ticket.resolvedAt && (
                              <span className="text-green-600 ml-2">✓ Resolvido</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right min-w-[200px]">
                      <Badge className={getSLAStatusColor(ticket.slaStatus)}>
                        {ticket.slaStatus === 'on_track' && 'No Prazo'}
                        {ticket.slaStatus === 'at_risk' && 'Em Risco'}
                        {ticket.slaStatus === 'breached' && 'Vencido'}
                      </Badge>
                      
                      <div className="mt-2 text-sm font-medium">
                        {formatTimeRemaining(ticket.timeRemaining)}
                      </div>
                      
                      {ticket.status !== 'resolved' && (
                        <div className="mt-2">
                          <Progress 
                            value={getSLAProgress(ticket)} 
                            className={`h-2 ${
                              ticket.slaStatus === 'breached' ? '[&>div]:bg-red-500' :
                              ticket.slaStatus === 'at_risk' ? '[&>div]:bg-yellow-500' :
                              '[&>div]:bg-green-500'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}