import { Link, useLocation } from "@remix-run/react";
//icones pour disponibilités
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  LogOut,
  X,
  Store,
  ArrowLeft,
  FileText,
  RotateCcw,
  Clock10,
  CalendarCheck
} from "lucide-react";

interface SellerSidebarProps {
  onClose?: () => void;
}

export default function SellerSidebar({ onClose }: SellerSidebarProps) {
  const location = useLocation();
  //ajout de seller/availaibility
  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/seller/dashboard" },
    { id: "produits", label: "Produits", icon: Package, path: "/seller/products" },
    { id: "orders", label: "Commandes", icon: ShoppingCart, path: "/seller/orders" },
    { id: "Tickets", label: "Tickets ", icon: MessageSquare, path: "/seller/support" },
    { id: "remboursements", label: "Remboursements", icon: RotateCcw, path: "/seller/refund" },
    { id: "blog", label: "Blog", icon: FileText, path: "/seller/blog" },
    { id: "appointments", label: "Rendez-vous", icon: Clock10, path: "/seller/appointments" },
    { id: "availability", label: "Disponibilités", icon: CalendarCheck, path: "/seller/availability" },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose(); // ferme le menu mobile après clic
  };

  return (
    <div className="h-full w-64 bg-gray-800 text-white flex flex-col">
      {/* Header avec logo et bouton fermer */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <Link
            to="/seller/dashboard"
            className="flex items-center"
            onClick={handleLinkClick}
          >
            <div className="w-8 h-8 rounded overflow-hidden mr-3">
              <img
                src="/ADAWI _ LOGO FOND BLANC.jpg"
                alt="Logo Adawi"
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-lg font-semibold">Adawi Vendeur</span>
          </Link>

          {/* Close uniquement sur mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Retour boutique */}
      <div className="p-4 border-b border-gray-700">
        <Link
          to="/boutique"
          onClick={onClose}
          className="flex items-center space-x-3 w-full px-3 py-3 text-adawi-brown bg-gray-900 hover:bg-gray-700 rounded-xl transition-all duration-200 group border border-adawi-gold/20 hover:border-adawi-gold/40"
        >
          <ArrowLeft className="w-5 h-5 flex-shrink-0 group-hover:text-adawi-gold" />
          <span className="font-medium truncate">Retour à la boutique</span>
          <Store className="w-4 h-4 ml-auto text-adawi-gold opacity-70 group-hover:opacity-100" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 sm:py-6">
        <ul className="space-y-1 sm:space-y-2 px-3 sm:px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
                    isActive
                      ? "bg-adawi-gold text-black font-semibold"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Déconnexion */}
      <div className="p-4 border-t border-gray-700">
        <form method="post" action="/logout" className="w-full">
          <button
            type="submit"
            className="flex items-center space-x-3 w-full px-3 py-3 text-red-500 hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-medium truncate">Se déconnecter</span>
          </button>
        </form>
      </div>
    </div>
  );
}
