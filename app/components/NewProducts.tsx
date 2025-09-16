import React, { useState, useEffect, useRef } from "react";
import { Link } from "@remix-run/react";

interface Product {
  id: number;
  name: string;
  image: string;
  price?: string;
  originalPrice?: string;
  isNew?: boolean;
  badge?: string;
}

const NewProducts: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  const products: Product[] = [
    { id: 1, name: "_BLM0581", image: "/01/_BLM0581.png",  isNew: true, badge: "Nouveau" },
    { id: 2, name: "_BLM0647", image: "/01/_BLM0647.png",  },
    { id: 3, name: "_BLM0593", image: "/01/_BLM0593.png",  isNew: true },
    { id: 4, name: "_BLM0517", image: "/02/_BLM0517.jpg",  originalPrice: "279FCFA" },
    { id: 5, name: "IMG_8545", image: "/03/IMG_8545.jpg",  badge: "Best" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = (productId: number) => {
    setImagesLoaded(prev => new Set(prev).add(productId));
  };

  return (
    <section ref={sectionRef} className="bg-gradient-to-br from-gray-50 to-gray-100 px-3 sm:px-4 md:px-6 py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header avec animation */}
        <div className={`flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 gap-4 sm:gap-6 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}>
          
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-2 relative">
              <span className="relative inline-block">
                Nouveautés
                {/* Ligne dorée décorative */}
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-adawi-gold via-adawi-gold/60 to-transparent rounded-full transform origin-left scale-x-0 animate-expand-line"></div>
              </span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Découvrez notre sélection exclusive</p>
          </div>
          
          <div className={`transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`} style={{ transitionDelay: '300ms' }}>
            <Link 
              to="/boutique" 
              className="group relative inline-flex items-center border-2 border-adawi-gold/90 text-black px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full hover:bg-adawi-gold hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base font-medium overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Voir tous
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              
              {/* Effet de remplissage au survol */}
              <div className="absolute inset-0 bg-adawi-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
          </div>
        </div>

        {/* Grille de produits responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`group cursor-pointer transition-all duration-700 ease-out ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${400 + index * 150}ms` }}
            >
              {/* Card container avec effet de profondeur */}
              <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
                
                {/* Image container avec overlay et badges */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  
                  {/* Image avec effet de zoom */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                      imagesLoaded.has(product.id) ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => handleImageLoad(product.id)}
                    loading="lazy"
                  />
                  
                  {/* Placeholder pendant le chargement */}
                  {!imagesLoaded.has(product.id) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-adawi-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  {/* Overlay gradient au survol */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badge en haut à gauche */}
                  {product.badge && (
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                      <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-bold text-white shadow-lg ${
                        product.badge === 'Nouveau' || product.badge === 'Best'
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}>
                        {product.badge}
                      </span>
                    </div>
                  )}
                  
                  {/* Indicateur "Nouveau" */}
                  {product.isNew && !product.badge && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-adawi-gold rounded-full animate-pulse shadow-lg"></div>
                    </div>
                  )}
                  
                  {/* Bouton d'action au survol */}
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <button className="w-full bg-white/90 backdrop-blur-sm text-black py-2 px-3 rounded-lg font-medium text-xs sm:text-sm hover:bg-white transition-colors duration-200">
                      Voir détails
                    </button>
                  </div>
                </div>

                {/* Informations produit */}
                <div className="p-3 sm:p-4 space-y-2">
                  {/* Nom du produit */}
                  <h3 className="text-adawi-brown font-semibold text-sm sm:text-base lg:text-lg line-clamp-2 group-hover:text-adawi-gold transition-colors duration-300">
                    {product.name || "Produit Premium"}
                  </h3>
                  
                  {/* Prix avec animation */}
                  {product.price && (
                    <div className="flex items-center space-x-2">
                      <span className="text-black font-bold text-sm sm:text-base lg:text-lg">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-gray-500 line-through text-xs sm:text-sm">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Indicateur de disponibilité */}
                  {/* <div className="flex items-center text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    En stock
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section CTA supplémentaire */}
        {/* <div className={`text-center mt-8 sm:mt-12 lg:mt-16 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '1200ms' }}>
          <div className="inline-flex items-center space-x-4 text-gray-600 text-sm sm:text-base">
            <div className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-adawi-gold mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Livraison gratuite dès 100FCFA
            </div>
            <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-adawi-gold mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Retours gratuits 30 jours
            </div>
          </div>
        </div> */}
      </div>

      {/* Éléments décoratifs d'arrière-plan */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-adawi-gold/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-adawi-gold/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* CSS intégré pour les animations personnalisées */}
      <style >{`
        @keyframes expandLine {
          to {
            transform: scaleX(1);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-expand-line {
          animation: expandLine 1s ease-out 0.5s forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Troncature de texte */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Effets de survol pour les appareils tactiles */
        @media (hover: none) {
          .group:active .group-hover\\:scale-110 {
            transform: scale(1.05);
          }
          
          .group:active .group-hover\\:opacity-100 {
            opacity: 1;
          }
        }

        /* Optimisations pour très petits écrans */
        @media (max-width: 400px) {
          .grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
        }

        /* Améliorations pour tablettes */
        @media (min-width: 768px) and (max-width: 1023px) {
          .grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
        }

        /* Effets pour les grandes écrans */
        @media (min-width: 1280px) {
          .product-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .product-card:hover {
            transform: translateY(-12px) scale(1.02);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
        }

        /* Accessibilité - réduction des animations */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          .group:hover img {
            transform: none;
          }
        }

        /* Mode sombre */
        @media (prefers-color-scheme: dark) {
          .bg-white {
            background-color: #1f2937;
          }
          
          .text-black {
            color: #f9fafb;
          }
          
          .text-adawi-brown {
            color: #d1d5db;
          }
        }

        /* Effets de performance */
        .product-image {
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Animation de chargement personnalisée */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default NewProducts;