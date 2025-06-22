import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
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
  UserCheck
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
  { name: 'Tickets', href: '/tickets', icon: TicketIcon, badge: '12' },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'SLAs', href: '/sla', icon: ClockIcon },
  { name: 'Tempo', href: '/time-tracking', icon: CheckCircleIcon },
  { name: 'Gamificação', href: '/gamification', icon: Trophy },
  { name: 'Relatórios', href: '/reports', icon: BarChart3Icon },
  { name: 'Relatórios Avançados', href: '/advanced-reports', icon: TrendingUpIcon },
  { name: 'Base Conhecimento', href: '/knowledge-base', icon: BookOpenIcon },
  { name: 'Portal Cliente', href: '/client-portal', icon: UserCheck },
];

const integrations = [
  { name: 'APIs & Webhooks', href: '/settings', icon: LinkIcon },
  { name: 'Configurações', href: '/settings', icon: SettingsIcon },
  { name: 'Config. SLA', href: '/sla-config', icon: Target },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0">
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">GeckoStream</span>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
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
        
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Integrações
          </h3>
          <div className="mt-2 space-y-1">
            {integrations.map((item) => {
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
      </nav>
    </aside>
  );
}
