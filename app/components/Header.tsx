import React, { useState, useEffect } from "react";
import { Link, useLocation } from "@remix-run/react";

const Header: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Maison", to: "/index" },
    { name: "Boutique", to: "/boutique" },
    { name: "Blog", to: "/blog" },
    { name: "A-propos", to: "/apropos" },
    { name: "Contact", to: "/contact" },
  ];

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Fermer le menu mobile lors du clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Empêcher le scroll du body quand le menu est ouvert
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="bg-adawi-beige-dark px-6 py-4 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/public/logo-light.png" alt="Logo Adawi" className="w-15 h-10" />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`font-medium text-black transition-colors duration-200 pb-1 ${
                  currentPath === item.to
                    ? "border-b-2 border-adawi-brown"
                    : "hover:text-adawi-gold"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Icons Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Recherche */}
            <button
              className="text-black hover:text-adawi-gold transition-transform transform hover:scale-110"
              aria-label="Rechercher"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Compte utilisateur */}
            <button
              className="text-black hover:text-adawi-gold transition-transform transform hover:scale-110"
              aria-label="Compte utilisateur"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Panier */}
            <button
              className="text-black hover:text-adawi-gold transition-transform transform hover:scale-110"
              aria-label="Panier"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Icons Mobile (réduits) */}
            <button
              className="text-black hover:text-adawi-gold transition-transform transform hover:scale-110"
              aria-label="Panier"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>

            {/* Hamburger Button */}
            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-container text-black hover:text-adawi-gold transition-colors duration-200 p-2"
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-current transition-all duration-300 mt-1 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" />

          {/* Menu Panel */}
          <div className="mobile-menu-container fixed top-0 right-0 h-full w-80 max-w-sm bg-adawi-beige-dark shadow-xl transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="px-6 py-4 border-b border-adawi-brown/20">
                <div className="flex items-center justify-between">
                  <img src="/public/logo-light.png" alt="Logo Adawi" className="w-12 h-8" />
                  <button
                    onClick={toggleMobileMenu}
                    className="text-black hover:text-adawi-gold transition-colors duration-200 p-2"
                    aria-label="Fermer le menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-6 py-6">
                <div className="space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`block py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        currentPath === item.to
                          ? "bg-adawi-brown text-white"
                          : "text-black hover:bg-adawi-beige hover:text-adawi-brown"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Mobile Icons */}
              <div className="px-6 py-4 border-t border-adawi-brown/20">
                <div className="flex items-center justify-around">
                  <button
                    className="flex flex-col items-center text-black hover:text-adawi-gold transition-colors duration-200 p-3"
                    aria-label="Rechercher"
                  >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-xs">Recherche</span>
                  </button>

                  <button
                    className="flex flex-col items-center text-black hover:text-adawi-gold transition-colors duration-200 p-3"
                    aria-label="Compte utilisateur"
                  >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs">Compte</span>
                  </button>

                  <button
                    className="flex flex-col items-center text-black hover:text-adawi-gold transition-colors duration-200 p-3"
                    aria-label="Panier"
                  >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    <span className="text-xs">Panier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
