import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, X, AlertCircle, Paperclip } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ticketFormSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.enum(['support', 'incident', 'optimization', 'feature_request']),
  customerId: z.number().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  environment: z.string().optional(),
  affectedSystem: z.string().optional(),
  location: z.string().optional(),
  contactPhone: z.string().optional(),
  incidentDate: z.string().optional(),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  impact: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  tags: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

interface EnhancedTicketFormProps {
  onSubmit?: (data: TicketFormData) => void;
  initialData?: Partial<TicketFormData>;
  isEditing?: boolean;
}

export default function EnhancedTicketForm({ onSubmit, initialData, isEditing = false }: EnhancedTicketFormProps) {
  const [, setLocation] = useLocation();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [currentTab, setCurrentTab] = useState('basic');
  const queryClient = useQueryClient();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      priority: 'medium',
      type: 'support',
      impact: 'medium',
      urgency: 'medium',
      ...initialData,
    },
  });

  // Fetch customers for selection
  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers'],
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const formData = new FormData();
      
      // Append form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append attachments
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      setLocation('/tickets');
    },
  });

  const handleSubmit = (data: TicketFormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      createTicketMutation.mutate(data);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const categories = [
    'Hardware',
    'Software',
    'Rede',
    'Segurança',
    'Email',
    'Acesso',
    'Performance',
    'Backup',
    'Outros'
  ];

  const subcategoriesByCategory: Record<string, string[]> = {
    'Hardware': ['Computador', 'Impressora', 'Monitor', 'Teclado/Rato', 'Servidor'],
    'Software': ['Sistema Operativo', 'Aplicação', 'Driver', 'Licenças'],
    'Rede': ['Internet', 'Wi-Fi', 'VPN', 'Conectividade'],
    'Segurança': ['Antivírus', 'Firewall', 'Acesso Não Autorizado', 'Malware'],
    'Email': ['Configuração', 'Envio/Receção', 'Spam', 'Outlook'],
    'Acesso': ['Login', 'Passwords', 'Permissões', 'Contas'],
    'Performance': ['Lentidão', 'Crash', 'Timeout', 'Memória'],
    'Backup': ['Falha de Backup', 'Restauro', 'Configuração'],
    'Outros': ['Formação', 'Consultoria', 'Novo Equipamento']
  };

  const selectedCategory = form.watch('category');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Ticket' : 'Criar Novo Ticket'}
          </CardTitle>
          <CardDescription>
            Preencha os detalhes do ticket para registar o seu pedido de suporte
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="details">Detalhes Técnicos</TabsTrigger>
                <TabsTrigger value="classification">Classificação</TabsTrigger>
                <TabsTrigger value="attachments">Anexos</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="Resumo breve do problema"
                      {...form.register('title')}
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerId">Cliente</Label>
                    <Select 
                      value={form.watch('customerId')?.toString()} 
                      onValueChange={(value) => form.setValue('customerId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o problema em detalhe..."
                    rows={6}
                    {...form.register('description')}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select 
                      value={form.watch('priority')} 
                      onValueChange={(value) => form.setValue('priority', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select 
                      value={form.watch('type')} 
                      onValueChange={(value) => form.setValue('type', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">Suporte</SelectItem>
                        <SelectItem value="incident">Incidente</SelectItem>
                        <SelectItem value="optimization">Otimização</SelectItem>
                        <SelectItem value="feature_request">Nova Funcionalidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Telefone de Contacto</Label>
                    <Input
                      id="contactPhone"
                      placeholder="+351 912 345 678"
                      {...form.register('contactPhone')}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="environment">Ambiente</Label>
                    <Input
                      id="environment"
                      placeholder="Produção, Teste, Desenvolvimento..."
                      {...form.register('environment')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="affectedSystem">Sistema Afetado</Label>
                    <Input
                      id="affectedSystem"
                      placeholder="CRM, ERP, Email..."
                      {...form.register('affectedSystem')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      placeholder="Escritório, Departamento..."
                      {...form.register('location')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="incidentDate">Data do Incidente</Label>
                    <Input
                      id="incidentDate"
                      type="datetime-local"
                      {...form.register('incidentDate')}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stepsToReproduce">Passos para Reproduzir</Label>
                    <Textarea
                      id="stepsToReproduce"
                      placeholder="1. Abrir aplicação...&#10;2. Clicar em...&#10;3. Inserir dados..."
                      rows={4}
                      {...form.register('stepsToReproduce')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expectedBehavior">Comportamento Esperado</Label>
                      <Textarea
                        id="expectedBehavior"
                        placeholder="O que deveria acontecer..."
                        rows={3}
                        {...form.register('expectedBehavior')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="actualBehavior">Comportamento Atual</Label>
                      <Textarea
                        id="actualBehavior"
                        placeholder="O que está realmente a acontecer..."
                        rows={3}
                        {...form.register('actualBehavior')}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="classification" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select 
                      value={form.watch('category')} 
                      onValueChange={(value) => {
                        form.setValue('category', value);
                        form.setValue('subcategory', ''); // Reset subcategory
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategoria</Label>
                    <Select 
                      value={form.watch('subcategory')} 
                      onValueChange={(value) => form.setValue('subcategory', value)}
                      disabled={!selectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory && subcategoriesByCategory[selectedCategory]?.map((subcategory) => (
                          <SelectItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="impact">Impacto</Label>
                    <Select 
                      value={form.watch('impact')} 
                      onValueChange={(value) => form.setValue('impact', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgência</Label>
                    <Select 
                      value={form.watch('urgency')} 
                      onValueChange={(value) => form.setValue('urgency', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="urgente, servidor, email (separadas por vírgulas)"
                    {...form.register('tags')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use vírgulas para separar múltiplas tags
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Clique para fazer upload ou arraste ficheiros aqui
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.zip"
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        PDF, DOC, PNG, JPG até 10MB cada
                      </p>
                    </div>
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Ficheiros Anexados</Label>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {createTicketMutation.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao criar ticket. Tente novamente.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/tickets')}
              >
                Cancelar
              </Button>
              
              <div className="space-x-2">
                {currentTab !== 'basic' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tabs = ['basic', 'details', 'classification', 'attachments'];
                      const currentIndex = tabs.indexOf(currentTab);
                      if (currentIndex > 0) {
                        setCurrentTab(tabs[currentIndex - 1]);
                      }
                    }}
                  >
                    Anterior
                  </Button>
                )}
                
                {currentTab !== 'attachments' ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const tabs = ['basic', 'details', 'classification', 'attachments'];
                      const currentIndex = tabs.indexOf(currentTab);
                      if (currentIndex < tabs.length - 1) {
                        setCurrentTab(tabs[currentIndex + 1]);
                      }
                    }}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={createTicketMutation.isPending}
                  >
                    {createTicketMutation.isPending ? 'A criar...' : (isEditing ? 'Actualizar' : 'Criar Ticket')}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}