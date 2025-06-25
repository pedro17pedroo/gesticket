import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2Icon, 
  PaperclipIcon, 
  XIcon, 
  FileIcon, 
  ImageIcon, 
  FileTextIcon,
  UserIcon,
  AlertTriangleIcon,
  SettingsIcon,
  ClockIcon
} from "lucide-react";

// Enhanced ticket schema with all new fields
const enhancedTicketSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  type: z.enum(["support", "incident", "optimization", "feature_request"]),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  
  // User information
  contactPhone: z.string().optional(),
  
  // Technical details
  environment: z.string().optional(),
  affectedSystem: z.string().optional(),
  location: z.string().optional(),
  incidentDate: z.string().optional(),
  
  // Problem description
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  
  // Impact and urgency
  impact: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  urgency: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  
  // Tags
  tags: z.string().optional(),
  
  // Assignment
  customerId: z.number().optional(),
  assigneeId: z.string().optional(),
});

type EnhancedTicketData = z.infer<typeof enhancedTicketSchema>;

interface EnhancedTicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: any;
}

const CATEGORIES = [
  { value: "hardware", label: "Hardware", subcategories: ["Computador", "Impressora", "Monitor", "Rede"] },
  { value: "software", label: "Software", subcategories: ["Aplicativo", "Sistema Operacional", "Licenças", "Updates"] },
  { value: "acesso", label: "Acesso", subcategories: ["Login", "Permissões", "Senhas", "VPN"] },
  { value: "email", label: "Email", subcategories: ["Outlook", "Webmail", "Configuração", "Spam"] },
  { value: "telefonia", label: "Telefonia", subcategories: ["Telefone Fixo", "Celular", "Voip", "Conferência"] },
  { value: "outros", label: "Outros", subcategories: ["Solicitação", "Dúvida", "Sugestão"] }
];

const ENVIRONMENTS = ["Produção", "Homologação", "Desenvolvimento", "Testes"];
const SYSTEMS = ["ERP", "CRM", "Email", "Rede", "Website", "Banco de Dados", "Backup"];
const LOCATIONS = ["Matriz", "Filial 1", "Filial 2", "Home Office", "Remoto"];

export default function EnhancedTicketForm({ open, onOpenChange, ticket }: EnhancedTicketFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState("basic");

  // Fetch customers and users for dropdowns
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    enabled: open,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    enabled: open,
  });

  const form = useForm<EnhancedTicketData>({
    resolver: zodResolver(enhancedTicketSchema),
    defaultValues: {
      title: ticket?.title || "",
      description: ticket?.description || "",
      priority: ticket?.priority || "medium",
      type: ticket?.type || "support",
      category: ticket?.category || "",
      subcategory: ticket?.subcategory || "",
      contactPhone: ticket?.contactPhone || "",
      environment: ticket?.environment || "",
      affectedSystem: ticket?.affectedSystem || "",
      location: ticket?.location || "",
      incidentDate: ticket?.incidentDate || "",
      stepsToReproduce: ticket?.stepsToReproduce || "",
      expectedBehavior: ticket?.expectedBehavior || "",
      actualBehavior: ticket?.actualBehavior || "",
      impact: ticket?.impact || "medium",
      urgency: ticket?.urgency || "medium",
      tags: ticket?.tags || "",
      customerId: ticket?.customerId || undefined,
      assigneeId: ticket?.assigneeId || undefined,
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: EnhancedTicketData) => {
      const formData = new FormData();
      
      // Add ticket data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Add files
      selectedFiles.forEach((file) => {
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
      setActiveTab("basic");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar ticket. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de 10MB`,
          variant: "destructive",
        });
        return false;
      }
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: `${file.name} não é um tipo de arquivo permitido`,
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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (file.type === 'application/pdf') return <FileTextIcon className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  const onSubmit = (data: EnhancedTicketData) => {
    createTicketMutation.mutate(data);
  };

  const selectedCategoryData = CATEGORIES.find(cat => cat.value === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5" />
            {ticket ? "Editar Ticket" : "Novo Ticket"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações detalhadamente para um atendimento mais rápido e eficaz
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Básico
                </TabsTrigger>
                <TabsTrigger value="technical" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  Técnico
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  Detalhes
                </TabsTrigger>
                <TabsTrigger value="attachments" className="flex items-center gap-2">
                  <PaperclipIcon className="h-4 w-4" />
                  Anexos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Título *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Descreva o problema ou solicitação de forma resumida..."
                                {...field}
                              />
                            </FormControl>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedCategory(value);
                              form.setValue("subcategory", "");
                            }} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CATEGORIES.map(cat => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedCategoryData && (
                        <FormField
                          control={form.control}
                          name="subcategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subcategoria</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a subcategoria" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {selectedCategoryData.subcategories.map(sub => (
                                    <SelectItem key={sub} value={sub}>
                                      {sub}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone de Contato</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(11) 99999-9999"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Para contato em casos urgentes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição Detalhada *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva detalhadamente o problema ou solicitação. Inclua o máximo de informações possível..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Mínimo de 10 caracteres. Seja específico para um atendimento mais rápido.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Técnicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="environment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ambiente</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o ambiente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ENVIRONMENTS.map(env => (
                                  <SelectItem key={env} value={env}>
                                    {env}
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
                        name="affectedSystem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sistema Afetado</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o sistema" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SYSTEMS.map(sys => (
                                  <SelectItem key={sys} value={sys}>
                                    {sys}
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
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localização</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a localização" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LOCATIONS.map(loc => (
                                  <SelectItem key={loc} value={loc}>
                                    {loc}
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
                        name="incidentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data/Hora do Incidente</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Quando o problema começou a ocorrer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="impact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Impacto</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o impacto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Baixo - Afeta um usuário</SelectItem>
                                <SelectItem value="medium">Médio - Afeta um departamento</SelectItem>
                                <SelectItem value="high">Alto - Afeta vários departamentos</SelectItem>
                                <SelectItem value="critical">Crítico - Afeta toda a empresa</SelectItem>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a urgência" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Baixa - Pode esperar</SelectItem>
                                <SelectItem value="medium">Média - Próximos dias</SelectItem>
                                <SelectItem value="high">Alta - Hoje</SelectItem>
                                <SelectItem value="critical">Crítica - Imediatamente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes do Problema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="stepsToReproduce"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passos para Reproduzir</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="1. Primeiro faço isso...&#10;2. Depois faço aquilo...&#10;3. Então acontece..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Liste os passos exatos para reproduzir o problema
                          </FormDescription>
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
                                rows={3}
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
                                placeholder="Descreva o que realmente acontece..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="palavra-chave1, palavra-chave2, palavra-chave3"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Separe as tags por vírgula
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Anexos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <PaperclipIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Selecionar Arquivos
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          Ou arraste e solte aqui. Máximo 5 arquivos, 10MB cada.
                        </p>
                        <p className="text-xs text-gray-400">
                          Formatos: JPG, PNG, GIF, PDF, DOC, XLS, TXT
                        </p>
                      </div>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Arquivos Selecionados:</h4>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(file)}
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              
              <div className="flex gap-2">
                {activeTab !== "attachments" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tabs = ["basic", "technical", "details", "attachments"];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
                  >
                    Próximo
                  </Button>
                )}
                
                <Button type="submit" disabled={createTicketMutation.isPending}>
                  {createTicketMutation.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                  {ticket ? "Atualizar" : "Criar"} Ticket
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}