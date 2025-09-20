import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import NotificationDropdown from "./NotificationDropdown";
import NotificationDetailsModal from "./NotificationDetailsModal";
import { Link } from "@remix-run/react";
interface AdminHeaderProps {
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  order_id?: string;
  product_id?: string;
  ticket_id?: string;
  refund_id?: string;
  created_at: string;
  read: boolean;
  order_details?: object;
  product_details?: object;
  ticket_details?: object;
  refund_details?: object;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour le modal
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Récupérer les notifications via notre API locale
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

  // Marquer une notification comme lue via notre API locale
  const markAsRead = async (notificationId: string) => {
    try {
      console.log('Marquage de la notification comme lue:', notificationId);

      const formData = new FormData();
      formData.append('notificationId', notificationId);

      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        console.log('Notification marquée comme lue avec succès');
      } else {
        const errorData = await response.json();
        console.error('Erreur lors du marquage:', errorData);
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Fonction pour ouvrir le modal avec une notification
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

  // Charger les notifications au montage du composant
  useEffect(() => {
    fetchNotifications();

    // Actualiser les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compter les notifications non lues
  const unreadCount = notifications.filter(notif => !notif.read).length;

  const handleNotificationToggle = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen) {
      fetchNotifications(); // Actualiser quand on ouvre
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Menu button + Search */}
          <div className="flex items-center flex-1">
            {/* Menu button pour mobile */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            {/* Search Bar */}
            {/* <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-8 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none bg-gray-50"
                />
              </div>
            </div> */}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
            <Link
              to="/admin/panier"
              className="text-adawi-brown hover:text-adawi-gold transition-all duration-200 p-1.5 rounded-full hover:bg-adawi-beige/50 relative inline-flex items-center justify-center group"
              aria-label="Panier"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>

            </Link>
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleNotificationToggle}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs">
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

            {/* User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-adawi-gold rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs sm:text-sm">AP</span>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">Admin Principal</p>
                <p className="text-xs text-gray-500">admin@adawi.com</p>
              </div>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Modal des détails de notification */}
      <NotificationDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        notification={selectedNotification}
        onMarkAsRead={markAsRead}
      />
    </>
  );
}