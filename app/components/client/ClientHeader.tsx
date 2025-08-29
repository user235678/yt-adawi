import { useState } from "react";
import { Menu, Search } from "lucide-react";

interface ClientHeaderProps {
  onMenuClick: () => void;
  userName?: string;
}

export default function ClientHeader({ onMenuClick, userName = "Client" }: ClientHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-adawi-brown">
              Bonjour, {userName}
            </h1>
            <p className="text-sm text-gray-500">
              Gérez votre compte et vos commandes
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button> */}
          
          <div className="w-8 h-8 bg-gradient-to-br from-adawi-gold to-adawi-brown rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
