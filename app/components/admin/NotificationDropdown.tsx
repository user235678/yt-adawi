import { Bell, Check, RefreshCw, Package, CreditCard, Truck, AlertCircle, MessageSquare } from "lucide-react";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  order_id?: string;
  created_at: string;
  read: boolean;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  notifications: Notification[];
  isLoading: boolean;
  error?: string | null;
  onMarkAsRead: (notificationId: string) => void;
  onRefresh: () => void;
}

export default function NotificationDropdown({ 
  isOpen, 
  notifications, 
  isLoading, 
  error,
  onMarkAsRead, 
  onRefresh 
}: NotificationDropdownProps) {
  if (!isOpen) return null;

  // Fonction pour obtenir l'icône selon le type de notification
  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'order':
      case 'commande':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'payment':
      case 'paiement':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'delivery':
      case 'livraison':
        return <Truck className="w-4 h-4 text-orange-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'alert':
      case 'alerte':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Notifications {notifications.length > 0 && `(${notifications.length})`}
        </h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-adawi-gold mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-2">Erreur de chargement</p>
            <p className="text-xs text-gray-500 mb-3">{error}</p>
            <button
              onClick={onRefresh}
              className="text-sm text-adawi-gold hover:text-adawi-brown transition-colors font-medium"
            >
              Réessayer
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucune notification</p>
            <p className="text-xs text-gray-400 mt-1">
              Vérifiez la console pour plus d'informations
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    
                    {notification.order_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Commande #{notification.order_id.slice(-8)}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Marquer comme lu"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              // Marquer toutes les notifications non lues comme lues
              notifications
                .filter(notif => !notif.read)
                .forEach(notif => onMarkAsRead(notif.id));
            }}
            className="text-sm text-adawi-gold hover:text-adawi-brown transition-colors font-medium"
          >
            Tout marquer comme lu
          </button>
        </div>
      )}
    </div>
  );
}
