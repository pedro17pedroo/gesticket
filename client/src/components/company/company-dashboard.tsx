import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Building2, Users, Clock, BarChart3, Settings, Plus } from "lucide-react";
import ConsistentCard from "@/components/common/consistent-card";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocation } from "wouter";

interface CompanyStats {
  totalUsers: number;
  activeTickets: number;
  slaCompliance: number;
  hourBankUsage: number;
  monthlyTickets: number;
}

interface CompanyDashboardProps {
  companyId: number;
  companyName: string;
  stats?: CompanyStats;
}

export default function CompanyDashboard({ 
  companyId, 
  companyName, 
  stats 
}: CompanyDashboardProps) {
  const { hasPermission } = usePermissions();
  const [, setLocation] = useLocation();

  const defaultStats: CompanyStats = {
    totalUsers: 0,
    activeTickets: 0,
    slaCompliance: 0,
    hourBankUsage: 0,
    monthlyTickets: 0
  };

  const data = stats || defaultStats;

  const quickActions = [
    {
      title: "Usuários",
      description: "Gerenciar usuários da empresa",
      icon: Users,
      permission: { resource: "users", action: "list" },
      onClick: () => setLocation(`/companies/${companyId}/users`)
    },
    {
      title: "Tickets",
      description: "Ver tickets da empresa",
      icon: BarChart3,
      permission: { resource: "tickets", action: "list" },
      onClick: () => setLocation(`/tickets?company=${companyId}`)
    },
    {
      title: "Configurações",
      description: "Configurações da empresa",
      icon: Settings,
      permission: { resource: "companies", action: "update" },
      onClick: () => setLocation(`/companies/${companyId}/settings`)
    },
    {
      title: "Novo Usuário",
      description: "Adicionar novo usuário",
      icon: Plus,
      permission: { resource: "users", action: "create" },
      onClick: () => setLocation(`/companies/${companyId}/users/new`)
    }
  ];

  const filteredActions = quickActions.filter(action => 
    hasPermission(action.permission.resource, action.permission.action)
  );

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <ConsistentCard
        title={companyName}
        description="Painel de controle da empresa"
        variant="elevated"
        headerActions={
          hasPermission('companies', 'update') && (
            <Button 
              variant="outline" 
              onClick={() => setLocation(`/companies/${companyId}/edit`)}
            >
              Editar Empresa
            </Button>
          )
        }
      >
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Building2 className="h-4 w-4" />
          <span>ID: {companyId}</span>
        </div>
      </ConsistentCard>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total de usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Ativos</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeTickets}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tickets em aberto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.slaCompliance}%</div>
            <Progress value={data.slaCompliance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banco de Horas</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.hourBankUsage}%</div>
            <Progress value={data.hourBankUsage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <ConsistentCard title="Ações Rápidas">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 text-center"
                onClick={action.onClick}
              >
                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ConsistentCard>
    </div>
  );
}