import { Link, useLocation } from "@remix-run/react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  Box,
  Mail,
  LogOut,
  X,
  TableOfContents
} from "lucide-react";

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "users", label: "Utilisateurs", icon: Users, path: "/admin/users" },
    { id: "products", label: "Produits", icon: Package, path: "/admin/products" },
    { id: "orders", label: "Commandes", icon: ShoppingCart, path: "/admin/orders" },
    { id: "support", label: "Support", icon: MessageSquare, path: "/admin/support", badge: "2" },
    { id: "rapports", label: "Rapports", icon: BarChart3, path: "/admin/rapports" },
    { id: "categories", label: "Categories", icon: Box, path: "/admin/categories" },
    { id: "Blogs", label: "Blog", icon: TableOfContents, path: "/admin/blog" },
    { id: "refunds", label: "refunds", icon: TableOfContents, path: "/admin/refunds" },
    { id: "settings", label: "Paramètres", icon: Settings, path: "/admin/settings" },
  ];

  const handleLinkClick = () => {
    // Fermer la sidebar sur mobile après avoir cliqué sur un lien
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-full h-full bg-gray-800 text-white flex flex-col">
      {/* Header avec bouton de fermeture sur mobile */}
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <Link 
            to="/admin/dashboard" 
            className="flex items-center"
            onClick={handleLinkClick}
          >
            <div className="w-8 h-8 rounded overflow-hidden mr-3">
              <img src="/ADAWI _ LOGO FOND BLANC.jpg" alt="Logo Adawi" className="object-cover w-full h-full" />
            </div>
            <span className="text-lg font-semibold">Adawi Admin</span>
          </Link>

          {/* Bouton de fermeture visible uniquement sur mobile */}
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
                  className={`w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
                    isActive
                      ? "bg-adawi-gold text-black"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>

                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        <form method="post" action="/logout" className="w-full">
          <button
            type="submit"
            className="flex items-center space-x-3 w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="font-medium truncate">Se déconnecter</span>
          </button>
        </form>
      </div>
    </div>
  );
}
