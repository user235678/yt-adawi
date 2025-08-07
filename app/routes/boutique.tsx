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
    const [activeCategory, setActiveCategory] = useState<ProductCategory>("vedette");
    const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(undefined);
    const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(undefined);
    const [sortOption, setSortOption] = useState<SortOption>("featured");

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const products: Product[] = [
        {
            id: 1,
            name: "Polo vert",
            price: "10000 fcfa",
            priceValue: 10000,
            image: "/polo_homme.jpg",
            hoverImage: "/6.png",
            image1: "/8.png",
            image2: "/9.png",
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
            image: "/5.png",
            hoverImage: "/8.png",
            image1: "/6.png",
            image2: "/0.png",
            date: new Date(2023, 6, 20),
            category: "homme",
            size: "l",
            color: "noir"
        },
        {
            id: 3,
            name: "veste homme",
            price: "7000 fcfa",
            priceValue: 7000,
            image: "/veste_homme.jpg",
            hoverImage: "/9.png",
            image1: "/8.png",
            image2: "/6.png",
            date: new Date(2023, 7, 5),
            category: "homme",
            size: "m",
            color: "blanc"
        },
        {
            id: 4,
            name: "vestefleurie",
            price: "5000 fcfa",
            priceValue: 5000,
            image: "/vestefleurie.jpg",
            hoverImage: "/0.png",
            image1: "/9.png",
            image2: "/8.png",
            date: new Date(2023, 8, 10),
            category: "homme",
            size: "xxl",
            color: "vert"
        },
        {
            id: 5,
            name: "jacket",
            price: "4000 fcfa",
            priceValue: 4000,
            image: "/jacket.jpg",
            hoverImage: "/6.png",
            image1: "/0.png",
            image2: "/9.png",
            date: new Date(2023, 4, 12),
            category: "homme",
            size: "m",
            color: "rouge"
        },
        {
            id: 6,
            name: "Robe Élégante S",
            price: "18000 fcfa",
            priceValue: 18000,
            image: "/5.png",
            hoverImage: "/8.png",
            image1: "/6.png",
            image2: "/9.png",
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
            image: "/5.png",
            hoverImage: "/9.png",
            image1: "/8.png",
            image2: "/0.png",
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
            image: "/5.png",
            hoverImage: "/0.png",
            image1: "/9.png",
            image2: "/6.png",
            date: new Date(2023, 6, 18),
            category: "femme",
            size: "l",
            color: "noir"
        },
        {
            id: 9,
            name: "robe femme",
            price: "10 fcfa",
            priceValue: 10,
            image: "/robe_femme.jpg",
            hoverImage: "/6.png",
            image1: "/8.png",
            image2: "/0.png",
            date: new Date(2023, 5, 30),
            category: "femme",
            size: "xl",
            color: "vert"
        },
        {
            id: 10,
            name: "haut femme",
            price: "13500 fcfa",
            priceValue: 13500,
            image: "/haut_femme.jpg",
            hoverImage: "/8.png",
            image1: "/9.png",
            image2: "/6.png",
            date: new Date(2023, 9, 2),
            category: "femme",
            size: "m",
            color: "rouge"
        },
        {
            id: 11,
            name: "chemise marron",
            price: "3500 fcfa",
            priceValue: 3500,
            image: "/chemise_marron.jpg",
            hoverImage: "/5.png",
            image1: "/6.png",
            image2: "/8.png",
            date: new Date(2025, 12, 20),
            category: "enfant",
            size: "s",
            color: "blanc"
        },
        {
            id: 12,
            name: "Pantalon Enfant M",
            price: "4500 fcfa",
            priceValue: 4500,
            image: "/5.png",
            hoverImage: "/0.png",
            image1: "/9.png",
            image2: "/6.png",
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
            image: "/5.png",
            hoverImage: "/6.png",
            image1: "/8.png",
            image2: "/0.png",
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
            image: "/5.png",
            hoverImage: "/8.png",
            image1: "/9.png",
            image2: "/0.png",
            date: new Date("2025-07-20"),
            category: "enfant",
            size: "m",
            color: "vert"
        },
        {
            id: 15,
            name: "Pyjama Enfant S",
            price: "4000 fcfa",
            priceValue: 4000,
            image: "/5.png",
            hoverImage: "/9.png",
            image1: "/6.png",
            image2: "/8.png",
            date: new Date("2025-07-20"),
            category: "enfant",
            size: "s",
            color: "blanc"
        },
        {
            id: 16,
            name: "Montre Classique",
            price: "35000 fcfa",
            priceValue: 35000,
            image: "/mont.png",
            hoverImage: "/mont1.png",
            image1: "/9.png",
            image2: "/6.png",
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
            image: "/istockp.png",
            hoverImage: "/mont.png",
            image1: "/8.png",
            image2: "/9.png",
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
            image: "/mont.png",
            hoverImage: "/2.png",
            image1: "/montres/",
            image2: "/0.png",
            date: new Date(2025, 12, 20),
            category: "montre",
            size: "l",
            color: "blanc"
        },
        {
            id: 19,
            name: "Montre Digitale",
            price: "15000 fcfa",
            priceValue: 15000,
            image: "/mont.png",
            hoverImage: "/2.png",
            image1: "/6.png",
            image2: "/8.png",
            date: new Date(2025, 5, 20),
            category: "montre",
            size: "s",
            color: "noir"
        },
        {
            id: 20,
            name: "Montre Femme",
            price: "42000 fcfa",
            priceValue: 42000,
            image: "/mont1.png",
            hoverImage: "/2.png",
            image1: "/9.png",
            image2: "/6.png",
            date: new Date("2025-07-20"),
            category: "montre",
            sizes: "s,l,m,xl",
            colors: "rouge,marron,bleu",
        },
        {
            id: 21,
            name: "T-shirt Premium",
            price: "15000 fcfa",
            priceValue: 15000,
            image: "/5.png",
            hoverImage: "/6.png",
            image1: "/8.png",
            image2: "/9.png",
            date: new Date("2025-08-05"),
            category: "homme",
            sizes: "s,m,l,xl",
            colors: "noir,blanc,rouge",
        },
    ];

    const allProducts = [...products];

    const filteredByCategory = allProducts.filter(product => {
        if (activeCategory === "vedette") {
            return true;
        } else if (activeCategory === "nouveaute") {
            const today = new Date();
            const productDate = new Date(product.date);
            const daysDiff = Math.floor((today.getTime() - productDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= 30;
        } else {
            return product.category === activeCategory;
        }
    });

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

    const sortedProducts = sortProducts(filteredByCategory, sortOption);

    const handleCategoryChange = (category: ProductCategory) => {
        setActiveCategory(category);
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

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

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

            <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                {/* Barre de filtres centrée */}
                <div className="flex justify-center mb-4 sm:mb-6 overflow-x-auto">
                    <FilterBar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
                </div>

                {/* Titre de catégorie centré */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black text-center mb-6 sm:mb-8 px-2">
                    {activeCategory === "vedette"
                        ? "En Vedette"
                        : activeCategory === "nouveaute"
                            ? "Nouveautés"
                            : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                </h1>

                <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
                    {/* Sidebar avec bouton de tri au-dessus */}
                    <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 md:min-w-[220px] flex-shrink-0">
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
                    <div className="w-full md:w-2/3 lg:w-3/4 xl:w-4/5">
                        <ProductGrid
                            products={sortedProducts}
                            selectedSize={selectedSize}
                            selectedColor={selectedColor}
                            onProductClick={handleProductClick}
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
