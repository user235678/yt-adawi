import { useState } from "react";
import ClientSidebar from "./ClientSidebar";
import ClientHeader from "./ClientHeader";

interface ClientLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

export default function ClientLayout({ children, userName }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed sur desktop, overlay sur mobile */}
      <div className={` 
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:flex lg:flex-shrink-0
      `}>
        <ClientSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content - Prend toute la largeur restante */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header - Fixe en haut du contenu principal */}
        <div className="flex-shrink-0 z-30">
          <ClientHeader 
            onMenuClick={() => setSidebarOpen(true)}
            userName={userName}
          />
        </div>

        {/* Contenu de la page - Scrollable */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
