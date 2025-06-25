import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { 
  LayoutDashboardIcon,
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  BarChart3Icon,
  BookOpenIcon,
  LinkIcon,
  SettingsIcon,
  Users,
  Trophy,
  TrendingUpIcon,
  Target,
  UserCheck,
  Shield
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  requiredPermissions?: Array<{resource: string, action: string}>;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon, requiredPermissions: [{resource: 'dashboard', action: 'read'}] },
  { name: 'Tickets', href: '/tickets', icon: TicketIcon, requiredPermissions: [{resource: 'tickets', action: 'read'}] },
  { name: 'Clientes', href: '/customers', icon: Users, requiredPermissions: [{resource: 'customers', action: 'read'}] },
  { name: 'SLAs', href: '/sla', icon: ClockIcon, requiredPermissions: [{resource: 'sla', action: 'manage'}] },
  { name: 'Tempo', href: '/time-tracking', icon: CheckCircleIcon, requiredPermissions: [{resource: 'time_entries', action: 'read'}] },
  { name: 'Gamificação', href: '/gamification', icon: Trophy },
  { name: 'Relatórios', href: '/reports', icon: BarChart3Icon, requiredPermissions: [{resource: 'reports', action: 'read'}] },
  { name: 'Analytics', href: '/analytics', icon: TrendingUpIcon, requiredPermissions: [{resource: 'analytics', action: 'read'}] },
  { name: 'Base Conhecimento', href: '/knowledge-base', icon: BookOpenIcon, requiredPermissions: [{resource: 'knowledge_articles', action: 'read'}] },
  { name: 'Portal Cliente', href: '/client-portal', icon: UserCheck },
  { name: 'Gestão Empresas', href: '/company-management', icon: Users, requiredPermissions: [{resource: 'companies', action: 'read'}] },
  { name: 'Controle de Acesso', href: '/access-control', icon: Shield, requiredPermissions: [{resource: 'users', action: 'read'}, {resource: 'roles', action: 'read'}] },
];

const integrations: NavigationItem[] = [
  { name: 'APIs & Webhooks', href: '/webhooks', icon: LinkIcon, requiredPermissions: [{resource: 'webhooks', action: 'manage'}] },
  { name: 'Configurações', href: '/settings', icon: SettingsIcon, requiredPermissions: [{resource: 'settings', action: 'read'}] },
  { name: 'Config. SLA', href: '/sla-config', icon: Target, requiredPermissions: [{resource: 'sla', action: 'manage'}] },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { hasAnyPermission, permissions } = usePermissions();
  
  // Show all navigation items for admin users, filter for others
  const filteredNavigation = navigation.filter(item => 
    !item.requiredPermissions || hasAnyPermission(item.requiredPermissions)
  );

  const filteredIntegrations = integrations.filter(item => 
    !item.requiredPermissions || hasAnyPermission(item.requiredPermissions)
  );



  return (
    <aside className="h-full w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">GeckoStream</span>
        </div>
      </div>
      
      <nav className="mt-6 px-3 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon
                    className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      isActive
                        ? "text-primary-500 dark:text-primary-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                    )}
                  />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        
        {filteredIntegrations.length > 0 && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Integrações
            </h3>
            <div className="mt-2 space-y-1">
              {filteredIntegrations.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
              
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                        isActive
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon
                        className={cn(
                          "mr-3 h-5 w-5 transition-colors",
                          isActive
                            ? "text-primary-500 dark:text-primary-400"
                            : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                        )}
                      />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
