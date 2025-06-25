import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  TicketIcon, 
  Users, 
  Settings, 
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  BarChart3,
  UserPlus,
  MessageSquare,
  Archive
} from 'lucide-react';
import { useLocation } from 'wouter';

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'create' | 'search' | 'tools';
  shortcut?: string;
}

interface SearchResult {
  id: string;
  type: 'ticket' | 'customer' | 'user';
  title: string;
  subtitle?: string;
  url: string;
}

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();

  // Search functionality
  const { data: searchResults = [] } = useQuery<SearchResult[]>({
    queryKey: ['/api/search', searchQuery],
    enabled: searchQuery.length > 2,
    staleTime: 30000, // 30 seconds
  });

  const quickActions: QuickAction[] = [
    // Navigation
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Ver painel principal',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => setLocation('/'),
      category: 'navigation',
      shortcut: 'Ctrl+D'
    },
    {
      id: 'tickets',
      label: 'Tickets',
      description: 'Listar todos os tickets',
      icon: <TicketIcon className="h-4 w-4" />,
      action: () => setLocation('/tickets'),
      category: 'navigation',
      shortcut: 'Ctrl+T'
    },
    {
      id: 'customers',
      label: 'Clientes',
      description: 'Gerir clientes',
      icon: <Users className="h-4 w-4" />,
      action: () => setLocation('/customers'),
      category: 'navigation',
      shortcut: 'Ctrl+U'
    },
    {
      id: 'time-tracking',
      label: 'Gestão de Tempo',
      description: 'Rastrear tempo trabalhado',
      icon: <Clock className="h-4 w-4" />,
      action: () => setLocation('/time-tracking'),
      category: 'navigation'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      description: 'Ver relatórios e análises',
      icon: <FileText className="h-4 w-4" />,
      action: () => setLocation('/reports'),
      category: 'navigation'
    },

    // Create Actions
    {
      id: 'new-ticket',
      label: 'Novo Ticket',
      description: 'Criar pedido de suporte',
      icon: <Plus className="h-4 w-4" />,
      action: () => setLocation('/tickets/new'),
      category: 'create',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'new-customer',
      label: 'Novo Cliente',
      description: 'Registar novo cliente',
      icon: <UserPlus className="h-4 w-4" />,
      action: () => setLocation('/customers/new'),
      category: 'create'
    },
    {
      id: 'new-comment',
      label: 'Adicionar Comentário',
      description: 'Comentar num ticket',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => {
        // Logic to show comment modal or go to recent ticket
        setLocation('/tickets');
      },
      category: 'create'
    },

    // Tools
    {
      id: 'urgent-tickets',
      label: 'Tickets Urgentes',
      description: 'Ver tickets críticos e de alta prioridade',
      icon: <AlertTriangle className="h-4 w-4" />,
      action: () => setLocation('/tickets?priority=critical,high'),
      category: 'tools'
    },
    {
      id: 'my-tickets',
      label: 'Meus Tickets',
      description: 'Tickets atribuídos a mim',
      icon: <Archive className="h-4 w-4" />,
      action: () => setLocation('/tickets?assigned=me'),
      category: 'tools'
    },
    {
      id: 'calendar',
      label: 'Calendário',
      description: 'Ver agenda e prazos',
      icon: <Calendar className="h-4 w-4" />,
      action: () => setLocation('/calendar'),
      category: 'tools'
    },
    {
      id: 'settings',
      label: 'Configurações',
      description: 'Configurar sistema',
      icon: <Settings className="h-4 w-4" />,
      action: () => setLocation('/settings'),
      category: 'tools'
    }
  ];

  const categories = {
    navigation: 'Navegação',
    create: 'Criar',
    search: 'Resultados da Pesquisa',
    tools: 'Ferramentas'
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      // Handle specific shortcuts when dialog is closed
      if (!open) {
        const action = quickActions.find(action => {
          if (!action.shortcut) return false;
          const keys = action.shortcut.toLowerCase().split('+');
          const hasCtrl = keys.includes('ctrl') && (e.metaKey || e.ctrlKey);
          const hasKey = keys.includes(e.key.toLowerCase());
          return hasCtrl && hasKey;
        });

        if (action) {
          e.preventDefault();
          action.action();
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, quickActions]);

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
    setSearchQuery('');
  };

  const filteredActions = quickActions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Pesquisar...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Digite um comando ou pesquise..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          {/* Search Results */}
          {searchQuery.length > 2 && searchResults.length > 0 && (
            <CommandGroup heading={categories.search}>
              {searchResults.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleAction(() => setLocation(result.url))}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {result.type === 'ticket' && <TicketIcon className="h-4 w-4" />}
                    {result.type === 'customer' && <Users className="h-4 w-4" />}
                    {result.type === 'user' && <Users className="h-4 w-4" />}
                    <div>
                      <div className="font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-gray-500">{result.subtitle}</div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {result.type}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Quick Actions by Category */}
          {Object.entries(categories)
            .filter(([key]) => key !== 'search')
            .map(([key, label]) => {
              const categoryActions = filteredActions.filter(action => action.category === key);
              if (categoryActions.length === 0) return null;

              return (
                <CommandGroup key={key} heading={label}>
                  {categoryActions.map((action) => (
                    <CommandItem
                      key={action.id}
                      onSelect={() => handleAction(action.action)}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {action.icon}
                        <div>
                          <div className="font-medium">{action.label}</div>
                          {action.description && (
                            <div className="text-sm text-gray-500">{action.description}</div>
                          )}
                        </div>
                      </div>
                      {action.shortcut && (
                        <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 flex">
                          {action.shortcut}
                        </kbd>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
        </CommandList>
      </CommandDialog>
    </>
  );
}