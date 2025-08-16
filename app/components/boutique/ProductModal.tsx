import { useEffect, useState } from "react";
import type { Product } from "./ProductGrid";
import { useCart } from "~/contexts/CartContext";
import { useToast } from "~/contexts/ToastContext";
interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"next" | "prev" | null>(null);

  const { dispatch } = useCart();
  const { showToast } = useToast();

  

  // Fermer avec Échap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
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
  }, [isOpen, onClose]);

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
      marron: "bg-amber-700 border-amber-700"
    };
    return colorMap[color] || "bg-gray-400 border-gray-400";
  };

  function isNewProduct(productDate: Date | string): boolean {
    const today = new Date();
    const date = new Date(productDate);
    return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) <= 30;
  }

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!product) return;
    setIsAddingToCart(true);
    dispatch({
      type: 'ADD_ITEM',
      payload: { product, quantity, size: selectedSize, color: selectedColor }
    });
    setTimeout(() => {
      setIsAddingToCart(false);
      showToast(`${quantity} ${product.name} ajouté(e)s au panier ✅`);
      onClose(); // ferme la modal normalement
    }, 500);
  };

  // Tableau d'images
  const productImages = [
    product?.image,
    product?.hoverImage || product?.image,
    product?.image1 || product?.image,
    product?.image2 || product?.image
  ].filter(Boolean) as string[];

  const currentImage = productImages[selectedImageIndex];

  const availableSizes = product ? getAvailableSizes(product) : [];
  const availableColors = product ? getAvailableColors(product) : [];
  const allSizes = ['XXL', 'XL', 'L', 'M', 'S'];
  const allColors = ['noir', 'blanc', 'rouge', 'vert', 'marron'];

  // Fonction pour changer d'image avec animation
  const changeImage = (direction: "next" | "prev") => {
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
    if (!isOpen) return;
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
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") changeImage("next");
      if (e.key === "ArrowLeft") changeImage("prev");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, productImages.length]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-black">Détails du produit</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors duration-200 text-2xl font-bold w-8 h-8 flex items-center justify-center">×</button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Images */}
            <div id="product-modal-images" className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  key={selectedImageIndex}
                  src={currentImage}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-200 ease-out
                    ${animationDirection === "next" ? "translate-x-10 opacity-0" : ""}
                    ${animationDirection === "prev" ? "-translate-x-10 opacity-0" : ""}
                  `}
                />
                {isNewProduct(product.date) && (
                  <span className="absolute top-2 left-2 z-20 bg-adawi-gold-light text-red-500 text-[10px] sm:text-xs font-semibold px-2 py-1 rounded shadow-md uppercase">
                    NEW
                  </span>
                )}
              </div>

              {/* Miniatures */}
              <div className="flex gap-3 justify-center">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImageIndex === index ? 'border-adawi-gold shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img src={image} alt={`${product.name} vue ${index + 1}`} className="w-full h-full object-cover" />
                    {selectedImageIndex === index && <div className="absolute inset-0 bg-adawi-gold/10"></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Infos produit */}
            {/* ... ici tu gardes le reste de ton code inchangé pour tailles, couleurs, quantité, bouton panier, etc. */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </p>
                <h3 className="text-3xl font-bold text-black mb-4">{product.name}</h3>
                <p className="text-2xl font-bold text-black">{product.price}</p>
              </div>

              {/* Sélection de taille avec disponibilité */}
              <div>
                <h4 className="text-sm font-medium text-black mb-3">Taille:</h4>
                <div className="flex gap-2">
                  {allSizes.map((size) => {
                    const isAvailable = availableSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`relative px-4 py-2 border text-sm font-medium transition-all duration-200 ${selectedSize === size && isAvailable
                          ? 'border-black bg-black text-white'
                          : isAvailable
                            ? 'border-gray-300 text-black hover:border-gray-400'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                          }`}
                      >
                        {/* Texte de la taille */}
                        <span className={!isAvailable ? 'line-through decoration-2 decoration-black' : ''}>
                          {size}
                        </span>
                        {/* Ligne diagonale pour les tailles non disponibles */}
                        {!isAvailable && (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-full h-0.5 bg-black transform rotate-12 opacity-80"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-full h-0.5 bg-red-600 transform rotate-12"></div>
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                {availableSizes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Tailles disponibles: {availableSizes.join(', ')}
                  </p>
                )}
              </div>

              {/* Sélection de couleur avec disponibilité */}
              <div>
                <h4 className="text-sm font-medium text-black mb-3">
                  Couleur: {selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}
                </h4>
                <div className="flex gap-2">
                  {allColors.map((color) => {
                    const isAvailable = availableColors.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => isAvailable && setSelectedColor(color)}
                        disabled={!isAvailable}
                        className={`relative w-8 h-8 rounded border-2 transition-all duration-200 ${getProductColorStyle(color)
                          } ${selectedColor === color && isAvailable
                            ? 'ring-2 ring-adawi-gold ring-offset-2'
                            : isAvailable
                              ? 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        aria-label={`Sélectionner la couleur ${color}`}
                      >
                        {/* Ligne diagonale pour les couleurs non disponibles */}
                        {!isAvailable && (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-full h-0.5 bg-black transform rotate-45 opacity-90"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-full h-0.5 bg-red-600 transform rotate-45"></div>
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                {availableColors.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Couleurs disponibles: {availableColors.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}
                  </p>
                )}
              </div>

              {/* Quantité avec fonctionnalité */}
              <div className="flex items-center gap-4">
                <button
                  className={`w-10 h-10 border flex items-center justify-center text-lg font-medium transition-colors ${quantity > 1
                    ? 'border-gray-300 hover:bg-gray-50 text-black'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Diminuer la quantité"
                >
                  -
                </button>
                <span className="text-lg text-black font-medium min-w-[2rem] text-center">{quantity}</span>
                <button
                  className="w-10 h-10 border text-black border-gray-300 flex items-center justify-center text-lg font-medium hover:bg-gray-50 transition-colors"
                  onClick={increaseQuantity}
                  aria-label="Augmenter la quantité"
                >
                  +
                </button>
              </div>

              {/* Bouton d'ajout au panier mis à jour */}
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`w-full py-4 px-6 rounded-full font-medium text-lg transition-all duration-200 ${isAddingToCart
                  ? 'bg-adawi-gold text-white cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
                  }`}
              >
                {isAddingToCart ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AJOUT EN COURS...
                  </span>
                ) : (
                  'AJOUTER AU PANIER'
                )}
              </button>

              {/* Sections pliables */}
              <div className="space-y-4 pt-6 border-t">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer py-2 text-sm font-medium text-black">
                    DESCRIPTION
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="pt-2 pb-4 text-sm text-gray-700">
                    <p>Découvrez ce magnifique {product.name.toLowerCase()} de taille {selectedSize} et de couleur {selectedColor} de notre collection {product.category}. Confectionné avec soin et attention aux détails, ce produit allie style et confort.</p>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer py-2 text-sm font-medium text-black">
                    POLITIQUE DE RETOUR
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="pt-2 pb-4 text-sm text-gray-700">
                    <p>Retours gratuits sous 30 jours. Les articles doivent être dans leur état d'origine.</p>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer py-2 text-sm font-medium text-black">
                    LIVRAISON
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="pt-2 pb-4 text-sm text-gray-700">
                    <p>✓ Retrait disponible à Kiawah - Retail Store</p>
                    <p className="text-xs text-gray-500 mt-1">Généralement prêt en 24 heures</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
