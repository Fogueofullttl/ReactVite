import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToNotifications, markAsRead, markAllAsRead, type Notification } from '@/lib/notifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.id, (data) => {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative" 
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              data-testid="badge-unread-count"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
              data-testid="button-mark-all-read"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No hay notificaciones
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`p-4 cursor-pointer ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
              } ${
                notification.priority === 'high' ? 'border-l-4 border-l-red-500' : ''
              }`}
              onClick={() => handleMarkAsRead(notification.id!)}
              data-testid={`notification-${notification.id}`}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-semibold text-sm">
                    {notification.title}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {notification.message}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(notification.createdAt, { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </div>
                {notification.data?.requiresAction && (
                  <Badge variant="destructive" className="mt-2">
                    Acción Requerida
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
