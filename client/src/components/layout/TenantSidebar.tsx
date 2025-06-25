import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  Building2, 
  Users, 
  Ticket, 
  BarChart3, 
  Settings, 
  Shield,
  Home,
  FolderOpen,
  UserCheck,
  Clock,
  BookOpen,
  Bell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

export function TenantSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home
      }
    ];

    // Check if user is system user (super admin, system admin, or from system organization)
    const isSystemUser = user?.role === 'super_admin' || 
                        user?.role === 'system_admin' || 
                        user?.organization?.type === 'system_owner' ||
                        user?.isSuperUser ||
                        user?.email === 'mimopa7137@ofacer.com';

    // System owner navigation
    if (isSystemUser) {
      return [
        ...baseItems,
        {
          title: 'Dashboard Sistema',
          href: '/system-dashboard',
          icon: Building2,
          requiredRoles: ['super_admin', 'system_admin']
        },
        {
          title: 'Multi-Tenant',
          href: '/multi-tenant-dashboard',
          icon: Building2,
          requiredRoles: ['super_admin', 'system_admin']
        },
        {
          title: 'Organizações',
          href: '/organizations',
          icon: Building2,
          requiredRoles: ['super_admin', 'system_admin']
        },
        {
          title: 'Gestão Tickets Clientes',
          href: '/client-tickets-management',
          icon: Ticket,
          requiredRoles: ['super_admin', 'system_admin', 'system_agent']
        },
        {
          title: 'Tickets de Clientes',
          href: '/client-tickets-management',
          icon: Ticket,
          requiredRoles: ['super_admin', 'system_admin']
        },
        {
          title: 'Utilizadores',
          href: '/users',
          icon: Users,
          requiredRoles: ['super_admin', 'system_admin']
        },
        {
          title: 'Relatórios Globais',
          href: '/reports',
          icon: BarChart3,
          requiredRoles: ['super_admin', 'system_admin']
        },
        {
          title: 'Controlo Acesso',
          href: '/access-control',
          icon: Shield,
          requiredRoles: ['super_admin', 'system_admin']
        }
      ];
    }

    // Default fallback navigation - should show system features for super admin
    // Using fallback navigation for super admin users
    
    return [
      ...baseItems,
      {
        title: 'Dashboard Sistema',
        href: '/system-dashboard',
        icon: Building2
      },
      {
        title: 'Tickets de Clientes',
        href: '/client-tickets-management',
        icon: Ticket
      },
      {
        title: 'Multi-Tenant',
        href: '/multi-tenant-dashboard',
        icon: Building2
      },
      {
        title: 'Organizações',
        href: '/organizations',
        icon: Building2
      },
      {
        title: 'Todos os Tickets',
        href: '/tickets',
        icon: Ticket
      },
      {
        title: 'Controlo Acesso',
        href: '/access-control',
        icon: Shield
      },
      {
        title: 'Configurações',
        href: '/settings',
        icon: Settings
      }
    ];
  };

  const hasAccess = (item: NavItem): boolean => {
    if (!item.requiredRoles && !item.requiredPermissions) {
      return true;
    }

    if (user?.isSuperUser) {
      return true;
    }

    if (item.requiredRoles && user?.role) {
      return item.requiredRoles.includes(user.role);
    }

    // TODO: Add permission checking when implemented
    return true;
  };

  const navItems = getNavItems().filter(hasAccess);

  const getRoleColor = (role?: string) => {
    const colors = {
      'super_admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'system_admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'system_agent': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'company_admin': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'company_manager': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'company_agent': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'company_user': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* User Info */}
      <div className="p-4 border-b">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.organization?.name}
              </p>
            </div>
          </div>
          <Badge className={getRoleColor(user?.role)} variant="secondary">
            {user?.role?.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Organization Info */}
      <div className="p-4 border-t">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {user?.organization?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.department?.name}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={user?.organization?.type === 'system_owner' ? 'border-red-200' : 'border-blue-200'}
          >
            {user?.organization?.type === 'system_owner' ? 'Sistema' : 'Cliente'}
          </Badge>
        </div>
      </div>
    </div>
  );
}