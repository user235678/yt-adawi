import { Search, Bell, ChevronDown, Menu } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 w-full">
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
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-8 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs">
              3
            </span>
          </button>

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
  );
}
