import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  SearchIcon, 
  BookOpenIcon, 
  HelpCircleIcon,
  ChevronRightIcon,
  TagIcon,
  ClockIcon,
  UserIcon
} from "lucide-react";

interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
  author: string;
}

interface KnowledgeBaseProps {
  searchQuery?: string;
  category?: string;
  onArticleSelect?: (article: KnowledgeArticle) => void;
}

export default function KnowledgeBase({ searchQuery = "", category, onArticleSelect }: KnowledgeBaseProps) {
  const [search, setSearch] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState(category || "all");

  const { data: articles = [], isLoading } = useQuery<KnowledgeArticle[]>({
    queryKey: ['/api/knowledge-articles', { search, category: selectedCategory !== 'all' ? selectedCategory : undefined }],
  });

  const categories = [
    { value: "all", label: "Todas as Categorias" },
    { value: "hardware", label: "Hardware" },
    { value: "software", label: "Software" },
    { value: "email", label: "Email" },
    { value: "rede", label: "Rede" },
    { value: "telefonia", label: "Telefonia" },
    { value: "acesso", label: "Acesso" },
    { value: "procedimentos", label: "Procedimentos" }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = search === "" || 
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleArticleClick = (article: KnowledgeArticle) => {
    if (onArticleSelect) {
      onArticleSelect(article);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BookOpenIcon className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Base de Conhecimento</h2>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar artigos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <HelpCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum artigo encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou termos de pesquisa.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredArticles.map(article => (
            <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base hover:text-blue-600 transition-colors">
                      {article.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        {article.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {new Date(article.updatedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {article.content.substring(0, 150)}...
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {article.category}
                    </Badge>
                    {article.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <TagIcon className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {article.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{article.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>👍 {article.helpful}</span>
                    <span>👎 {article.notHelpful}</span>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => handleArticleClick(article)}
                    >
                      Ler Artigo Completo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{article.title}</DialogTitle>
                      <DialogDescription>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Por {article.author}</span>
                          <span>Atualizado em {new Date(article.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary">{article.category}</Badge>
                        {article.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <TagIcon className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        {article.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600 mb-3">Este artigo foi útil?</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            👍 Sim ({article.helpful})
                          </Button>
                          <Button variant="outline" size="sm">
                            👎 Não ({article.notHelpful})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}