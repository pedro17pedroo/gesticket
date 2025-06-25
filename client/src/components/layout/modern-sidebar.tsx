import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  HomeIcon, 
  TicketIcon, 
  UsersIcon, 
  SettingsIcon, 
  BarChart3Icon,
  ClockIcon,
  BookOpenIcon,
  TrophyIcon,
  BuildingIcon,
  ShieldIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  ChevronRightIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useUserType } from "@/hooks/useUserType";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions?: Array<{resource: string, action: string}>;
  badge?: string;
  children?: NavigationItem[];
}

// Navegação para usuários do sistema (proprietários)
const systemOwnerNavigation: NavigationItem[] = [
  {
    label: "Painel Multi-Organizacional",
    href: "/multi-tenant-dashboard",
    icon: BuildingIcon,
    permissions: [{ resource: "dashboard", action: "view" }]
  },
  {
    label: "Dashboard do Sistema",
    href: "/",
    icon: HomeIcon,
    permissions: [{ resource: "dashboard", action: "view" }]
  },
  {
    label: "Gestão de Clientes",
    href: "/client-management",
    icon: UsersIcon,
    permissions: [{ resource: "clients", action: "manage" }]
  },
  {
    label: "Tickets do Sistema",
    href: "/tickets",
    icon: TicketIcon,
    permissions: [{ resource: "tickets", action: "list" }],
    children: [
      {
        label: "Todos os Tickets de Clientes",
        href: "/tickets",
        icon: TicketIcon,
        permissions: [{ resource: "tickets", action: "list" }]
      },
      {
        label: "Novo Ticket",
        href: "/tickets/new",
        icon: TicketIcon,
        permissions: [{ resource: "tickets", action: "create" }]
      }
    ]
  },
  {
    label: "Clientes",
    href: "/customers",
    icon: UsersIcon,
    permissions: [{ resource: "customers", action: "list" }]
  },
  {
    label: "Organizações",
    href: "/organizations",
    icon: BuildingIcon,
    permissions: [{ resource: "organizations", action: "manage" }]
  },
  {
    label: "Tempo",
    href: "/time-tracking",
    icon: ClockIcon,
    permissions: [{ resource: "time", action: "list" }]
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart3Icon,
    permissions: [{ resource: "reports", action: "view" }]
  },
  {
    label: "Base Conhecimento",
    href: "/knowledge-base",
    icon: BookOpenIcon,
    permissions: [{ resource: "knowledge", action: "list" }]
  },
  {
    label: "Gamificação",
    href: "/gamification",
    icon: TrophyIcon,
    permissions: [{ resource: "gamification", action: "view" }]
  },
  {
    label: "Controlo Acesso",
    href: "/access-control",
    icon: ShieldIcon,
    permissions: [{ resource: "access_control", action: "manage" }]
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: SettingsIcon,
    permissions: [{ resource: "settings", action: "view" }]
  }
];

// Navegação para usuários de empresas clientes
const clientCompanyNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: HomeIcon,
    permissions: [{ resource: "dashboard", action: "view" }]
  },
  {
    label: "Tickets",
    href: "/tickets",
    icon: TicketIcon,
    permissions: [{ resource: "tickets", action: "list" }],
    children: [
      {
        label: "Meus Tickets",
        href: "/tickets",
        icon: TicketIcon,
        permissions: [{ resource: "tickets", action: "list" }]
      },
      {
        label: "Novo Ticket",
        href: "/tickets/new",
        icon: TicketIcon,
        permissions: [{ resource: "tickets", action: "create" }]
      }
    ]
  },
  {
    label: "Utilizadores",
    href: "/users",
    icon: UsersIcon,
    permissions: [{ resource: "users", action: "list" }]
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart3Icon,
    permissions: [{ resource: "reports", action: "view" }]
  },
  {
    label: "Rastreamento de Tempo",
    href: "/time-tracking",
    icon: ClockIcon,
    permissions: [{ resource: "time", action: "list" }]
  },
  {
    label: "Base de Conhecimento",
    href: "/knowledge-base",
    icon: BookOpenIcon,
    permissions: [{ resource: "knowledge", action: "list" }]
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: SettingsIcon,
    permissions: [{ resource: "settings", action: "manage" }]
  }
];

interface ModernSidebarProps {
  className?: string;
}

export default function ModernSidebar({ className }: ModernSidebarProps) {
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { user, logout } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const userType = useUserType();

  // Selecionar navegação baseada no tipo de usuário
  const navigationItems = userType.isSystemUser ? systemOwnerNavigation : clientCompanyNavigation;

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const filteredNavItems = navigationItems.filter(item => 
    !item.permissions || hasAnyPermission(item.permissions)
  );

  const NavigationLink = ({ item, isChild = false }: { item: NavigationItem; isChild?: boolean }) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);

    return (
      <div>
        <Button
          variant={active ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start",
            isChild && "ml-4 w-[calc(100%-1rem)]",
            active && "bg-primary/10 text-primary font-medium"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.href);
            } else {
              setLocation(item.href);
              setIsMobileOpen(false);
            }
          }}
        >
          <item.icon className="mr-3 h-4 w-4" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <ChevronRightIcon 
              className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          )}
        </Button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <NavigationLink key={child.href} item={child} isChild />
            ))}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TicketIcon className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">GeckoStream</span>
            <span className="truncate text-xs text-muted-foreground">
              Sistema de Tickets
            </span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="border-b p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <span className="text-sm font-medium">
              {user?.firstName?.[0] || user?.email?.[0] || "U"}
            </span>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {filteredNavItems.map((item) => (
            <NavigationLink key={item.href} item={item} />
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOutIcon className="mr-3 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
      </Button>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden h-screen w-64 border-r bg-background lg:block",
        className
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 border-r bg-background">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}