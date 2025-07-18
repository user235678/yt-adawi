import React from "react";
import { ProductCategory, ProductSize, ProductColor } from "./ProductGrid";

interface SidebarFiltersProps {
  activeCategory: ProductCategory;
  selectedSize: ProductSize | undefined;
  selectedColor: ProductColor | undefined;
  onCategoryChange: (category: ProductCategory) => void;
  onSizeChange: (size: ProductSize | undefined) => void;
  onColorChange: (color: ProductColor | undefined) => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  activeCategory,
  selectedSize,
  selectedColor,
  onCategoryChange,
  onSizeChange,
  onColorChange,
}) => {
  const categoryOptions = [
    { id: "vedette", label: "Vedette" },
    { id: "nouveaute", label: "Nouveauté" },
    { id: "homme", label: "Homme" },
    { id: "femme", label: "Femme" },
    { id: "enfant", label: "Enfant" },
    { id: "montre", label: "Montre" },
  ];

  const sizeOptions = [
    { id: "xxl", label: "XXL" },
    { id: "xl", label: "XL" },
    { id: "l", label: "L" },
    { id: "m", label: "M" },
    { id: "s", label: "S" },
  ];

  const colorOptions = [
    { id: "blanc", label: "Blanc" },
    { id: "noir", label: "Noir" },
    { id: "rouge", label: "Rouge" },
    { id: "vert", label: "Vert" },
  ];

  return (
    <div className="border-4 border-adawi-gold rounded-3xl p-4 space-y-6">
      {/* Catégorie */}
      <div>
        <h3 className="font-semibold pl-9 text-black mb-3">Catégorie</h3>
        <div className="space-y-2">
          {categoryOptions.map((option) => (
            <div key={option.id} className="flex justify-between items-center">
              <label htmlFor={`category-${option.id}`} className="text-sm text-black pl-12">
                {option.label}
              </label>
              <input
                type="radio"
                id={`category-${option.id}`}
                name="category"
                className="w-4 h-4"
                checked={activeCategory === option.id}
                onChange={() => onCategoryChange(option.id as ProductCategory)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Taille */}
      <div>
        <h3 className=" pl-9 font-semibold text-black mb-3">Taille</h3>
        <div className="space-y-2">
          {sizeOptions.map((option) => (
            <div key={option.id} className="flex justify-between items-center">
              <label htmlFor={`size-${option.id}`} className="text-sm text-black pl-12">
                {option.label}
              </label>
              <input
                type="radio"
                id={`size-${option.id}`}
                name="size"
                className="w-4 h-4 border-2 border-adawi-gold bg-white text-adawi-gold focus:ring-adawi-gold"
                checked={selectedSize === option.id}
                onChange={() => onSizeChange(option.id as ProductSize)}
              />

            </div>
          ))}
          <div className="flex justify-between items-center">
            <label htmlFor="size-all" className="text-sm text-black pl-12">
              Tout
            </label>
            <input
              type="radio"
              id="size-all"
              name="size"
              className="w-4 h-4 text-adawi-gold  focus:ring-adawi-gold"
              checked={selectedSize === undefined}
              onChange={() => onSizeChange(undefined)}
            />
          </div>
        </div>
      </div>

      {/* Couleur */}
      <div>
        <h3 className="pl-9 font-semibold text-black mb-3">Couleur</h3>
        <div className="space-y-2">
          {colorOptions.map((option) => (
            <div key={option.id} className="flex justify-between items-center">
              <label htmlFor={`color-${option.id}`} className="text-sm text-black pl-12">
                {option.label}
              </label>
              <input
                type="radio"
                id={`color-${option.id}`}
                name="color"
                className="w-4 h-4 text-adawi-gold focus:ring-adawi-gold"
                checked={selectedColor === option.id}
                onChange={() => onColorChange(option.id as ProductColor)}
              />
            </div>
          ))}
          <div className="flex justify-between items-center">
            <label htmlFor="color-all" className="text-sm text-black pl-12">
              Tout
            </label>
            <input
              type="radio"
              id="color-all"
              name="color"
              className="w-4 h-4 text-adawi-gold border-red focus:ring-adawi-gold"
              checked={selectedColor === undefined}
              onChange={() => onColorChange(undefined)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarFilters;
