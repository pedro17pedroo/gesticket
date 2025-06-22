import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { ActiveTimer } from "@/types";
import { Play, Pause, Square, Clock, Calendar, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";

interface TimeEntry {
  id: number;
  ticketId: number;
  duration: number;
  description: string;
  date: string;
  ticket?: {
    id: number;
    title: string;
    priority: string;
    customer?: { name: string };
  };
}

interface HourBankStatus {
  customerId: number;
  customerName: string;
  limit: number;
  used: number;
  remaining: number;
  percentage: number;
}

export default function TimeTracking() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("timer");
  const [selectedTicket, setSelectedTicket] = useState("");
  const [timerDescription, setTimerDescription] = useState("");
  
  // Active timer state
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTimer && activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer(prev => prev ? {
          ...prev,
          duration: Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
        } : null);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [activeTimer?.isRunning]);

  const { data: timeEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['/api/time-entries'],
    queryFn: () => [
      {
        id: 1,
        ticketId: 101,
        duration: 3600,
        description: "Investigação do problema de conectividade",
        date: "2025-06-22",
        ticket: {
          id: 101,
          title: "Problema de conexão intermitente",
          priority: "high",
          customer: { name: "TechCorp Ltd" }
        }
      },
      {
        id: 2,
        ticketId: 102,
        duration: 2700,
        description: "Configuração de firewall",
        date: "2025-06-22",
        ticket: {
          id: 102,
          title: "Configuração de segurança",
          priority: "medium",
          customer: { name: "StartupXYZ" }
        }
      }
    ]
  });

  const { data: hourBanks = [], isLoading: banksLoading } = useQuery({
    queryKey: ['/api/hour-banks'],
    queryFn: () => [
      {
        customerId: 1,
        customerName: "TechCorp Ltd",
        limit: 100,
        used: 87,
        remaining: 13,
        percentage: 87
      },
      {
        customerId: 2,
        customerName: "StartupXYZ",
        limit: 50,
        used: 32,
        remaining: 18,
        percentage: 64
      },
      {
        customerId: 3,
        customerName: "Enterprise Solutions",
        limit: 200,
        remaining: 156,
        used: 44,
        percentage: 22
      }
    ]
  });

  const { data: availableTickets = [] } = useQuery({
    queryKey: ['/api/tickets', { status: 'open,in_progress' }],
    queryFn: () => [
      { id: 101, title: "Problema de conexão intermitente", customer: "TechCorp Ltd" },
      { id: 102, title: "Configuração de segurança", customer: "StartupXYZ" },
      { id: 103, title: "Migração de dados", customer: "Enterprise Solutions" }
    ]
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (entry: Omit<TimeEntry, 'id'>) => {
      // This would be connected to the real API endpoint
      return { ...entry, id: Date.now() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hour-banks'] });
      toast({
        title: "Tempo registrado",
        description: "Entrada de tempo criada com sucesso",
      });
    }
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!selectedTicket) {
      toast({
        title: "Selecione um ticket",
        description: "É necessário selecionar um ticket para iniciar o timer",
        variant: "destructive"
      });
      return;
    }

    setActiveTimer({
      ticketId: parseInt(selectedTicket),
      startTime: new Date(),
      duration: 0,
      isRunning: true
    });

    toast({
      title: "Timer iniciado",
      description: "Controle de tempo ativado para o ticket selecionado",
    });
  };

  const pauseTimer = () => {
    if (activeTimer) {
      setActiveTimer(prev => prev ? { ...prev, isRunning: false } : null);
      toast({
        title: "Timer pausado",
        description: "Controle de tempo pausado",
      });
    }
  };

  const resumeTimer = () => {
    if (activeTimer) {
      setActiveTimer(prev => prev ? {
        ...prev,
        startTime: new Date(Date.now() - prev.duration * 1000),
        isRunning: true
      } : null);
      toast({
        title: "Timer retomado",
        description: "Controle de tempo reativado",
      });
    }
  };

  const stopTimer = () => {
    if (activeTimer && activeTimer.duration > 0) {
      createTimeEntryMutation.mutate({
        ticketId: activeTimer.ticketId,
        duration: activeTimer.duration,
        description: timerDescription || "Trabalho no ticket",
        date: format(new Date(), 'yyyy-MM-dd')
      });

      setActiveTimer(null);
      setTimerDescription("");
      setSelectedTicket("");

      toast({
        title: "Timer finalizado",
        description: "Tempo registrado com sucesso",
      });
    }
  };

  const getTotalTimeToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return timeEntries
      .filter(entry => entry.date === today)
      .reduce((total, entry) => total + entry.duration, 0);
  };

  const getHourBankStatus = (percentage: number) => {
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header 
          title="Controle de Tempo" 
          subtitle="Monitore e gerencie o tempo gasto em tickets"
        />
        
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timer">Timer</TabsTrigger>
              <TabsTrigger value="entries">Registros</TabsTrigger>
              <TabsTrigger value="hour-banks">Banco de Horas</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="timer" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Timer Ativo</span>
                    </CardTitle>
                    <CardDescription>
                      Controle seu tempo de trabalho em tickets
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-mono font-bold text-primary">
                        {activeTimer ? formatDuration(activeTimer.duration) : "00:00:00"}
                      </div>
                      {activeTimer && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Ticket #{activeTimer.ticketId}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Ticket</label>
                        <Select value={selectedTicket} onValueChange={setSelectedTicket} disabled={!!activeTimer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um ticket" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTickets.map((ticket) => (
                              <SelectItem key={ticket.id} value={ticket.id.toString()}>
                                #{ticket.id} - {ticket.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Descrição (opcional)</label>
                        <Input
                          value={timerDescription}
                          onChange={(e) => setTimerDescription(e.target.value)}
                          placeholder="Descreva o trabalho realizado..."
                          disabled={!activeTimer}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {!activeTimer ? (
                        <Button onClick={startTimer} className="flex-1">
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar
                        </Button>
                      ) : (
                        <>
                          {activeTimer.isRunning ? (
                            <Button onClick={pauseTimer} variant="outline" className="flex-1">
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </Button>
                          ) : (
                            <Button onClick={resumeTimer} variant="outline" className="flex-1">
                              <Play className="h-4 w-4 mr-2" />
                              Retomar
                            </Button>
                          )}
                          <Button onClick={stopTimer} variant="destructive">
                            <Square className="h-4 w-4 mr-2" />
                            Finalizar
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Resumo do Dia</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Tempo Total Hoje</span>
                          <span className="text-lg font-semibold">
                            {formatDuration(getTotalTimeToday())}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Meta Diária (8h)</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round((getTotalTimeToday() / 28800) * 100)}%
                          </span>
                        </div>
                        <Progress value={(getTotalTimeToday() / 28800) * 100} />
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Últimos Registros</h4>
                        {timeEntries.slice(0, 3).map((entry) => (
                          <div key={entry.id} className="flex justify-between items-center py-2 border-b">
                            <div>
                              <p className="text-sm font-medium">#{entry.ticketId}</p>
                              <p className="text-xs text-muted-foreground">{entry.description}</p>
                            </div>
                            <span className="text-sm font-mono">
                              {formatDuration(entry.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="entries" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Registros de Tempo</CardTitle>
                  <CardDescription>
                    Histórico de tempo gasto em tickets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium">#{entry.ticketId} - {entry.ticket?.title}</p>
                              <p className="text-sm text-muted-foreground">{entry.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.ticket?.customer?.name} • {entry.date}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold">
                            {formatDuration(entry.duration)}
                          </p>
                          <Badge variant={entry.ticket?.priority === 'high' ? 'destructive' : 'secondary'}>
                            {entry.ticket?.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hour-banks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Banco de Horas por Cliente</span>
                  </CardTitle>
                  <CardDescription>
                    Monitoramento do consumo de horas contratadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {hourBanks.map((bank) => (
                      <Card key={bank.customerId}>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold">{bank.customerName}</h4>
                              <Badge 
                                variant={
                                  getHourBankStatus(bank.percentage) === 'critical' ? 'destructive' :
                                  getHourBankStatus(bank.percentage) === 'warning' ? 'default' : 'secondary'
                                }
                              >
                                {bank.percentage.toFixed(1)}% usado
                              </Badge>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>{bank.used}h usadas</span>
                                <span>{bank.remaining}h restantes</span>
                              </div>
                              <Progress 
                                value={bank.percentage} 
                                className={`h-2 ${
                                  getHourBankStatus(bank.percentage) === 'critical' ? 'bg-red-100' :
                                  getHourBankStatus(bank.percentage) === 'warning' ? 'bg-yellow-100' : ''
                                }`}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Limite: {bank.limit}h
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Relatórios de Tempo</span>
                  </CardTitle>
                  <CardDescription>
                    Análises e estatísticas de produtividade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatDuration(getTotalTimeToday())}
                      </div>
                      <p className="text-sm text-muted-foreground">Hoje</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatDuration(getTotalTimeToday() * 5)}
                      </div>
                      <p className="text-sm text-muted-foreground">Esta Semana</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatDuration(getTotalTimeToday() * 22)}
                      </div>
                      <p className="text-sm text-muted-foreground">Este Mês</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
