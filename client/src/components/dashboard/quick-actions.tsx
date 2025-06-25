import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, FileTextIcon, UsersIcon, SettingsIcon, ClockIcon, BarChart3Icon } from "lucide-react";
import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/usePermissions";

export default function QuickActions() {
  const [, setLocation] = useLocation();
  const { hasPermission } = usePermissions();

  const actions = [
    {
      title: "Novo Ticket",
      description: "Criar um novo ticket de suporte",
      icon: PlusIcon,
      onClick: () => setLocation("/tickets/new"),
      permission: { resource: "tickets", action: "create" },
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Relatórios",
      description: "Visualizar relatórios e analytics",
      icon: BarChart3Icon,
      onClick: () => setLocation("/reports"),
      permission: { resource: "reports", action: "view" },
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Clientes",
      description: "Gerenciar clientes e empresas",
      icon: UsersIcon,
      onClick: () => setLocation("/customers"),
      permission: { resource: "customers", action: "list" },
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "SLA Config",
      description: "Configurar acordos de nível",
      icon: ClockIcon,
      onClick: () => setLocation("/sla-config"),
      permission: { resource: "sla", action: "config" },
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Knowledge Base",
      description: "Gerenciar base de conhecimento",
      icon: FileTextIcon,
      onClick: () => setLocation("/knowledge-base"),
      permission: { resource: "knowledge", action: "list" },
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "Configurações",
      description: "Configurações do sistema",
      icon: SettingsIcon,
      onClick: () => setLocation("/settings"),
      permission: { resource: "settings", action: "view" },
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ];

  const filteredActions = actions.filter(action => 
    hasPermission(action.permission.resource, action.permission.action)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 text-center hover:shadow-md transition-shadow"
                onClick={action.onClick}
              >
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
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
      </CardContent>
    </Card>
  );
}