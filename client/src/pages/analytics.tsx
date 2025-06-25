import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import TicketSentiment from "@/components/analytics/ticket-sentiment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  SmileIcon, 
  ClockIcon,
  UsersIcon,
  TicketIcon
} from "lucide-react";

export default function Analytics() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3Icon className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Analytics Avançado</h1>
        </div>

        <Tabs defaultValue="sentiment" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sentiment" className="flex items-center gap-2">
              <SmileIcon className="h-4 w-4" />
              Sentimento
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              Tendências
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sentiment" className="mt-6">
            <TicketSentiment />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    Tempo de Resposta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Média Geral</span>
                      <span className="font-bold">2.3h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Primeira Resposta</span>
                      <span className="font-bold">45min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Resolução</span>
                      <span className="font-bold">8.7h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TicketIcon className="h-5 w-5" />
                    Volume de Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Hoje</span>
                      <span className="font-bold">23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Esta Semana</span>
                      <span className="font-bold">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Este Mês</span>
                      <span className="font-bold">642</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5" />
                    Taxa de Resolução
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">No SLA</span>
                      <span className="font-bold text-green-600">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Primeira Tentativa</span>
                      <span className="font-bold text-blue-600">73%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Satisfação</span>
                      <span className="font-bold text-purple-600">4.2/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <UsersIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>Análise detalhada de usuários em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Tendências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>Análise de tendências temporais em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}