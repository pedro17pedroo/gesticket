import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BrainIcon, 
  LightbulbIcon, 
  ArrowRightIcon,
  ClockIcon,
  TrendingUpIcon,
  AlertTriangleIcon
} from "lucide-react";

interface SmartSuggestion {
  id: string;
  type: 'template' | 'knowledge_article' | 'similar_ticket' | 'escalation_warning';
  title: string;
  description: string;
  confidence: number;
  relevantFields?: string[];
  actionText: string;
  metadata?: any;
}

interface SmartSuggestionsProps {
  formData: any;
  onSuggestionAccept: (suggestion: SmartSuggestion) => void;
}

export default function SmartSuggestions({ formData, onSuggestionAccept }: SmartSuggestionsProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate AI-powered suggestions based on form data
  useEffect(() => {
    if (!formData.title && !formData.description) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    const timeout = setTimeout(() => {
      const newSuggestions = generateSuggestions(formData);
      setSuggestions(newSuggestions);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [formData.title, formData.description, formData.category]);

  const generateSuggestions = (data: any): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];
    const title = data.title?.toLowerCase() || '';
    const description = data.description?.toLowerCase() || '';
    const text = `${title} ${description}`;

    // Template suggestions based on keywords
    if (text.includes('não liga') || text.includes('computador') || text.includes('pc')) {
      suggestions.push({
        id: 'template-hardware-computer',
        type: 'template',
        title: 'Template: Problema no Computador',
        description: 'Detectamos que seu problema pode estar relacionado a hardware. Use nosso template especializado.',
        confidence: 85,
        relevantFields: ['title', 'description'],
        actionText: 'Usar Template',
        metadata: { templateId: 'hardware-computer' }
      });
    }

    if (text.includes('internet') || text.includes('rede') || text.includes('wifi') || text.includes('conexão')) {
      suggestions.push({
        id: 'template-network',
        type: 'template',
        title: 'Template: Problema de Rede',
        description: 'Problema de conectividade detectado. Template específico com troubleshooting.',
        confidence: 90,
        relevantFields: ['title', 'description', 'category'],
        actionText: 'Usar Template',
        metadata: { templateId: 'network-connection' }
      });
    }

    if (text.includes('email') || text.includes('outlook') || text.includes('correio')) {
      suggestions.push({
        id: 'template-email',
        type: 'template',
        title: 'Template: Problema no Email',
        description: 'Problema de email identificado. Template com verificações comuns.',
        confidence: 88,
        relevantFields: ['title', 'description'],
        actionText: 'Usar Template',
        metadata: { templateId: 'email-issue' }
      });
    }

    // Knowledge base suggestions
    if (text.includes('erro') || text.includes('problema') || text.includes('não funciona')) {
      suggestions.push({
        id: 'knowledge-troubleshooting',
        type: 'knowledge_article',
        title: 'Artigo: Guia de Troubleshooting',
        description: 'Passos básicos para identificar e resolver problemas comuns.',
        confidence: 75,
        actionText: 'Ver Artigo',
        metadata: { articleId: 'troubleshooting-guide' }
      });
    }

    // Similar ticket suggestions (mock)
    if (title.length > 10) {
      suggestions.push({
        id: 'similar-ticket-123',
        type: 'similar_ticket',
        title: 'Ticket Similar Encontrado',
        description: 'Ticket #123 tinha problema similar e foi resolvido em 2 horas. Ver solução aplicada.',
        confidence: 72,
        actionText: 'Ver Ticket',
        metadata: { ticketId: 123, resolutionTime: '2h' }
      });
    }

    // Escalation warnings
    if (text.includes('urgente') || text.includes('crítico') || text.includes('parado') || text.includes('!!')) {
      suggestions.push({
        id: 'escalation-warning',
        type: 'escalation_warning',
        title: 'Alerta: Possível Escalação',
        description: 'Linguagem indica alta urgência. Considere prioridade alta e notificação imediata.',
        confidence: 95,
        actionText: 'Ajustar Prioridade',
        metadata: { suggestedPriority: 'high', suggestedUrgency: 'high' }
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  };

  const handleAcceptSuggestion = (suggestion: SmartSuggestion) => {
    onSuggestionAccept(suggestion);
  };

  const getSuggestionIcon = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'template':
        return <LightbulbIcon className="h-4 w-4 text-blue-500" />;
      case 'knowledge_article':
        return <BrainIcon className="h-4 w-4 text-green-500" />;
      case 'similar_ticket':
        return <ClockIcon className="h-4 w-4 text-purple-500" />;
      case 'escalation_warning':
        return <AlertTriangleIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <BrainIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSuggestionColor = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'template':
        return 'border-l-blue-500 bg-blue-50';
      case 'knowledge_article':
        return 'border-l-green-500 bg-green-50';
      case 'similar_ticket':
        return 'border-l-purple-500 bg-purple-50';
      case 'escalation_warning':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (suggestions.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BrainIcon className="h-5 w-5" />
          Sugestões Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            Analisando seu ticket...
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                className={`p-3 rounded-lg border-l-4 ${getSuggestionColor(suggestion.type)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getSuggestionIcon(suggestion.type)}
                      <h4 className="font-medium text-sm">{suggestion.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.confidence}% match
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {suggestion.description}
                    </p>
                    {suggestion.relevantFields && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {suggestion.relevantFields.map(field => (
                          <span key={field} className="text-xs bg-white px-2 py-1 rounded border">
                            {field}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    className="flex items-center gap-1 text-xs"
                  >
                    {suggestion.actionText}
                    <ArrowRightIcon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}