import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  PlusIcon, 
  SearchIcon, 
  BookOpenIcon, 
  FileTextIcon, 
  TagIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  FilterIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Types
interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  published: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

// Form Schema
const articleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255, "Título muito longo"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  summary: z.string().max(500, "Resumo muito longo").optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  tags: z.string().optional(),
  published: z.boolean().default(false),
});

type ArticleFormData = z.infer<typeof articleSchema>;

const categories = [
  "Configuração",
  "Troubleshooting", 
  "Como Fazer",
  "FAQ",
  "Procedimentos",
  "Políticas",
  "Integrações",
  "Relatórios"
];

export default function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showPublishedOnly, setShowPublishedOnly] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [viewingArticle, setViewingArticle] = useState<KnowledgeArticle | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch articles
  const { data: articles = [], isLoading } = useQuery<KnowledgeArticle[]>({
    queryKey: ['/api/knowledge-articles', { search: searchTerm, category: selectedCategory, published: showPublishedOnly }],
  });

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: (data: ArticleFormData) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };
      return fetch('/api/knowledge-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-articles'] });
      setIsCreateDialogOpen(false);
      toast({ title: "Artigo criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar artigo", variant: "destructive" });
    },
  });

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ArticleFormData }) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };
      return fetch(`/api/knowledge-articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-articles'] });
      setEditingArticle(null);
      toast({ title: "Artigo atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar artigo", variant: "destructive" });
    },
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/knowledge-articles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-articles'] });
      toast({ title: "Artigo removido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover artigo", variant: "destructive" });
    },
  });

  // Form handling
  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      content: "",
      summary: "",
      category: "",
      tags: "",
      published: false,
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (article: KnowledgeArticle) => {
    setEditingArticle(article);
    form.reset({
      title: article.title,
      content: article.content,
      summary: article.summary || "",
      category: article.category,
      tags: article.tags.join(", "),
      published: article.published,
    });
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesPublished = !showPublishedOnly || article.published;
    
    return matchesSearch && matchesCategory && matchesPublished;
  });

  const ArticleCard = ({ article }: { article: KnowledgeArticle }) => (
    <Card className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={article.published ? "default" : "secondary"}>
                {article.published ? "Publicado" : "Rascunho"}
              </Badge>
              <Badge variant="outline">{article.category}</Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {article.title}
            </CardTitle>
            {article.summary && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {article.summary}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-4">
          {article.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              <TagIcon className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              {article.views} visualizações
            </span>
            <span>
              Criado {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewingArticle(article)}
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => startEdit(article)}
          >
            <EditIcon className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteMutation.mutate(article.id)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout
      title="Base Conhecimento" 
      subtitle="Artigos e documentação para autoatendimento"
    >
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                checked={showPublishedOnly}
                onCheckedChange={setShowPublishedOnly}
              />
              <label className="text-sm">Apenas publicados</label>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Novo Artigo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Artigos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileTextIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Publicados</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {articles.filter(a => a.published).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <EyeIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Visualizações</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {articles.reduce((sum, a) => sum + a.views, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TagIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorias</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum artigo encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || selectedCategory !== "all" ? 
                  "Tente ajustar os filtros de busca." : 
                  "Comece criando seu primeiro artigo da base de conhecimento."
                }
              </p>
              {!searchTerm && selectedCategory === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Criar Primeiro Artigo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || !!editingArticle} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingArticle(null);
            form.reset();
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Editar Artigo" : "Novo Artigo"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Título do artigo..." {...field} />
                        </FormControl>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumo (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Breve descrição do artigo..."
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
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Conteúdo completo do artigo..."
                          rows={12}
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
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (separadas por vírgula)</FormLabel>
                        <FormControl>
                          <Input placeholder="tag1, tag2, tag3..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Publicar artigo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Tornar o artigo visível para os usuários
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingArticle(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingArticle ? "Atualizar" : "Criar"} Artigo
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Article Dialog */}
        <Dialog open={!!viewingArticle} onOpenChange={() => setViewingArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {viewingArticle && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-xl mb-2">{viewingArticle.title}</DialogTitle>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant={viewingArticle.published ? "default" : "secondary"}>
                          {viewingArticle.published ? "Publicado" : "Rascunho"}
                        </Badge>
                        <Badge variant="outline">{viewingArticle.category}</Badge>
                        <span className="text-sm text-gray-500">
                          {viewingArticle.views} visualizações
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4">
                  {viewingArticle.summary && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Resumo</h4>
                      <p className="text-gray-700 dark:text-gray-300">{viewingArticle.summary}</p>
                    </div>
                  )}
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap">{viewingArticle.content}</div>
                  </div>
                  {viewingArticle.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingArticle.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            <TagIcon className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
