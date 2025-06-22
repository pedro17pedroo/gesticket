import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Minimize2, Maximize2, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  ticketId?: number;
}

interface ChatbotWidgetProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

export default function ChatbotWidget({ 
  isMinimized = false, 
  onToggleMinimize, 
  onClose 
}: ChatbotWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Olá! Sou o assistente virtual do GeckoStream. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
      suggestions: [
        'Criar um ticket',
        'Consultar base de conhecimento',
        'Status dos meus tickets',
        'Verificar SLA'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch knowledge articles for AI suggestions
  const { data: knowledgeArticles = [] } = useQuery({
    queryKey: ["knowledge-articles-ai"],
    queryFn: async () => {
      const response = await fetch("/api/knowledge-articles?published=true");
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  // Simulate AI response (in production, this would call an actual AI service)
  const getAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = userMessage.toLowerCase();
    let response = "";
    let suggestions: string[] = [];
    let ticketId: number | undefined;

    // Intent recognition (simplified)
    if (lowerMessage.includes("ticket") || lowerMessage.includes("problema")) {
      response = "Vou ajudá-lo a criar um ticket. Qual é o problema que você está enfrentando?";
      suggestions = ["Problema de login", "Sistema lento", "Erro na aplicação", "Solicitação de feature"];
    } else if (lowerMessage.includes("sla") || lowerMessage.includes("prazo")) {
      response = "Nossos SLAs são: Crítico (1h resposta/4h resolução), Alto (2h/8h), Médio (4h/24h), Baixo (8h/72h). Posso verificar o status de algum ticket específico?";
      suggestions = ["Verificar ticket específico", "Ver todos meus tickets"];
    } else if (lowerMessage.includes("conhecimento") || lowerMessage.includes("documentação")) {
      // Find relevant articles
      const relevantArticles = knowledgeArticles
        .filter((article: any) => 
          article.title.toLowerCase().includes(lowerMessage) ||
          article.content?.toLowerCase().includes(lowerMessage)
        )
        .slice(0, 3);

      if (relevantArticles.length > 0) {
        response = `Encontrei ${relevantArticles.length} artigo(s) relacionado(s):\n\n`;
        relevantArticles.forEach((article: any, index: number) => {
          response += `${index + 1}. ${article.title}\n`;
        });
        response += "\nGostaria que eu abra algum desses artigos?";
        suggestions = relevantArticles.map((article: any) => `Abrir: ${article.title}`);
      } else {
        response = "Não encontrei artigos específicos para sua consulta. Posso ajudá-lo a criar um ticket para esclarecimentos?";
        suggestions = ["Criar ticket", "Falar com agente"];
      }
    } else if (lowerMessage.includes("status") || lowerMessage.includes("andamento")) {
      response = "Para verificar o status dos seus tickets, acesse a aba 'Meus Tickets' no portal. Posso também criar um resumo dos tickets em aberto.";
      suggestions = ["Ver resumo de tickets", "Criar novo ticket"];
    } else {
      // General response with knowledge base search
      const searchTerms = lowerMessage.split(' ').filter(term => term.length > 3);
      const matchingArticles = knowledgeArticles.filter((article: any) => 
        searchTerms.some(term => 
          article.title.toLowerCase().includes(term) ||
          article.content?.toLowerCase().includes(term)
        )
      ).slice(0, 2);

      if (matchingArticles.length > 0) {
        response = `Baseado na sua pergunta, encontrei alguns artigos que podem ajudar:\n\n`;
        matchingArticles.forEach((article: any, index: number) => {
          response += `• ${article.title}\n`;
        });
        response += "\nIsso responde sua dúvida ou precisa de mais informações?";
        suggestions = ["Sim, resolveu", "Preciso de mais ajuda", "Criar ticket"];
      } else {
        response = "Entendi sua solicitação. Para uma melhor assistência, recomendo criar um ticket detalhado ou consultar nossa base de conhecimento.";
        suggestions = ["Criar ticket", "Ver base de conhecimento", "Falar com agente"];
      }
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: response,
      timestamp: new Date(),
      suggestions,
      ticketId
    };
  };

  const sendMessageMutation = useMutation({
    mutationFn: getAIResponse,
    onSuccess: (aiResponse) => {
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    
    sendMessageMutation.mutate(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-64 shadow-lg z-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Assistente IA
          </CardTitle>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onToggleMinimize}>
              <Maximize2 className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Clique para expandir o chat
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 shadow-lg z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="w-4 h-4" />
          Assistente IA
          <Badge variant="secondary" className="text-xs">
            Online
          </Badge>
        </CardTitle>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onToggleMinimize}>
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'bot' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.type === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          className="text-xs h-6"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}