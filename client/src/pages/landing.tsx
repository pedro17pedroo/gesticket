import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TicketIcon, 
  ClockIcon, 
  ChartBarIcon, 
  BookOpenIcon,
  Users,
  CheckCircleIcon 
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GeckoStream</span>
            </div>
            <Button onClick={() => window.location.href = '/api/login'}>
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Gestão de Tickets
            <span className="text-primary-600 block">Inteligente</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transforme o suporte ao cliente em uma experiência fluida e estratégica com 
            nossa plataforma de gestão de tickets aprimorada por IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Começar Agora
            </Button>
            <Button variant="outline" size="lg">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-lg text-gray-600">
              Tudo que você precisa para uma gestão de suporte eficiente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <TicketIcon className="w-10 h-10 text-primary-600 mb-2" />
                <CardTitle>Gestão de Tickets</CardTitle>
                <CardDescription>
                  Criação omnicanal, roteamento inteligente e acompanhamento em tempo real
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <ClockIcon className="w-10 h-10 text-warning-600 mb-2" />
                <CardTitle>SLA Inteligente</CardTitle>
                <CardDescription>
                  Monitoramento automático com alertas visuais e escalonamento dinâmico
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <ChartBarIcon className="w-10 h-10 text-success-600 mb-2" />
                <CardTitle>Rastreamento de Tempo</CardTitle>
                <CardDescription>
                  Timer integrado, bolsa de horas e gestão de custos por cliente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BookOpenIcon className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>Base de Conhecimento</CardTitle>
                <CardDescription>
                  Artigos indexados, sugestões por IA e portal de autoatendimento
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-10 h-10 text-indigo-600 mb-2" />
                <CardTitle>Colaboração</CardTitle>
                <CardDescription>
                  Comentários internos, notificações em tempo real e trabalho em equipe
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircleIcon className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle>Análises Avançadas</CardTitle>
                <CardDescription>
                  Dashboards interativos, relatórios personalizados e insights preditivos
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que GeckoStream?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Resultados Comprovados
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-success-50 text-success-700">
                    +90%
                  </Badge>
                  <span className="text-gray-700">Satisfação do Cliente (CSAT)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-primary-50 text-primary-700">
                    +75%
                  </Badge>
                  <span className="text-gray-700">Taxa de Resolução no Primeiro Contato</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-warning-50 text-warning-700">
                    -25%
                  </Badge>
                  <span className="text-gray-700">Redução no Custo por Ticket</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    +95%
                  </Badge>
                  <span className="text-gray-700">Conformidade com SLA</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Tecnologias Modernas
              </h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  <span>Interface responsiva otimizada</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  <span>PWA para acesso offline</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  <span>IA para automação inteligente</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  <span>Integrações via API</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  <span>Conformidade LGPD e GDPR</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para Transformar seu Suporte?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Junte-se a centenas de empresas que já otimizaram seu atendimento com GeckoStream
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = '/api/login'}
          >
            Começar Gratuitamente
          </Button>
        </div>
      </section>
    </div>
  );
}
