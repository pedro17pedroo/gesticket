import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTicketSchema, type InsertTicket, type Customer, type User } from "@shared/schema";
import { TicketPriority, TicketType } from "@/types";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2Icon, PaperclipIcon, XIcon, FileIcon, ImageIcon, FileTextIcon } from "lucide-react";

// Extended schema for file uploads
const extendedTicketSchema = insertTicketSchema.extend({
  tags: z.string().optional(),
  environment: z.string().optional(),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  impact: z.enum(["low", "medium", "high", "critical"]).optional(),
  urgency: z.enum(["low", "medium", "high", "critical"]).optional(),
});

type ExtendedTicketData = z.infer<typeof extendedTicketSchema>;

interface TicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: any; // For editing existing tickets
}

export default function TicketForm({ open, onOpenChange, ticket }: TicketFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: open,
  });

  // Fetch users for assignee dropdown
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: open,
  });

  const form = useForm<ExtendedTicketData>({
    resolver: zodResolver(extendedTicketSchema),
    defaultValues: {
      title: ticket?.title || "",
      description: ticket?.description || "",
      priority: ticket?.priority || "medium",
      status: ticket?.status || "open",
      type: ticket?.type || "support",
      customerId: ticket?.customerId || undefined,
      assigneeId: ticket?.assigneeId || undefined,
      tags: ticket?.tags || "",
      environment: ticket?.environment || "",
      stepsToReproduce: ticket?.stepsToReproduce || "",
      expectedBehavior: ticket?.expectedBehavior || "",
      actualBehavior: ticket?.actualBehavior || "",
      impact: ticket?.impact || "medium",
      urgency: ticket?.urgency || "medium",
    },
  });

  // File handling functions
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileTextIcon;
    return FileIcon;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const createTicketMutation = useMutation({
    mutationFn: async (data: ExtendedTicketData) => {
      const formData = new FormData();
      
      // Add ticket data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Add files
      selectedFiles.forEach((file, index) => {
        formData.append(`attachments`, file);
      });

      const response = await fetch("/api/tickets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Ticket criado com sucesso!",
      });
      onOpenChange(false);
      form.reset();
      setSelectedFiles([]);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar ticket. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async (data: Partial<InsertTicket>) => {
      const response = await apiRequest("PATCH", `/api/tickets/${ticket.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Ticket atualizado com sucesso!",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar ticket. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTicket) => {
    // Convert "unassigned" back to null for database storage
    const processedData = {
      ...data,
      assigneeId: data.assigneeId === "unassigned" ? null : data.assigneeId,
    };
    
    if (ticket) {
      updateTicketMutation.mutate(processedData);
    } else {
      createTicketMutation.mutate(processedData);
    }
  };

  const isLoading = createTicketMutation.isPending || updateTicketMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {ticket ? "Editar Ticket" : "Novo Ticket"}
          </DialogTitle>
          <DialogDescription>
            {ticket 
              ? "Atualize as informações do ticket." 
              : "Preencha os dados para criar um novo ticket de suporte."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Descreva o problema ou solicitação..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Forneça detalhes adicionais sobre o ticket..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "medium"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "support"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="support">Suporte</SelectItem>
                        <SelectItem value="incident">Incidente</SelectItem>
                        <SelectItem value="optimization">Otimização</SelectItem>
                        <SelectItem value="feature_request">Nova Funcionalidade</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "unassigned"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Atribuir a..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Não atribuído</SelectItem>
                        {users.filter(user => user.role === 'agent' || user.role === 'manager').map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {ticket && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "open"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Aberto</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="waiting_customer">Aguardando Cliente</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Additional Fields for Robust Ticket Creation */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impacto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "medium"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o impacto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixo - Poucos usuários afetados</SelectItem>
                        <SelectItem value="medium">Médio - Alguns usuários afetados</SelectItem>
                        <SelectItem value="high">Alto - Muitos usuários afetados</SelectItem>
                        <SelectItem value="critical">Crítico - Todos os usuários afetados</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgência</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "medium"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a urgência" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixa - Pode aguardar</SelectItem>
                        <SelectItem value="medium">Média - Em algumas horas</SelectItem>
                        <SelectItem value="high">Alta - Logo que possível</SelectItem>
                        <SelectItem value="critical">Crítica - Imediatamente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambiente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Produção, Homologação, Desenvolvimento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: bug, performance, ui, backend (separadas por vírgula)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("type") === "incident" && (
              <>
                <FormField
                  control={form.control}
                  name="stepsToReproduce"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passos para Reproduzir</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="1. Acesse a página...&#10;2. Clique em...&#10;3. Observe o erro..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expectedBehavior"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comportamento Esperado</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o que deveria acontecer..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="actualBehavior"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comportamento Atual</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o que está acontecendo..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* File Upload Section */}
            <div className="space-y-4">
              <FormLabel>Anexos</FormLabel>
              
              {/* Drag & Drop Zone */}
              <Card 
                className={`border-2 border-dashed transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <CardContent className="p-6">
                  <div
                    className="text-center space-y-4"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <PaperclipIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Arraste arquivos aqui ou{" "}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          clique para selecionar
                        </button>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Máximo 5 arquivos, 10MB cada. Formatos: JPG, PNG, PDF, DOC, XLS, TXT, ZIP
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Selected Files Display */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Arquivos selecionados:</p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => {
                      const FileIconComponent = getFileIcon(file.type);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <FileIconComponent className="h-4 w-4 text-gray-500" />
                            <span className="text-sm truncate max-w-xs">{file.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0"
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                {ticket ? "Atualizar" : "Criar"} Ticket
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
