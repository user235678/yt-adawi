import { useState } from "react";
import { Outlet } from "@remix-run/react";
import AdminSidebar from "~/components/admin/AdminSidebar";
import AdminHeader from "~/components/admin/AdminHeader";
import CompactHeader from "~/components/CompactHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay pour mobile - s'affiche seulement quand la sidebar est ouverte */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      

      {/* Sidebar - Fixed sur desktop, overlay sur mobile */}
      <div className={`\n        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:flex lg:flex-shrink-0
      `}>
        <AdminSidebar onClose={closeSidebar} />
      </div>
      {/* Contenu principal - Prend toute la largeur restante */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header - Fixe en haut du contenu principal */}
        <div className="flex-shrink-0 z-30">
          <AdminHeader onMenuClick={toggleSidebar} />
        </div>

        {/* Contenu de la page - Scrollable */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
