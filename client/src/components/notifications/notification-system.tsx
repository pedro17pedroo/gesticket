import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BellIcon, 
  TicketIcon, 
  ClockIcon, 
  AlertTriangleIcon,
  CheckCircleIcon,
  XIcon,
  SettingsIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: string;
  type: 'ticket_assigned' | 'ticket_updated' | 'ticket_resolved' | 'sla_warning' | 'system';
  title: string;
  message: string;
  ticketId?: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  userId: string;
}

export default function NotificationSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications - in real app, these would come from API/WebSocket
  useEffect(() => {
    if (!user) return;

    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'ticket_assigned',
        title: 'Novo ticket atribuído',
        message: 'Ticket #123 foi atribuído para você: "Problema no computador"',
        ticketId: 123,
        read: false,
        priority: 'medium',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
        userId: user.id
      },
      {
        id: '2',
        type: 'sla_warning',
        title: 'Aviso de SLA',
        message: 'Ticket #456 está próximo do vencimento do SLA (2 horas restantes)',
        ticketId: 456,
        read: false,
        priority: 'high',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        userId: user.id
      },
      {
        id: '3',
        type: 'ticket_resolved',
        title: 'Ticket resolvido',
        message: 'Seu ticket #789 "Acesso ao sistema" foi resolvido',
        ticketId: 789,
        read: true,
        priority: 'low',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        userId: user.id
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [user]);

  // WebSocket for real-time notifications
  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'notification' && data.userId === user.id) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          ...data.notification,
          createdAt: new Date().toISOString(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for high priority notifications
        if (newNotification.priority === 'high' || newNotification.priority === 'critical') {
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.priority === 'critical' ? 'destructive' : 'default',
          });
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [user, toast]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ticket_assigned':
      case 'ticket_updated':
        return <TicketIcon className="h-4 w-4" />;
      case 'ticket_resolved':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'sla_warning':
        return <AlertTriangleIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs h-6 px-2"
              >
                Marcar todas como lidas
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <SettingsIcon className="h-3 w-3" />
            </Button>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                  setIsOpen(false);
                  
                  // Navigate to ticket if applicable
                  if (notification.ticketId) {
                    window.location.href = `/tickets/${notification.ticketId}`;
                  }
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={`p-1 rounded-full ${getPriorityColor(notification.priority)} text-white flex-shrink-0`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium truncate ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 opacity-50 hover:opacity-100 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {format(new Date(notification.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-700">
              Ver todas as notificações
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}