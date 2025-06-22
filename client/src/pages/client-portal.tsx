import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, FileText, Plus, Star, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ClientPortal() {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch client's tickets
  const { data: tickets = [] } = useQuery({
    queryKey: ["client-tickets"],
    queryFn: async () => {
      const response = await fetch("/api/tickets?role=client");
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
  });

  // Fetch hour bank status
  const { data: hourBank } = useQuery({
    queryKey: ["hour-bank"],
    queryFn: async () => {
      const response = await fetch("/api/customers/1/hour-bank");
      if (!response.ok) throw new Error("Failed to fetch hour bank");
      return response.json();
    },
  });

  // Fetch knowledge articles
  const { data: articles = [] } = useQuery({
    queryKey: ["knowledge-articles-public"],
    queryFn: async () => {
      const response = await fetch("/api/knowledge-articles?published=true");
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  // Create new ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });
      if (!response.ok) throw new Error("Failed to create ticket");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-tickets"] });
      setNewTicketOpen(false);
      toast({ title: "Ticket criado com sucesso!" });
    },
  });

  // Submit satisfaction rating
  const submitRatingMutation = useMutation({
    mutationFn: async ({ ticketId, rating, feedback }: any) => {
      const response = await fetch("/api/satisfaction-ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, rating, feedback }),
      });
      if (!response.ok) throw new Error("Failed to submit rating");
      return response.json();
    },
    onSuccess: () => {
      setRatingOpen(false);
      toast({ title: "Avaliação enviada com sucesso!" });
    },
  });

  const handleCreateTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ticketData = {
      title: formData.get("title"),
      description: formData.get("description"),
      type: formData.get("type"),
      priority: formData.get("priority"),
      customerId: 1, // Assumindo cliente logado
    };
    createTicketMutation.mutate(ticketData);
  };

  const handleSubmitRating = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ratingData = {
      ticketId: selectedTicket?.id,
      rating: parseInt(formData.get("rating") as string),
      feedback: formData.get("feedback"),
    };
    submitRatingMutation.mutate(ratingData);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-blue-500",
      in_progress: "bg-yellow-500",
      waiting_customer: "bg-orange-500",
      resolved: "bg-green-500",
      closed: "bg-gray-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portal do Cliente</h1>
          <p className="text-muted-foreground">Gerencie seus tickets e acompanhe o suporte</p>
        </div>
        <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Ticket</DialogTitle>
              <DialogDescription>
                Descreva seu problema ou solicitação detalhadamente
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">Suporte</SelectItem>
                    <SelectItem value="incident">Incidente</SelectItem>
                    <SelectItem value="optimization">Otimização</SelectItem>
                    <SelectItem value="feature_request">Nova Funcionalidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select name="priority" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" rows={4} required />
              </div>
              <Button type="submit" disabled={createTicketMutation.isPending}>
                {createTicketMutation.isPending ? "Criando..." : "Criar Ticket"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter((t: any) => !["resolved", "closed"].includes(t.status)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter((t: any) => t.status === "resolved").length}
            </div>
          </CardContent>
        </Card>

        {hourBank && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Horas Restantes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hourBank.remaining}h</div>
                <p className="text-xs text-muted-foreground">
                  de {hourBank.limit}h total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uso da Bolsa</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hourBank.percentage}%</div>
                <Progress value={hourBank.percentage} className="mt-2" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Meus Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Base de Conhecimento</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="grid gap-4">
            {tickets.map((ticket: any) => (
              <Card key={ticket.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{ticket.title}</CardTitle>
                      <CardDescription>#{ticket.id} • Criado em {new Date(ticket.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {ticket.description?.substring(0, 150)}...
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Tipo: {ticket.type}
                    </div>
                    {ticket.status === "resolved" && (
                      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Avaliar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Avaliar Atendimento</DialogTitle>
                            <DialogDescription>
                              Como você avalia a resolução deste ticket?
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSubmitRating} className="space-y-4">
                            <div>
                              <Label htmlFor="rating">Avaliação (1-5)</Label>
                              <Select name="rating" required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a nota" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 - Muito Insatisfeito</SelectItem>
                                  <SelectItem value="2">2 - Insatisfeito</SelectItem>
                                  <SelectItem value="3">3 - Neutro</SelectItem>
                                  <SelectItem value="4">4 - Satisfeito</SelectItem>
                                  <SelectItem value="5">5 - Muito Satisfeito</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="feedback">Comentário (opcional)</Label>
                              <Textarea id="feedback" name="feedback" rows={3} />
                            </div>
                            <Button type="submit" disabled={submitRatingMutation.isPending}>
                              {submitRatingMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((article: any) => (
              <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>
                    {article.summary || "Sem resumo disponível"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Visualizações: {article.viewCount}</span>
                    <span>Atualizado: {new Date(article.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}