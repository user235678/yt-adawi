import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "@remix-run/react";
import { useCart } from "~/contexts/CartContext";

const CompactHeader: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const { state } = useCart();

    const navItems = [
        { name: "Maison", to: "/" },
        { name: "Boutique", to: "/boutique" },
        { name: "Blog", to: "/blog" },
        { name: "A-propos", to: "/a-propos" },
        { name: "Contact", to: "/contact" },
    ];

    // Fermer le menu mobile lors du changement de route
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setSearchQuery('');
    }, [location.pathname]);

    // Gestion des clics en dehors du menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (
                isMobileMenuOpen &&
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(target) &&
                !buttonRef.current.contains(target)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // Gestion des touches clavier
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <header className="bg-adawi-beige-dark border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img src="/lOGO_FOND_BLANC-removebg.png" alt="Logo Adawi" className="w-40 h-35" />
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`text-lg font-medium transition-colors duration-200 px-2 py-1 rounded ${currentPath === item.to
                                    ? " text-black underline"
                                    : "text-black"
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions Desktop */}
                    <div className="hidden md:flex items-center space-x-3">
                        {/* Barre de recherche Desktop (toujours visible) */}
                        <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-md border border-gray-300 overflow-hidden">
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Rechercher..."
                                className="w-48 px-3 py-1.5 text-sm focus:outline-none focus:ring-0 border-0 bg-transparent text-black placeholder-gray-500"
                            />
                            <button
                                type="submit"
                                className="text-black hover:text-adawi-gold transition-colors p-1.5 border-l border-gray-200 bg-gray-50"
                                aria-label="Lancer la recherche"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>

                        <Link
                            to="/login"
                            className="text-black hover:text-adawi-gold transition-colors p-1.5 rounded hover:bg-adawi-beige/50 inline-flex items-center justify-center"
                            aria-label="Compte utilisateur"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </Link>

                        <Link
                            to="/checkout"
                            className="text-black hover:text-adawi-gold transition-colors p-1.5 rounded hover:bg-adawi-beige/50 relative inline-flex items-center justify-center"
                            aria-label="Panier"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                            {state.itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-adawi-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {state.itemCount > 99 ? '99+' : state.itemCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile Actions */}
                    <div className="md:hidden flex items-center space-x-2 relative">
                        {/* Bouton recherche mobile */}
                        <button
                            onClick={toggleMobileMenu}
                            className="text-black hover:text-adawi-gold transition-colors p-2 rounded hover:bg-adawi-beige/50"
                            aria-label="Rechercher"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Panier mobile */}
                         <Link
                            to="/checkout"
                            className="text-black hover:text-adawi-gold transition-colors p-1.5 rounded hover:bg-adawi-beige/50 relative inline-flex items-center justify-center"
                            aria-label="Panier"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                            {state.itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-adawi-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {state.itemCount > 99 ? '99+' : state.itemCount}
                                </span>
                            )}
                        </Link>

                        {/* Menu Hamburger */}
                        <button
                            ref={buttonRef}
                            onClick={toggleMobileMenu}
                            className="text-black hover:text-adawi-gold transition-colors p-2 rounded hover:bg-adawi-beige/50"
                            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                            aria-expanded={isMobileMenuOpen}
                            aria-haspopup="true"
                        >
                            <div className="w-4 h-4 flex flex-col justify-center items-center">
                                <span
                                    className={`block w-4 h-0.5 bg-current transition-all duration-200 ${isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''}`}
                                />
                                <span
                                    className={`block w-4 h-0.5 bg-current transition-all duration-200 mt-0.5 ${isMobileMenuOpen ? 'opacity-0' : ''}`}
                                />
                                <span
                                    className={`block w-4 h-0.5 bg-current transition-all duration-200 mt-0.5 ${isMobileMenuOpen ? '-rotate-45 -translate-y-0.5' : ''}`}
                                />
                            </div>
                        </button>

                        {/* Menu Mobile Dropdown */}
                        {isMobileMenuOpen && (
                            <div
                                ref={menuRef}
                                className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50"
                                role="menu"
                                aria-orientation="vertical"
                            >
                                {/* Barre de recherche Mobile */}
                                <div className="px-2 pb-2 border-b border-gray-200 mb-2">
                                    <form onSubmit={handleSearchSubmit} className="flex items-center">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            placeholder="Rechercher..."
                                            className="flex-1 w-14 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent bg-white text-black placeholder-gray-500"
                                        />
                                        <button
                                            type="submit"
                                            className="ml-2 text-black hover:text-adawi-gold transition-colors p-2 rounded hover:bg-adawi-beige/50"
                                            aria-label="Rechercher"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>

                                {/* Navigation Links */}
                                <div className="px-2">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className={`block px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${currentPath === item.to
                                                ? " text-black underline bg-adawi-gold-light"
                                                : "text-black hover:bg-adawi-beige hover:text-adawi-brown"
                                                }`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            role="menuitem"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-adawi-brown/10 my-2"></div>

                                {/* Actions Mobile */}
                                <div className="px-2 space-y-1">
                                    <Link
                                        to="/login"
                                        className="flex items-center w-full px-3 py-2 text-sm text-black hover:bg-adawi-beige hover:text-adawi-brown rounded transition-colors"
                                        role="menuitem"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Mon Compte
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CompactHeader;
