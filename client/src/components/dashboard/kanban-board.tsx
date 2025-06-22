import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface KanbanBoardProps {
  tickets: any[];
}

const statusColumns = {
  open: { title: "Aberto", color: "bg-blue-50 border-blue-200" },
  in_progress: { title: "Em Andamento", color: "bg-yellow-50 border-yellow-200" },
  waiting_customer: { title: "Aguardando Cliente", color: "bg-orange-50 border-orange-200" },
  resolved: { title: "Resolvido", color: "bg-green-50 border-green-200" },
  closed: { title: "Fechado", color: "bg-gray-50 border-gray-200" },
};

export default function KanbanBoard({ tickets }: KanbanBoardProps) {
  const [boardTickets, setBoardTickets] = useState(() => {
    const grouped: Record<string, any[]> = {};
    Object.keys(statusColumns).forEach(status => {
      grouped[status] = tickets.filter(ticket => ticket.status === status);
    });
    return grouped;
  });

  const queryClient = useQueryClient();

  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: number; status: string }) => {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update ticket");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast({ title: "Status do ticket atualizado!" });
    },
  });

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    if (sourceStatus === destStatus) {
      // Reordering within the same column
      const column = Array.from(boardTickets[sourceStatus]);
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);

      setBoardTickets({
        ...boardTickets,
        [sourceStatus]: column,
      });
    } else {
      // Moving to different column
      const sourceColumn = Array.from(boardTickets[sourceStatus]);
      const destColumn = Array.from(boardTickets[destStatus]);
      const [removed] = sourceColumn.splice(source.index, 1);
      destColumn.splice(destination.index, 0, removed);

      setBoardTickets({
        ...boardTickets,
        [sourceStatus]: sourceColumn,
        [destStatus]: destColumn,
      });

      // Update ticket status in database
      updateTicketMutation.mutate({
        ticketId: parseInt(draggableId),
        status: destStatus,
      });
    }
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

  const isOverdue = (ticket: any) => {
    if (!ticket.resolutionDeadline) return false;
    return new Date(ticket.resolutionDeadline) < new Date();
  };

  const getTimeUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff < 0) return "Vencido";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {Object.entries(statusColumns).map(([status, config]) => (
          <div key={status} className="flex-shrink-0 w-80">
            <div className={`rounded-lg border-2 ${config.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{config.title}</h3>
                <Badge variant="secondary">
                  {boardTickets[status]?.length || 0}
                </Badge>
              </div>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] ${
                      snapshot.isDraggingOver ? "bg-white/50 rounded-lg p-2" : ""
                    }`}
                  >
                    {boardTickets[status]?.map((ticket, index) => (
                      <Draggable
                        key={ticket.id}
                        draggableId={ticket.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-pointer transition-shadow ${
                              snapshot.isDragging ? "rotate-3 shadow-lg" : "hover:shadow-md"
                            } ${isOverdue(ticket) ? "border-red-300 bg-red-50" : ""}`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-sm font-medium line-clamp-2">
                                  {ticket.title}
                                </CardTitle>
                                {isOverdue(ticket) && (
                                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Badge size="sm" className={getPriorityColor(ticket.priority)}>
                                  {ticket.priority}
                                </Badge>
                                <Badge size="sm" variant="outline">
                                  {ticket.type}
                                </Badge>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-0">
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {ticket.description}
                              </p>
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                  {ticket.assignee ? (
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={ticket.assignee.profileImageUrl} />
                                      <AvatarFallback className="text-xs">
                                        {ticket.assignee.firstName?.[0]}{ticket.assignee.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-xs text-gray-500">?</span>
                                    </div>
                                  )}
                                </div>
                                
                                {ticket.resolutionDeadline && (
                                  <div className={`flex items-center gap-1 text-xs ${
                                    isOverdue(ticket) ? "text-red-600" : "text-muted-foreground"
                                  }`}>
                                    <Clock className="w-3 h-3" />
                                    {getTimeUntilDeadline(ticket.resolutionDeadline)}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                <span>#{ticket.id}</span>
                                {ticket.customer && (
                                  <span>{ticket.customer.name}</span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}