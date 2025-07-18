import React from "react";
import { Link } from "@remix-run/react";
import { useState } from "react";

// Types d'attributs pour les produits
export type ProductSize = "xxl" | "xl" | "l" | "m" | "s" | "xs" | "unique";
export type ProductColor = "blanc" | "noir" | "rouge" | "vert" | "marron";
export type ProductCategory = "vedette" | "nouveaute" | "homme" | "femme" | "enfant" | "montre";

// Interface complète pour un produit avec attributs
export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  hoverImage?: string; // Image qui apparaît au survol
  image1?: string;     // Nouvelle image supplémentaire 1
  image2?: string;     // Nouvelle image supplémentaire 2
  priceValue: number;
  date: Date;
  category: ProductCategory;
  size: ProductSize;
  color: ProductColor;
}

interface ProductGridProps {
  products: Product[];
  selectedSize?: ProductSize;
  selectedColor?: ProductColor;
  onProductClick?: (product: Product) => void; // Fonction pour gérer le clic
}

const ProductGrid = ({ products, selectedSize, selectedColor, onProductClick }: ProductGridProps) => {
  // Fonction pour obtenir la couleur de fond basée sur la couleur du produit
  const getColorBadgeStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      blanc: "bg-gray-100 text-gray-800",
      noir: "bg-gray-900 text-white",
      rouge: "bg-red-500 text-white",
      vert: "bg-green-500 text-white",
      marron: "bg-amber-700 text-white"
    };
    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  // Filtrer les produits selon la taille et la couleur sélectionnées
  const filteredProducts = products.filter(product => {
    // Si aucun filtre n'est sélectionné, afficher tous les produits
    const sizeMatch = !selectedSize || product.size === selectedSize;
    const colorMatch = !selectedColor || product.color === selectedColor;

    return sizeMatch && colorMatch;
  });

  // CSS personnalisé pour les styles complexes
  const customStyles = `
    .product-grid-custom {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(2, 1fr);
    }

    .product-card-custom {
      transition: all 0.3s ease;
    }

    .product-card-custom:hover {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .product-image-hover-custom {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-card-custom:hover .product-image-main-custom {
      opacity: 0;
    }

    .product-card-custom:hover .product-image-hover-custom {
      opacity: 1;
    }

    @media (min-width: 640px) {
      .product-grid-custom {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
    }

    @media (min-width: 768px) {
      .product-grid-custom {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.25rem;
      }
    }

    @media (min-width: 1024px) {
      .product-grid-custom {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    @media (min-width: 1280px) {
      .product-grid-custom {
        grid-template-columns: repeat(5, 1fr);
      }
    }

    @media (max-width: 480px) {
      .product-grid-custom {
        gap: 0.5rem;
      }
    }
  `;

  // Si aucun produit ne correspond aux filtres
  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg shadow-sm">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-medium text-adawi-brown mb-2">Aucun produit trouvé</h3>
        <p className="text-gray-600 text-center max-w-md">
          Aucun produit ne correspond à votre sélection. Veuillez modifier vos filtres ou essayer une autre catégorie.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Styles CSS personnalisés */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      <div className="product-grid-custom">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onProductClick?.(product)}
            className="product-card-custom group flex flex-col bg-white overflow-hidden cursor-pointer rounded-lg"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onProductClick?.(product);
              }
            }}
            aria-label={`Voir les détails de ${product.name}`}
          >
            {/* Image du produit avec effet de survol */}
            <div className="relative w-full overflow-hidden mx-1 my-1.5 sm:mx-3 sm:my-2 xl:mx-2 xl:my-3 rounded-lg bg-gray-100">
              {/* LIGNES EN HAUT - masquées sur mobile */}
              <div className="hidden sm:flex absolute top-2 left-1/2 transform -translate-x-1/2 space-x-2 z-10">
                <span className="w-6 h-0.5 bg-gray-300 rounded-full"></span>
                <span className="w-6 h-0.5 bg-gray-300 rounded-full"></span>
                <span className="w-6 h-0.5 bg-gray-300 rounded-full"></span>
              </div>

              {/* Conteneur d'image avec aspect ratio fixe */}
              <div className="w-full aspect-square sm:aspect-[4/5] md:aspect-[3/4]">
                {/* IMAGE PRINCIPALE */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image-main-custom w-full h-full object-contain sm:object-cover transition-opacity duration-300 p-2 sm:p-0"
                />

                {/* IMAGE DE SURVOL */}
                {product.hoverImage && (
                  <img
                    src={product.hoverImage}
                    alt={`${product.name} - vue alternative`}
                    className="product-image-hover-custom absolute inset-0 w-full h-full object-contain sm:object-cover p-2 sm:p-0"
                  />
                )}
              </div>
            </div>

            {/* Informations du produit - optimisées pour mobile */}
            <div className="px-2 pb-3 sm:px-4 sm:pb-4 flex-1 flex flex-col items-center text-center">
              <h3 className="text-xs sm:text-sm font-medium text-black mb-1 transition-colors duration-300 line-clamp-2 leading-tight">
                {product.name}
              </h3>
              <p className="text-sm sm:text-base font-bold text-black">
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProductGrid;
