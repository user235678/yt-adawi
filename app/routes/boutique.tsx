import { useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import FilterBar from "~/components/boutique/FilterBar";
import SidebarFilters from "~/components/boutique/SidebarFilters";
import ProductGrid, { Product, ProductCategory, ProductSize, ProductColor } from "~/components/boutique/ProductGrid";
import SortButton from "~/components/boutique/SortButton";
import ProductModal from "~/components/boutique/ProductModal";
import { Outlet } from "@remix-run/react";

export const meta: MetaFunction = () => {
    return [
        { title: "Boutique - Adawi" },
        { name: "description", content: "Découvrez notre collection de vêtements élégants pour homme, femme et enfant." },
    ];
};

type SortOption = "featured" | "newest" | "price-low" | "price-high";

export default function Boutique() {
    // États séparés pour filtrage et tri
    const [activeCategory, setActiveCategory] = useState<ProductCategory>("vedette");
    const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(undefined);
    const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(undefined);
    const [sortOption, setSortOption] = useState<SortOption>("featured");

    // Nouveaux états pour le modal produit
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Données avec produits de test pour toutes les combinaisons - AVEC IMAGES DE SURVOL ET IMAGES SUPPLÉMENTAIRES
    const products: Product[] = [
        // Produits homme avec différentes combinaisons
        {
            id: 1,
            name: "Polo Rouge XXL",
            price: "10000 fcfa",
            priceValue: 10000,
            image: "/template/5.png",
            hoverImage: "/template/6.png", // Image de survol ajoutée
            image1: "/template/8.png", // Nouvelle image supplémentaire
            image2: "/template/9.png", // Nouvelle image supplémentaire
            date: new Date(2023, 5, 15),
            category: "homme",
            size: "xxl",
            color: "rouge"
        },
        {
            id: 2,
            name: "Veste Noire L",
            price: "25000 fcfa",
            priceValue: 25000,
            image: "/template/5.png",
            hoverImage: "/template/8.png", // Image de survol ajoutée
            image1: "/template/6.png", // Nouvelle image supplémentaire
            image2: "/template/0.png", // Nouvelle image supplémentaire
            date: new Date(2023, 6, 20),
            category: "homme",
            size: "l",
            color: "noir"
        },
        {
            id: 3,
            name: "Chemise Blanche M",
            price: "7000 fcfa",
            priceValue: 7000,
            image: "/template/5.png",
            hoverImage: "/template/9.png", // Image de survol ajoutée
            image1: "/template/8.png", // Nouvelle image supplémentaire
            image2: "/template/6.png", // Nouvelle image supplémentaire
            date: new Date(2023, 7, 5),
            category: "homme",
            size: "m",
            color: "blanc"
        },
        {
            id: 4,
            name: "Cardigan Vert XXL",
            price: "5000 fcfa",
            priceValue: 5000,
            image: "/template/5.png",
            hoverImage: "/template/0.png", // Image de survol ajoutée
            image1: "/template/9.png", // Nouvelle image supplémentaire
            image2: "/template/8.png", // Nouvelle image supplémentaire
            date: new Date(2023, 8, 10),
            category: "homme",
            size: "xxl",
            color: "vert"
        },
        {
            id: 5,
            name: "T-shirt Rouge M",
            price: "4000 fcfa",
            priceValue: 4000,
            image: "/template/5.png",
            hoverImage: "/template/6.png", // Image de survol ajoutée
            image1: "/template/0.png", // Nouvelle image supplémentaire
            image2: "/template/9.png", // Nouvelle image supplémentaire
            date: new Date(2023, 4, 12),
            category: "homme",
            size: "m",
            color: "rouge"
        },

        // NOUVEAUX PRODUITS FEMME
        {
            id: 6,
            name: "Robe Élégante S",
            price: "18000 fcfa",
            priceValue: 18000,
            image: "/template/5.png",
            hoverImage: "/template/8.png", // Image de survol ajoutée
            image1: "/template/6.png", // Nouvelle image supplémentaire
            image2: "/template/9.png", // Nouvelle image supplémentaire
            date: new Date(2023, 7, 25),
            category: "femme",
            size: "s",
            color: "rouge"
        },
        {
            id: 7,
            name: "Blouse Blanche M",
            price: "12000 fcfa",
            priceValue: 12000,
            image: "/template/5.png",
            hoverImage: "/template/9.png", // Image de survol ajoutée
            image1: "/template/8.png", // Nouvelle image supplémentaire
            image2: "/template/0.png", // Nouvelle image supplémentaire
            date: new Date(2023, 8, 5),
            category: "femme",
            size: "m",
            color: "blanc"
        },
        {
            id: 8,
            name: "Jupe Noire L",
            price: "15000 fcfa",
            priceValue: 15000,
            image: "/template/5.png",
            hoverImage: "/template/0.png", // Image de survol ajoutée
            image1: "/template/9.png", // Nouvelle image supplémentaire
            image2: "/template/6.png", // Nouvelle image supplémentaire
            date: new Date(2023, 6, 18),
            category: "femme",
            size: "l",
            color: "noir"
        },
        {
            id: 9,
            name: "Veste Verte XL",
            price: "10 fcfa",
            priceValue: 22000,
            image: "/template/5.png",
            hoverImage: "/template/6.png", // Image de survol ajoutée
            image1: "/template/8.png", // Nouvelle image supplémentaire
            image2: "/template/0.png", // Nouvelle image supplémentaire
            date: new Date(2023, 5, 30),
            category: "femme",
            size: "xl",
            color: "vert"
        },
        {
            id: 10,
            name: "Pantalon Rouge M",
            price: "13500 fcfa",
            priceValue: 13500,
            image: "/template/5.png",
            hoverImage: "/template/8.png", // Image de survol ajoutée
            image1: "/template/9.png", // Nouvelle image supplémentaire
            image2: "/template/6.png", // Nouvelle image supplémentaire
            date: new Date(2023, 9, 2),
            category: "femme",
            size: "m",
            color: "rouge"
        },

        // NOUVEAUX PRODUITS ENFANT
        {
            id: 11,
            name: "T-shirt Enfant S",
            price: "3500 fcfa",
            priceValue: 3500,
            image: "/template/5.png",
            hoverImage: "/template/9.png", // Image de survol ajoutée
            image1: "/template/6.png", // Nouvelle image supplémentaire
            image2: "/template/8.png", // Nouvelle image supplémentaire
            date: new Date(2023, 8, 15),
            category: "enfant",
            size: "s",
            color: "blanc"
        },
        {
            id: 12,
            name: "Pantalon Enfant M",
            price: "4500 fcfa",
            priceValue: 4500,
            image: "/template/5.png",
            hoverImage: "/template/0.png", // Image de survol ajoutée
            image1: "/template/9.png", // Nouvelle image supplémentaire
            image2: "/template/6.png", // Nouvelle image supplémentaire
            date: new Date(2023, 7, 20),
            category: "enfant",
            size: "m",
            color: "noir"
        },
        {
            id: 13,
            name: "Robe Enfant S",
            price: "5000 fcfa",
            priceValue: 5000,
            image: "/template/5.png",
            hoverImage: "/template/6.png", // Image de survol ajoutée
            image1: "/template/8.png", // Nouvelle image supplémentaire
            image2: "/template/0.png", // Nouvelle image supplémentaire
            date: new Date(2023, 9, 5),
            category: "enfant",
            size: "s",
            color: "rouge"
        },
        {
            id: 14,
            name: "Veste Enfant M",
            price: "6000 fcfa",
            priceValue: 6000,
            image: "/template/5.png",
            hoverImage: "/template/8.png", // Image de survol ajoutée
            image1: "/template/9.png", // Nouvelle image supplémentaire
            image2: "/template/0.png", // Nouvelle image supplémentaire
            date: new Date(2023, 6, 10),
            category: "enfant",
            size: "m",
            color: "vert"
        },
        {
            id: 15,
            name: "Pyjama Enfant S",
            price: "4000 fcfa",
            priceValue: 4000,
            image: "/template/5.png",
            hoverImage: "/template/9.png", // Image de survol ajoutée
            image1: "/template/6.png", // Nouvelle image supplémentaire
            image2: "/template/8.png", // Nouvelle image supplémentaire
            date: new Date(2023, 8, 25),
            category: "enfant",
            size: "s",
            color: "blanc"
        },

        // NOUVEAUX PRODUITS MONTRE
        {
            id: 16,
            name: "Montre Classique",
            price: "35000 fcfa",
            priceValue: 35000,
            image: "/template/montres/mont.png",
            hoverImage: "/template/montres/mont1.png", // Image de survol ajoutée
            image1: "/template/9.png", // Nouvelle image supplémentaire
            image2: "/template/6.png", // Nouvelle image supplémentaire
            date: new Date(2023, 7, 12),
            category: "montre",
            size: "l",
            color: "noir"
        },
        {
            id: 17,
            name: "Montre Sport",
            price: "28000 fcfa",
            priceValue: 28000,
            image: "/template/montres/istockp.png",
            hoverImage: "/template/montres/mont.png", // Image de survol ajoutée
            image1: "/template/8.png", // Nouvelle image supplémentaire
            image2: "/template/9.png", // Nouvelle image supplémentaire
            date: new Date(2023, 8, 18),
            category: "montre",
            size: "m",
            color: "noir"
        },
        {
            id: 18,
            name: "Montre Luxe",
            price: "75000 fcfa",
            priceValue: 75000,
            image: "/template/montres/mont.png",
            hoverImage: "/template/montres/2.png", // Image de survol ajoutée
            image1: "/template/montres/", // Nouvelle image supplémentaire
            image2: "/template/0.png", // Nouvelle image supplémentaire
            date: new Date(2023, 9, 1),
            category: "montre",
            size: "l",
            color: "blanc"
        },
        {
            id: 19,
            name: "Montre Digitale",
            price: "15000 fcfa",
            priceValue: 15000,
            image: "/template/montres/mont.png",
            hoverImage: "/template/montres/2.png", // Image de survol ajoutée
            image1: "/template/6.png", // Nouvelle image supplémentaire
            image2: "/template/8.png", // Nouvelle image supplémentaire
            date: new Date(2023, 6, 25),
            category: "montre",
            size: "s",
            color: "noir"
        },
        {
            id: 20,
            name: "Montre Femme",
            price: "42000 fcfa",
            priceValue: 42000,
            image: "/template/montres/mont1.png",
            hoverImage: "/template/montres/2.png", // Image de survol ajoutée
            image1: "/template/9.png", // Nouvelle image supplémentaire
            image2: "/template/6.png", // Nouvelle image supplémentaire
            date: new Date(2023, 5, 20),
            category: "montre",
            size: "s",
            color: "rouge"
        }
    ];

    // Répéter les produits (optionnel, pour avoir plus de produits)
    const allProducts = [...products];

    //  ÉTAPE 1: FILTRAGE PAR CATÉGORIE
    const filteredByCategory = allProducts.filter(product => {
        if (activeCategory === "vedette") {
            return true; // Tous les produits pour "vedette"
        } else if (activeCategory === "nouveaute") {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return product.date >= thirtyDaysAgo;
        } else {
            return product.category === activeCategory;
        }
    });

    // ÉTAPE 2: TRI (appliqué APRÈS le filtrage)
    const sortProducts = (products: Product[], option: SortOption) => {
        const sortedProducts = [...products];

        switch (option) {
            case "newest":
                return sortedProducts.sort((a, b) => b.date.getTime() - a.date.getTime());
            case "price-low":
                return sortedProducts.sort((a, b) => a.priceValue - b.priceValue);
            case "price-high":
                return sortedProducts.sort((a, b) => b.priceValue - a.priceValue);
            case "featured":
            default:
                return sortedProducts;
        }
    };

    // ÉTAPE 3: APPLIQUER LE TRI AUX PRODUITS FILTRÉS PAR CATÉGORIE
    const sortedProducts = sortProducts(filteredByCategory, sortOption);

    // Fonctions de gestion des changements
    const handleCategoryChange = (category: ProductCategory) => {
        setActiveCategory(category);
        // Réinitialiser les filtres lors du changement de catégorie pour une meilleure expérience utilisateur
        setSelectedSize(undefined);
        setSelectedColor(undefined);
    };

    const handleSizeChange = (size: ProductSize | undefined) => {
        setSelectedSize(size);
        console.log("Taille sélectionnée:", size);
    };

    const handleColorChange = (color: ProductColor | undefined) => {
        setSelectedColor(color);
        console.log("Couleur sélectionnée:", color);
    };

    const handleSortChange = (option: SortOption) => {
        setSortOption(option);
        console.log("Option de tri:", option);
    };

    // Nouvelle fonction pour gérer le clic sur un produit
    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    // Fonction pour fermer le modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Debug des filtres actifs
    console.log("=== ÉTAT ACTUEL DES FILTRES ===");
    console.log("Catégorie:", activeCategory);
    console.log("Taille:", selectedSize);
    console.log("Couleur:", selectedColor);
    console.log("Tri:", sortOption);
    console.log("Produits après catégorie:", filteredByCategory.length);

    return (
        <div className="min-h-screen bg-white">
            <TopBanner />
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Barre de filtres centrée */}
                <div className="flex justify-center mb-6">
                    <FilterBar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
                </div>

                {/* Titre de catégorie centré */}
                <h1 className="text-3xl font-bold text-black text-center mb-8">
                    {activeCategory === "vedette"
                        ? "En Vedette"
                        : activeCategory === "nouveaute"
                            ? "Nouveautés"
                            : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                </h1>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar avec bouton de tri au-dessus */}
                    <div className="w-full md:w-1/4 lg:w-1/5">
                        <div className="mb-4">
                            <SortButton onSort={handleSortChange} currentSort={sortOption} />
                        </div>
                        <SidebarFilters
                            activeCategory={activeCategory}
                            selectedSize={selectedSize}
                            selectedColor={selectedColor}
                            onCategoryChange={handleCategoryChange}
                            onSizeChange={handleSizeChange}
                            onColorChange={handleColorChange}
                        />
                    </div>

                    {/* Grille de produits avec filtrage combiné */}
                    <div className="w-full md:w-3/4 lg:w-4/5">
                        <ProductGrid
                            products={sortedProducts} // Utiliser les produits filtrés et triés
                            selectedSize={selectedSize}
                            selectedColor={selectedColor}
                            onProductClick={handleProductClick} // Ajout de la fonction de clic
                        />
                    </div>
                </div>
            </main>

            {/* Modal produit */}
            <ProductModal 
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />

            <Outlet />

            <Footer />
        </div>
    );
}
