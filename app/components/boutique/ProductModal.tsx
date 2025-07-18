import { useEffect, useState } from "react";
import type { Product } from "./ProductGrid";
import { useCart } from "~/contexts/CartContext";

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

  const { dispatch } = useCart();

  // Fermer le modal avec la touche Échap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Empêcher le scroll du body quand le modal est ouvert
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset des sélections quand le produit change
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedSize(product.size || 'M');
      setSelectedColor(product.color || 'noir');
    }
  }, [product]);

  // Fonction pour obtenir la couleur CSS basée sur la couleur du produit
  const getProductColorStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      blanc: "bg-gray-100 border-gray-300",
      noir: "bg-black border-black",
      rouge: "bg-red-500 border-red-500",
      vert: "bg-green-500 border-green-500",
      marron: "bg-amber-700 border-amber-700"
    };
    return colorMap[color] || "bg-gray-400 border-gray-400";
  };

  // Fonction pour augmenter la quantité
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  // Fonction pour diminuer la quantité (minimum 1)
  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // Fonction pour ajouter au panier
  const handleAddToCart = () => {
    if (!product) return;

    setIsAddingToCart(true);

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product,
        quantity,
        size: selectedSize,
        color: selectedColor,
      }
    });

    // Animation de feedback
    setTimeout(() => {
      setIsAddingToCart(false);
      onClose(); // Fermer le modal après ajout
    }, 500);
  };

  if (!isOpen || !product) return null;

  // Créer un tableau d'images pour le carrousel avec les nouvelles images
  const productImages = [
    product.image,                // Image principale
    product.hoverImage || product.image, // Image de survol
    product.image1 || product.image,     // Nouvelle image 1
    product.image2 || product.image      // Nouvelle image 2
  ];

  const currentImage = productImages[selectedImageIndex];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header du modal */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-black">Détails du produit</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition-colors duration-200 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            aria-label="Fermer le modal"
          >
            ×
          </button>
        </div>

        {/* Contenu du modal */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section images */}
            <div className="space-y-4">
              {/* Image principale */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Carrousel de miniatures avec les 4 images */}
              <div className="flex gap-3 justify-center">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index
                        ? 'border-adawi-gold shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - vue ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay pour l'image sélectionnée */}
                    {selectedImageIndex === index && (
                      <div className="absolute inset-0 bg-adawi-gold/10"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Informations du produit */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </p>
                <h3 className="text-3xl font-bold text-black mb-4">{product.name}</h3>
                <p className="text-2xl font-bold text-black">{product.price}</p>
              </div>

              {/* Sélection de taille */}
              <div>
                <h4 className="text-sm font-medium text-black mb-3">Taille:</h4>
                <div className="flex gap-2">
                  {['XXL', 'XL', 'L', 'M', 'S'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-black hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sélection de couleur */}
              <div>
                <h4 className="text-sm font-medium text-black mb-3">
                  Couleur: {selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}
                </h4>
                <div className="flex gap-2">
                  {['noir', 'blanc', 'rouge', 'vert', 'marron'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded border-2 transition-all duration-200 ${
                        getProductColorStyle(color)
                      } ${
                        selectedColor === color 
                          ? 'ring-2 ring-adawi-gold ring-offset-2' 
                          : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
                      }`}
                      aria-label={`Sélectionner la couleur ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Quantité avec fonctionnalité */}
              <div className="flex items-center gap-4">
                <button 
                  className={`w-10 h-10 border flex items-center justify-center text-lg font-medium transition-colors ${
                    quantity > 1 
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
                className={`w-full py-4 px-6 font-medium text-lg transition-all duration-200 ${
                  isAddingToCart
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
                    <p>Découvrez ce magnifique {product.name.toLowerCase()} de notre collection {product.category}. 
                    Confectionné avec soin et attention aux détails, ce produit allie style et confort.</p>
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
