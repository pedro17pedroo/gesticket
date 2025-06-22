import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Clock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface TimerWidgetProps {
  ticketId?: number;
}

export default function TimerWidget({ ticketId }: TimerWidgetProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [description, setDescription] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<number | undefined>(ticketId);

  const queryClient = useQueryClient();

  // Fetch tickets for selection
  const { data: tickets = [] } = useQuery({
    queryKey: ["tickets-for-timer"],
    queryFn: async () => {
      const response = await fetch("/api/tickets?limit=100");
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
    enabled: !ticketId, // Only fetch if no ticketId provided
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Create time entry mutation
  const createTimeEntryMutation = useMutation({
    mutationFn: async (timeEntryData: any) => {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(timeEntryData),
      });
      if (!response.ok) throw new Error("Failed to create time entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      toast({ title: "Tempo registrado com sucesso!" });
      resetTimer();
    },
  });

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsRunning(true);
    setStartTime(new Date());
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    if (seconds > 0 && selectedTicketId) {
      const timeEntryData = {
        ticketId: selectedTicketId,
        description: description || "Trabalho no ticket",
        duration: seconds,
        startTime: startTime?.toISOString(),
        endTime: new Date().toISOString(),
        billable: true,
      };
      createTimeEntryMutation.mutate(timeEntryData);
    } else {
      resetTimer();
      if (!selectedTicketId) {
        toast({ 
          title: "Erro", 
          description: "Selecione um ticket para registrar o tempo",
          variant: "destructive" 
        });
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    setStartTime(null);
    setDescription("");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timer de Tempo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-primary">
            {formatTime(seconds)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {isRunning ? "Em execução" : "Parado"}
          </div>
        </div>

        {!ticketId && (
          <div>
            <Label htmlFor="ticket-select">Ticket</Label>
            <Select 
              value={selectedTicketId?.toString()} 
              onValueChange={(value) => setSelectedTicketId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ticket" />
              </SelectTrigger>
              <SelectContent>
                {tickets
                  .filter((ticket: any) => !["resolved", "closed"].includes(ticket.status))
                  .map((ticket: any) => (
                    <SelectItem key={ticket.id} value={ticket.id.toString()}>
                      #{ticket.id} - {ticket.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o trabalho realizado..."
            rows={2}
          />
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={startTimer}
              className="flex-1"
              disabled={!selectedTicketId}
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar
            </Button>
          ) : (
            <Button
              onClick={pauseTimer}
              variant="secondary"
              className="flex-1"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
          )}
          
          <Button
            onClick={stopTimer}
            variant="destructive"
            disabled={seconds === 0}
          >
            <Square className="w-4 h-4 mr-2" />
            Parar
          </Button>
        </div>

        {seconds > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            Tempo total: {Math.round(seconds / 60)} minutos
          </div>
        )}
      </CardContent>
    </Card>
  );
}