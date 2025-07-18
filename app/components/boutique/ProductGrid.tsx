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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          onClick={() => onProductClick?.(product)}
          className="group cursor-pointer flex flex-col bg-white overflow-hidden hover:shadow-lg transition-all duration-300"
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
          {/* Image du produit avec effet de survol*/}

          <div className="relative w-full h-48 sm:h-52 md:h-56 overflow-hidden mx-2 my-3 group">
            {/* LIGNES EN HAUT */}
          
            <div className="pl--15 absolute top--20 left-1/2 -translate-x-1/2 flex space-x-2 z-10 ">
              <span className="w-6 h-0.5 bg-gray-300 rounded"></span>
              <span className="w-6 h-0.5 bg-gray-300 rounded"></span>
              <span className="w-6 h-0.5 bg-gray-300 rounded"></span>
            </div>

           
            {/* IMAGE PRINCIPALE */}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
            />

            {/* IMAGE DE SURVOL */}
            {product.hoverImage && (
              <img
                src={product.hoverImage}
                alt={`${product.name} - vue alternative`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </div>


          {/* Informations du produit - réduites et centrées */}
          <div className="px-4 pb-4 flex-1 flex flex-col items-center text-center">
            <h3 className="text-sm font-medium text-black mb-1  transition-colors duration-300 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-base font-bold text-black">
              {product.price}
            </p>

          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
