import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "@remix-run/react";
import { useCart } from "~/contexts/CartContext";
import { useUser } from "~/hooks/useUser"; // Hook pour récupérer l'utilisateur

const CompactHeader: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCompactMode, setIsCompactMode] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLAnchorElement>(null);

    const { state } = useCart();
    const { user } = useUser(); // Récupérer l'utilisateur connecté

    // Debugging: Log the user object
    console.log("Current User:", user);

    const navItems = [
        { name: "Maison", to: "/" },
        { name: "Boutique", to: "/boutique" },
        { name: "Blog", to: "/blog" },
        { name: "A-propos", to: "/a-propos" },
        { name: "Contact", to: "/contact" },
    ];

    // Fonction pour déterminer la route du dashboard selon le rôle
    const getDashboardRoute = () => {
        if (!user) return "/login";

        switch (user.role?.toLowerCase()) {
            case "admin":
                return "/admin/dashboard";
            case "vendeur":
            case "seller": // si jamais le backend renvoie seller
                return "/seller/dashboard";
            case "client":
            case "customer":
            default:
                return "/client/user";
        }
    };

    // Vérifier si on est côté client
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Fonction pour calculer si les éléments peuvent tenir horizontalement
    const checkIfCompactModeNeeded = useCallback(() => {
        if (!isClient || !headerRef.current || !navRef.current || !actionsRef.current || !logoRef.current) {
            return;
        }

        const headerWidth = headerRef.current.offsetWidth;
        const logoWidth = logoRef.current.offsetWidth;
        const navWidth = navRef.current.scrollWidth;
        const actionsWidth = actionsRef.current.offsetWidth;

        // Ajouter une marge de sécurité de 40px
        const totalNeededWidth = logoWidth + navWidth + actionsWidth + 40;
        const shouldBeCompact = totalNeededWidth > headerWidth;

        if (shouldBeCompact !== isCompactMode) {
            setIsTransitioning(true);
            setTimeout(() => {
                setIsCompactMode(shouldBeCompact);
                setIsTransitioning(false);
            }, 150);
        }
    }, [isCompactMode, isClient]);

    // Observer pour détecter les changements de taille
    useEffect(() => {
        if (!isClient) return;

        const resizeObserver = new ResizeObserver(() => {
            checkIfCompactModeNeeded();
        });

        if (headerRef.current) {
            resizeObserver.observe(headerRef.current);
        }

        // Vérification initiale
        checkIfCompactModeNeeded();

        return () => {
            resizeObserver.disconnect();
        };
    }, [checkIfCompactModeNeeded, isClient]);

    // Fermer le menu mobile lors du changement de route
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setSearchQuery('');
    }, [location.pathname]);

    // Gestion des clics en dehors du menu
    useEffect(() => {
        if (!isClient) return;

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
    }, [isMobileMenuOpen, isClient]);

    // Gestion des touches clavier
    useEffect(() => {
        if (!isClient) return;

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
    }, [isMobileMenuOpen, isClient]);

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

    // Fonction pour déterminer si on doit afficher le mode compact
    const shouldShowCompactMode = () => {
        if (!isClient) {
            // En SSR, on utilise une approche basée sur les breakpoints CSS
            return false;
        }
        return isCompactMode || (typeof window !== 'undefined' && window.innerWidth < 1024);
    };

    return (
        <header className="bg-adawi-beige-dark border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div 
                    ref={headerRef}
                    className="flex items-center justify-between h-14 relative"
                >
                    {/* Logo */}
                    <Link 
                        ref={logoRef}
                        to="/"
                        className="flex items-center flex-shrink-0 z-10"
                    >
                        <img 
                            src="/lOGO_FOND_BLANC-removebg.png" 
                            alt="Logo Adawi" 
                            className="w-32 sm:w-40 h-auto transition-all duration-300" 
                        />
                    </Link>

                    {/* Navigation Desktop */}
                    <nav 
                        ref={navRef}
                        className={`items-center space-x-4 lg:space-x-6 transition-all duration-300 ${ 
                            shouldShowCompactMode() || isTransitioning 
                                ? 'hidden opacity-0' 
                                : 'hidden lg:flex opacity-100'
                        }`}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`text-sm lg:text-lg font-medium transition-all duration-200 px-2 py-1 rounded whitespace-nowrap ${ 
                                    currentPath === item.to
                                        ? "text-black underline decoration-adawi-gold decoration-2 underline-offset-4"
                                        : "text-black hover:text-adawi-gold hover:bg-adawi-beige/50"
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions Desktop */}
                    <div 
                        ref={actionsRef}
                        className={`items-center space-x-2 lg:space-x-3 transition-all duration-300 ${ 
                            shouldShowCompactMode() || isTransitioning 
                                ? 'hidden opacity-0' 
                                : 'hidden lg:flex opacity-100'
                        }`}
                    >
                        {/* Search Bar */}
                        <form 
                            onSubmit={handleSearchSubmit} 
                            className="flex items-center bg-white rounded-full border border-adawi-gold/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Rechercher..."
                                className="w-32 lg:w-48 px-3 py-1.5 text-sm focus:outline-none focus:ring-0 border-0 bg-transparent text-black placeholder-adawi-brown-light"
                            />
                            <button
                                type="submit"
                                className="text-adawi-brown hover:text-adawi-gold transition-colors p-1.5 border-l border-adawi-gold/20 bg-adawi-beige/30 hover:bg-adawi-gold/10"
                                aria-label="Lancer la recherche"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>

                        {/* User Icon or Dashboard Button */}
                        {user ? (
                            <Link
                                to={getDashboardRoute()}
                                className="text-adawi-brown hover:text-adawi-gold transition-all duration-200 p-1.5 rounded-full hover:bg-adawi-beige/50 inline-flex items-center justify-center group"
                                aria-label="Mon espace"
                            >
                                <span className="text-sm">Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="text-adawi-brown hover:text-adawi-gold transition-all duration-200 p-1.5 rounded-full hover:bg-adawi-beige/50 inline-flex items-center justify-center group"
                                aria-label="Se connecter"
                            >
                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </Link>
                        )}

                        {/* Cart Icon */}
                        <Link
                            to="/panier"
                            className="text-adawi-brown hover:text-adawi-gold transition-all duration-200 p-1.5 rounded-full hover:bg-adawi-beige/50 relative inline-flex items-center justify-center group"
                            aria-label="Panier"
                        >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                            {state.itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-adawi-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                                    {state.itemCount > 99 ? '99+' : state.itemCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Actions Compactes - Visible en mode compact ou sur mobile */}
                    <div className={`flex items-center space-x-2 relative transition-all duration-300 ${ 
                        !isClient 
                            ? 'lg:hidden opacity-100' // Fallback SSR
                            : shouldShowCompactMode() 
                                ? 'opacity-100' 
                                : 'lg:hidden opacity-100'
                    }`}>
                        {/* Panier compact */}
                        <Link
                            to="/panier"
                            className="text-adawi-brown hover:text-adawi-gold transition-all duration-200 p-2 rounded-full hover:bg-adawi-beige/50 relative inline-flex items-center justify-center group"
                            aria-label="Panier"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                            {state.itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-adawi-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                                    {state.itemCount > 99 ? '99+' : state.itemCount}
                                </span>
                            )}
                        </Link>

                        {/* Menu Hamburger */}
                        <button
                            ref={buttonRef}
                            onClick={toggleMobileMenu}
                            className="text-adawi-brown hover:text-adawi-gold transition-all duration-200 p-2 rounded-full hover:bg-adawi-beige/50 group"
                            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                            aria-expanded={isMobileMenuOpen}
                            aria-haspopup="true"
                        >
                            <div className="w-5 h-5 flex flex-col justify-center items-center">
                                <span
                                    className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out ${ 
                                        isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                                    }`}
                                />
                                <span
                                    className={`block w-5 h-5 bg-current transition-all duration-300 ease-in-out mt-1 ${ 
                                        isMobileMenuOpen ? 'opacity-0 scale-0' : ''
                                    }`}
                                />
                                <span
                                    className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out mt-1 ${ 
                                        isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                                    }`}
                                />
                            </div>
                        </button>

                        {/* Menu Mobile Dropdown */}
                        <div
                            ref={menuRef}
                            className={`absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-adawi-gold/20 py-4 z-50 transition-all duration-300 ease-out transform origin-top-right ${ 
                                isMobileMenuOpen
                                    ? 'opacity-100 scale-100 translate-y-0'
                                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                            }`}
                            role="menu"
                            aria-orientation="vertical"
                        >
                            {/* Barre de recherche Mobile */}
                            <div className="px-4 pb-4 border-b border-adawi-gold/10 mb-4">
                                <form onSubmit={handleSearchSubmit} className="flex items-center">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            placeholder="Rechercher..."
                                            className="w-full px-4 py-3 text-sm border-2 border-adawi-gold/30 rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold/50 focus:border-adawi-gold bg-adawi-beige/30 text-adawi-brown placeholder-adawi-brown-light transition-all duration-200"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-adawi-brown hover:text-adawi-gold transition-colors p-1.5 rounded-full hover:bg-adawi-gold/10"
                                            aria-label="Rechercher"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Navigation Links */}
                            <div className="px-2 space-y-1">
                                {navItems.map((item, index) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] ${ 
                                            currentPath === item.to
                                                ? "text-adawi-brown bg-adawi-gold-light border-l-4 border-adawi-gold"
                                                : "text-adawi-brown hover:bg-adawi-beige hover:text-adawi-gold"
                                        }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        role="menuitem"
                                        style={{ 
                                            animationDelay: `${index * 50}ms`
                                        }}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-adawi-gold/10 my-4"></div>

                            {/* Actions Mobile */}
                            <div className="px-2 space-y-1">
                                <Link
                                    to={getDashboardRoute()}
                                    className="flex items-center w-full px-4 py-3 text-sm text-adawi-brown hover:bg-adawi-beige hover:text-adawi-gold rounded-xl transition-all duration-200 transform hover:scale-[1.02] group"
                                    role="menuitem"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Mon Espace
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay pour le menu mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </header>
    );
};

export default CompactHeader;
