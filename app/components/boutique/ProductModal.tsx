import { useEffect, useState } from "react";
import type { Product } from "./ProductGrid";
import { useToast } from "~/contexts/ToastContext";
import { Link } from "react-router-dom";
import {
  User,
  ShoppingCart,
  ShoppingBag,
  MessageSquare,
  LogOut,
  X
} from "lucide-react";
// Interface pour les produits API originaux
interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  cost_price?: number;
  currency: string;
  category_id: string;
  sizes: string[];
  colors: string[];
  stock: number;
  low_stock_threshold?: number;
  images: string[];
  hover_images?: string[];
  tags: string[];
  seller_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  category?: {
    id: string;
    name: string;
    description: string;
    parent_id: string;
  };
  profit?: number;
  margin_percent?: number;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  apiProducts?: ApiProduct[]; // Nouveau prop pour les produits API originaux
}

export default function ProductModal({ product, isOpen, onClose, apiProducts = [] }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"next" | "prev" | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const { showToast } = useToast();

  // Animation d'ouverture/fermeture
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Fermer avec Échap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const getAvailableSizes = (product: Product): string[] => {
    if (product.sizes) {
      return product.sizes
        .split(',')
        .map(size => size.trim().toUpperCase())
        .filter(size => size.length > 0);
    }
    return product.size ? [product.size.toUpperCase()] : ['M'];
  };

  const getAvailableColors = (product: Product): string[] => {
    if (product.colors) {
      return product.colors
        .split(',')
        .map(color => color.trim().toLowerCase())
        .filter(color => color.length > 0);
    }
    return product.color ? [product.color.toLowerCase()] : ['noir'];
  };

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedSize(getAvailableSizes(product)[0] || 'M');
      setSelectedColor(getAvailableColors(product)[0] || 'noir');
    }
  }, [product]);

  const getProductColorStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      blanc: "bg-white border-red-600",
      noir: "bg-black border-black",
      rouge: "bg-red-500 border-red-500",
      vert: "bg-green-500 border-green-500",
      marron: "bg-amber-700 border-amber-700",
      bleu: "bg-blue-500 border-blue-500",
    };

    return colorMap[color] || "bg-gray-400 border-gray-400";
  };

  function isNewProduct(productDate: Date | string): boolean {
    const today = new Date();
    const date = new Date(productDate);
    return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) <= 15;
  }

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  // ✅ Fonction corrigée pour utiliser les cookies HTTP-only comme AddToCartModal
  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      // ✅ Trouver le produit API original pour obtenir les vraies données
      const apiProduct = apiProducts.find(p => p.id === product.id);

      // ✅ Préparer les données exactement comme AddToCartModal
      const cartData = {
        product_id: product.id, // ✅ Utiliser l'ID original (string)
        quantity: quantity,
        size: selectedSize || "",
        color: selectedColor || "",
        images: [product.image].filter(Boolean), // ✅ Simplifier les images
        price: product.priceValue,
        name: product.name
      };

      console.log('Données envoyées à l\'API:', cartData);

      // ✅ Appel à l'API avec credentials pour les cookies HTTP-only
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ Important pour les cookies HTTP-only
        body: JSON.stringify(cartData)
      });

      // ✅ Log de la réponse brute pour le débogage
      const responseText = await response.text();
      console.log('Réponse brute de l\'API:', responseText);

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('Réponse parsée de l\'API:', result);

      // Attendre un peu pour l'animation
      await new Promise(resolve => setTimeout(resolve, 300));

      showToast(`${quantity} ${product.name} ajouté(e)s au panier ✅`);

      // ✅ Déclencher un événement pour mettre à jour le compteur du panier
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: {
          total: result.total || 0,
          itemCount: result.items?.length || 0
        }
      }));

      handleClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      showToast(
        error instanceof Error
          ? `Erreur: ${error.message}`
          : 'Erreur lors de l\'ajout au panier'
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Tableau d'images
  const productImages = [
    product?.image,
    product?.hoverImage || product?.image,
    product?.image1 || product?.image,
    product?.image2 || product?.image
  ].filter(Boolean) as string[];

  const currentImage = productImages[selectedImageIndex] || '/placeholder-product.png';

  const availableSizes = product ? getAvailableSizes(product) : [];
  const availableColors = product ? getAvailableColors(product) : [];
  const allSizes = ['XXL', 'XL', 'L', 'M', 'S', 'XS'];
  const allColors = ['noir', 'blanc', 'rouge', 'vert', 'marron', 'bleu'];

  // Fonction pour changer d'image avec animation
  const changeImage = (direction: "next" | "prev") => {
    if (productImages.length <= 1) return;

    setAnimationDirection(direction);
    setTimeout(() => {
      setSelectedImageIndex((prev) =>
        direction === "next"
          ? prev === productImages.length - 1 ? 0 : prev + 1
          : prev === 0 ? productImages.length - 1 : prev - 1
      );
      setAnimationDirection(null);
    }, 200);
  };

  // Swipe mobile
  useEffect(() => {
    if (!isOpen || productImages.length <= 1) return;
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      if (Math.abs(touchEndX - touchStartX) > 50) {
        touchEndX < touchStartX ? changeImage("next") : changeImage("prev");
      }
    };

    const modal = document.getElementById("product-modal-images");
    modal?.addEventListener("touchstart", handleTouchStart);
    modal?.addEventListener("touchend", handleTouchEnd);

    return () => {
      modal?.removeEventListener("touchstart", handleTouchStart);
      modal?.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen, productImages.length]);

  // Flèches PC
  useEffect(() => {
    if (!isOpen || productImages.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") changeImage("next");
      if (e.key === "ArrowLeft") changeImage("prev");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, productImages.length]);

  if (!isOpen || !product) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'
        }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky sur mobile */}
        <div className="sticky top-0 bg-white z-30 flex justify-between items-center p-4 sm:p-6 border-b backdrop-blur-sm bg-white/95">
          <h2 className="text-xl sm:text-2xl font-bold text-black">Détails du produit</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-black transition-all duration-200 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Images - Colonne gauche */}
            <div id="product-modal-images" className="space-y-4 order-1">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                <img
                  key={selectedImageIndex}
                  src={currentImage}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-300 ease-out transform
                    ${animationDirection === "next" ? "translate-x-10 opacity-0 scale-110" : ""}
                    ${animationDirection === "prev" ? "-translate-x-10 opacity-0 scale-110" : ""}
                    group-hover:scale-105
                  `}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-product.png';
                  }}
                />

                {isNewProduct(product.date) && (
                  <span className="absolute top-3 left-3 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    NEW
                  </span>
                )}

                {/* Flèches de navigation avec animation */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() => changeImage("prev")}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-full p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => changeImage("next")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-full p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Indicateur d'images */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {productImages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedImageIndex === index ? 'bg-white scale-125' : 'bg-white/50'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Miniatures avec scroll horizontal sur mobile */}
              {productImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative min-w-[4rem] w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${selectedImageIndex === index
                          ? 'border-adawi-gold shadow-lg ring-2 ring-adawi-gold/20'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} vue ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.png';
                        }}
                      />
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-adawi-gold/10 backdrop-blur-[1px]"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Infos produit - Colonne centre */}
            <div className="space-y-6 order-2 lg:order-2">
              <div className="animate-fade-in-up">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2 font-medium">
                  {product.category?.charAt(0).toUpperCase() + product.category?.slice(1) || 'Produit'}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-4 leading-tight">{product.name}</h3>
                <p className="text-2xl sm:text-3xl font-bold text-black bg-gradient-to-r from-black to-gray-800 bg-clip-text">
                  {product.price}
                </p>
              </div>

              {/* Sélection de taille avec animation */}
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h4 className="text-sm font-semibold text-black mb-4">Taille:</h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {allSizes.map((size) => {
                    const isAvailable = availableSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`relative h-12 border-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:scale-105 active:scale-95 ${selectedSize === size && isAvailable
                            ? 'border-black bg-adawi-gold text-white shadow-lg transform scale-105'
                            : isAvailable
                              ? 'border-gray-300 text-black hover:shadow-md'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50 opacity-60'
                          }`}
                      >
                        <span className={!isAvailable ? 'line-through decoration-2 decoration-red-500' : ''}>
                          {size}
                        </span>
                        {selectedSize === size && isAvailable && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {availableSizes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-3 font-medium">
                    Disponible en: {availableSizes.join(', ')}
                  </p>
                )}
              </div>

              {/* Sélection de couleur avec animation */}
              <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h4 className="text-sm font-semibold text-black mb-4">
                  Couleur: <span className="font-normal">{selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}</span>
                </h4>
                <div className="flex gap-3 flex-wrap">
                  {allColors.map((color) => {
                    const isAvailable = availableColors.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => isAvailable && setSelectedColor(color)}
                        disabled={!isAvailable}
                        className={`relative w-12 h-12 rounded-full border-4 transition-all duration-300 hover:scale-110 active:scale-95 ${getProductColorStyle(color)
                          } ${selectedColor === color && isAvailable
                            ? 'ring-4 ring-adawi-gold ring-offset-2 shadow-lg transform scale-110'
                            : isAvailable
                              ? 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 hover:shadow-md'
                              : 'opacity-40 cursor-not-allowed'
                          }`}
                        aria-label={`Sélectionner la couleur ${color}`}
                      >
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-full h-0.5 bg-red-600 transform rotate-45 shadow-sm"></div>
                          </div>
                        )}
                        {selectedColor === color && isAvailable && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-adawi-gold rounded-full border-2 border-white shadow-sm"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {availableColors.length > 0 && (
                  <p className="text-xs text-gray-500 mt-3 font-medium">
                    Disponible en: {availableColors.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}
                  </p>
                )}
              </div>

              {/* Quantité avec animation */}
              <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h4 className="text-sm font-semibold text-black mb-4">Quantité:</h4>
                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-2 w-fit">
                  <button
                    className={`w-12 h-12 border-2 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${quantity > 1
                        ? 'border-gray-300 hover:border-black hover:bg-white text-black hover:shadow-md'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-100'
                      }`}
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    aria-label="Diminuer la quantité"
                  >
                    −
                  </button>
                  <span className="text-xl text-black font-bold min-w-[3rem] text-center bg-white px-4 py-2 rounded-lg">
                    {quantity}
                  </span>
                  <button
                    className="w-12 h-12 border-2 text-black border-gray-300 rounded-xl flex items-center justify-center text-xl font-bold hover:border-black hover:bg-white hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                    onClick={increaseQuantity}
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions et informations - Colonne droite */}
            <div className="space-y-4 order-3 lg:order-3">

              {/* Bouton d'ajout au panier */}


              {/* Sections pliables avec animations */}
              <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <details className="group bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors duration-300">
                  <summary className="flex items-center justify-between cursor-pointer py-4 px-5 text-sm font-bold text-black">
                    DESCRIPTION
                    <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-700 animate-fade-in">
                    <p className="leading-relaxed">Découvrez ce magnifique {product.name.toLowerCase()} de taille {selectedSize} et de couleur {selectedColor} de notre collection {product.category}. Confectionné avec soin et attention aux détails, ce produit allie style et confort pour un look parfait en toute occasion.</p>
                  </div>
                </details>

                <details className="group bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors duration-300">
                  <summary className="flex items-center justify-between cursor-pointer py-4 px-5 text-sm font-bold text-black">
                    POLITIQUE DE RETOUR
                    <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-700 animate-fade-in">
                    <p className="leading-relaxed">Retours gratuits sous 30 jours. Les articles doivent être dans leur état d'origine avec tous les labels et emballages. Remboursement intégral garanti.</p>
                  </div>
                </details>

                <details className="group bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors duration-300">
                  <summary className="flex items-center justify-between cursor-pointer py-4 px-5 text-sm font-bold text-black">
                    LIVRAISON
                    <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-700 animate-fade-in">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="font-medium">Retrait disponible à Kiawah - Retail Store</span>
                      </p>
                      <p className="text-xs text-gray-500 ml-4">Généralement prêt en 24 heures</p>
                      <p className="flex items-center gap-2 mt-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="font-medium">Livraison standard: 3-5 jours ouvrés</span>
                      </p>
                      <p className="text-xs text-gray-500 ml-4">Gratuite à partir de 75FCFA</p>
                    </div>
                  </div>
                </details>
                <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className={`
    w-full py-4 px-6 rounded-2xl font-bold text-lg
    transition-all duration-300 transform
    hover:scale-105 active:scale-95 flex items-center justify-center gap-2
    ${isAddingToCart
                        ? "bg-adawi-gold text-white cursor-not-allowed scale-95"
                        : "bg-gradient-to-r bg-adawi-gold text-white hover:shadow-xl hover:bg-adawi-gold"
                      }
  `}
                  >
                    {isAddingToCart ? (
                      <>
                        <svg
                          className="animate-spin h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 
             12h4zm2 5.291A7.962 7.962 0 014 
             12H0c0 3.042 1.135 5.824 3 
             7.938l3-2.647z"
                          />
                        </svg>
                        <span>AJOUT EN COURS...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>AJOUTER AU PANIER</span>
                      </>
                    )}
                  </button>

                </div>

                {/* Titre et bouton contact */}
                <div className="animate-fade-in-up text-center space-y-4" style={{ animationDelay: '500ms' }}>
                  <h3 className="text-sm font-medium text-gray-600">Vous ne trouvez pas votre taille/couleur?</h3>
                  <Link
                    to="/contact"
                    className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 bg-adawi-gold border-2 text-white  hover:text-white flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    COMMANDER SUR MESURE
                  </Link>
                </div>
                <div className="animate-fade-in-up text-center space-y-4" style={{ animationDelay: '500ms' }}>
                  <h3 className="text-sm font-medium text-gray-600">Voulez-vous prendre rendez-vous?</h3>
                  <Link
                    to="/client/appointments"
                    className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 bg-adawi-gold border-2 text-white  hover:text-white flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    PRENDRE RENDEZ-VOUS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style >{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @media (max-width: 1024px) {
          .order-1 { order: 1; }
          .order-2 { order: 2; }
          .order-3 { order: 3; }
        }
      `}</style>
    </div>
  );
}