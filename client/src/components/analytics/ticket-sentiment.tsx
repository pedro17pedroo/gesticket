import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  SmileIcon, 
  FrownIcon, 
  MehIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BarChart3Icon,
  AlertTriangleIcon
} from "lucide-react";

interface SentimentAnalysis {
  ticketId: number;
  title: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  urgencyLevel: number;
  keywords: string[];
  category: string;
  createdAt: string;
  escalationRisk: 'low' | 'medium' | 'high';
}

interface SentimentStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  averageScore: number;
  trend: 'up' | 'down' | 'stable';
}

export default function TicketSentiment() {
  const [timeRange, setTimeRange] = useState("7d");
  const [category, setCategory] = useState("all");

  // Mock data - in real app, this would come from sentiment analysis API
  const mockAnalysis: SentimentAnalysis[] = [
    {
      ticketId: 123,
      title: "Urgente: Sistema totalmente fora do ar!!!",
      sentiment: 'negative',
      score: -0.8,
      urgencyLevel: 9,
      keywords: ['urgente', 'totalmente', 'fora do ar'],
      category: 'sistema',
      createdAt: new Date().toISOString(),
      escalationRisk: 'high'
    },
    {
      ticketId: 124,
      title: "Problema com impressora, quando possível",
      sentiment: 'neutral',
      score: -0.2,
      urgencyLevel: 3,
      keywords: ['problema', 'quando possível'],
      category: 'hardware',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      escalationRisk: 'low'
    },
    {
      ticketId: 125,
      title: "Obrigado pela ajuda anterior, funciona perfeitamente!",
      sentiment: 'positive',
      score: 0.9,
      urgencyLevel: 1,
      keywords: ['obrigado', 'perfeitamente', 'funciona'],
      category: 'agradecimento',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      escalationRisk: 'low'
    },
    {
      ticketId: 126,
      title: "Não consigo acessar, muito frustrado com isso",
      sentiment: 'negative',
      score: -0.6,
      urgencyLevel: 7,
      keywords: ['não consigo', 'frustrado'],
      category: 'acesso',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      escalationRisk: 'medium'
    }
  ];

  const stats: SentimentStats = {
    total: mockAnalysis.length,
    positive: mockAnalysis.filter(a => a.sentiment === 'positive').length,
    neutral: mockAnalysis.filter(a => a.sentiment === 'neutral').length,
    negative: mockAnalysis.filter(a => a.sentiment === 'negative').length,
    averageScore: mockAnalysis.reduce((sum, a) => sum + a.score, 0) / mockAnalysis.length,
    trend: 'down' // Based on recent negative sentiment
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <SmileIcon className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <FrownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MehIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getEscalationColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const filteredAnalysis = mockAnalysis.filter(analysis => {
    if (category !== 'all' && analysis.category !== category) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Análise de Sentimento</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="sistema">Sistema</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="acesso">Acesso</SelectItem>
              <SelectItem value="agradecimento">Agradecimento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3Icon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Positivos</p>
                <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
              </div>
              <SmileIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Neutros</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.neutral}</p>
              </div>
              <MehIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Negativos</p>
                <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
              </div>
              <FrownIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tendência</p>
                <p className="text-lg font-semibold flex items-center gap-1">
                  {stats.trend === 'up' ? (
                    <TrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : stats.trend === 'down' ? (
                    <TrendingDownIcon className="h-4 w-4 text-red-500" />
                  ) : (
                    <div className="h-4 w-4 bg-gray-400 rounded-full" />
                  )}
                  {stats.trend === 'up' ? 'Melhorando' : 
                   stats.trend === 'down' ? 'Piorando' : 'Estável'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Recente de Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAnalysis.map((analysis) => (
              <div key={analysis.ticketId} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">#{analysis.ticketId}</span>
                      {getSentimentIcon(analysis.sentiment)}
                      <Badge className={getSentimentColor(analysis.sentiment)}>
                        {analysis.sentiment === 'positive' ? 'Positivo' :
                         analysis.sentiment === 'negative' ? 'Negativo' : 'Neutro'}
                      </Badge>
                      <Badge className={getEscalationColor(analysis.escalationRisk)}>
                        Risco: {analysis.escalationRisk === 'high' ? 'Alto' :
                                analysis.escalationRisk === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {analysis.title}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">
                      Score: {(analysis.score * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Urgência: {analysis.urgencyLevel}/10
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {analysis.keywords.map(keyword => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(analysis.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>

                {analysis.escalationRisk === 'high' && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800 flex items-center gap-2">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <span>
                      Alto risco de escalação - Requer atenção imediata
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
              <h4 className="font-medium text-orange-800 mb-1">
                Tendência Negativa Detectada
              </h4>
              <p className="text-sm text-orange-700">
                Há um aumento de tickets com sentimento negativo nas últimas 24 horas. 
                Considere revisar os processos de atendimento.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-800 mb-1">
                Palavras-chave Frequentes
              </h4>
              <p className="text-sm text-blue-700">
                "Urgente", "não consigo" e "frustrado" estão aparecendo frequentemente. 
                Considere criar templates para estes casos.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-medium text-green-800 mb-1">
                Feedback Positivo
              </h4>
              <p className="text-sm text-green-700">
                Tickets de agradecimento indicam boa qualidade no atendimento. 
                Continue mantendo os padrões de qualidade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}