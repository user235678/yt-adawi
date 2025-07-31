import { useState } from "react";
import SidebarFilters from "./SidebarFilters";
import { X, SlidersHorizontal } from "lucide-react";

export default function ResponsiveSidebarWrapper(props: SidebarFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Bouton pour mobile */}
      <div className="md:hidden flex justify-end mb-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="bg-adawi-gold text-white px-4 py-2 rounded-full flex items-center gap-2"
        >
          <SlidersHorizontal size={18} /> Filtres
        </button>
      </div>

      {/* Sidebar visible sur desktop */}
      <div className="hidden md:block w-full md:w-64">
        <SidebarFilters {...props} />
      </div>

      {/* Sidebar drawer mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end md:hidden">
          <div className="bg-white w-80 h-full p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filtres</h2>
              <button onClick={() => setIsMobileOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <SidebarFilters {...props} />
          </div>
        </div>
      )}
    </>
  );
}
