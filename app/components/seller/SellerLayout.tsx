import { useState } from "react";
import SellerSidebar from "./SellerSidebar";
import SellerHeader from "./SellerHeader";

interface SellerLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

export default function SellerLayout({ children, userName }: SellerLayoutProps) {
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

      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <div className={` 
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:flex lg:flex-shrink-0
      `}>
        <SellerSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content - Takes the remaining width */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header - Fixed at the top of the main content */}
        <div className="flex-shrink-0 z-30">
          <SellerHeader 
            onMenuClick={() => setSidebarOpen(true)}
            userName={userName}
          />
        </div>

        {/* Page content - Scrollable */}
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
