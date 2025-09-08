import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from '~/components/admin/NotificationDropdown';
import NotificationDetailsModal from '~/components/admin/NotificationDetailsModal';

// Interface pour les notifications
interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  order_id?: string;
  created_at: string;
  read: boolean;
}

interface SellerHeaderProps {
  onMenuClick: () => void;
  userName?: string;
}

const SellerHeader: React.FC<SellerHeaderProps> = ({ onMenuClick, userName }) => {
  // États pour les notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Récupération des notifications via API locale...');

      // Demander plus de notifications (limite à 100)
      const response = await fetch('/api/notifications?limit=100&offset=0');

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API locale:', errorData);
        setError(errorData.error || `Erreur ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log('Données reçues:', data);
      console.log('Nombre de notifications:', data.length);
      console.log('Première notification:', data[0]);
      console.log('Dernière notification:', data[data.length - 1]);

      setNotifications(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      console.log('✅ Marquage notification comme lue:', notificationId);

      // Utiliser la route existante avec FormData
      const formData = new FormData();
      formData.append('notificationId', notificationId);

      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Notification marquée comme lue:', result);

        // Mettre à jour l'état local
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur marquage notification:', errorData);

        // Mettre à jour localement même si l'API échoue
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error("❌ Erreur lors du marquage de la notification:", error);

      // Mettre à jour localement même si l'API échoue
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, read: true }
            : notif
        )
      );
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    setIsNotificationOpen(false); // Fermer le dropdown
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchNotifications();

    // Actualiser les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compter les notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 w-full">
        <div className="flex items-center justify-between">
          <button onClick={onMenuClick} className="p-2 text-gray-500 hover:text-gray-700">
            {/* Menu Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold">{userName}</div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationOpen}
                notifications={notifications}
                isLoading={isLoading}
                error={error}
                onMarkAsRead={markAsRead}
                onRefresh={fetchNotifications}
                onNotificationClick={handleNotificationClick}
                onClose={() => setIsNotificationOpen(false)}
              />
            </div>
          </div>
        </div>
      </header>

      <NotificationDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        notification={selectedNotification}
        onMarkAsRead={markAsRead}
      />
    </>
  );
};

export default SellerHeader;
