import { Link, useLocation } from "@remix-run/react";
import {
  User,
  ShoppingBag,
  MessageSquare,
  Clock,
  LogOut,
  X,
  ListCheck,
  Clock1,
  TruckElectric,
  TicketX,
  Ban,
  Store,
  ArrowLeft
} from "lucide-react";

interface ClientSidebarProps {
  onClose?: () => void;
}

export default function ClientSidebar({ onClose }: ClientSidebarProps) {
  const location = useLocation();

  const navigation = [
    {
      name: "Profil",
      href: "/client/user",
      icon: User,
    },
    {
      name: "Mes Commandes",
      href: "/client/orders",
      icon: ShoppingBag,
    },
    {
      name: "Tickets",
      href: "/client/tickets",
      icon: MessageSquare,
    },
    {
      name: "Remboursements",
      href: "/client/refund",
      icon: TicketX,
    },
    {
      name: "Suivie",
      href: "/client/tracking",
      icon: TruckElectric,
    },
    {
      name: "Rendez-vous",
      href: "/client/appointments",
      icon: Clock1,
    },
    {
      name: "Mes Rendez-vous",
      href: "/client/list",
      icon: ListCheck,
    },
    {
      name: "Crénaux",
      href: "/client/booking",
      icon: Clock,
      icon1: Ban,
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-adawi-gold to-adawi-brown rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-adawi-brown truncate">Mon Espace</h2>
            <p className="text-xs text-gray-500 truncate">Client Dashboard</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Retour à la boutique */}
      <div className="p-4 border-b border-gray-200">
        <Link
          to="/boutique"
          onClick={onClose}
          className="flex items-center space-x-3 w-full px-3 py-3 text-adawi-brown hover:bg-adawi-beige rounded-xl transition-all duration-200 group border border-adawi-gold/20 hover:border-adawi-gold/40"
        >
          <ArrowLeft className="w-5 h-5 transition-colors flex-shrink-0 group-hover:text-adawi-gold" />
          <span className="font-medium truncate">Retour à la boutique</span>
          <Store className="w-4 h-4 ml-auto text-adawi-gold opacity-70 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const Icon1 = item.icon1;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group w-full ${
                active
                  ? "bg-gradient-to-r from-adawi-gold/10 to-adawi-brown/10 text-adawi-brown border-l-4 border-adawi-gold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-adawi-brown"
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors flex-shrink-0 ${
                active ? "text-adawi-gold" : "group-hover:text-adawi-gold"
              }`} />
              <span className="font-medium truncate">{item.name}</span>
              {item.name === "Crénaux" && (
                <span className="ml-auto">
                  <Icon1 className="w-5 h-5 text-red-500" title="Non disponible pour le moment" />        
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
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
