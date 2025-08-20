import { useState, useEffect } from "react";
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
import { ToastProvider } from "~/contexts/ToastContext";
import { getUserProfile } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Boutique - Adawi" },
        { name: "description", content: "Découvrez notre collection de vêtements élégants pour homme, femme et enfant." },
    ];
};

type SortOption = "featured" | "newest" | "price-low" | "price-high";

// Interface pour les produits de l'API
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

export default function Boutique() {
    const [activeCategory, setActiveCategory] = useState<ProductCategory>("vedette");
    const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(undefined);
    const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(undefined);
    const [sortOption, setSortOption] = useState<SortOption>("featured");

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // États pour l'API
    const [products, setProducts] = useState<Product[]>([]);
    const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fonction pour mapper les produits de l'API vers le format attendu
    const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
        let category: ProductCategory = "vedette";
        if (apiProduct.category?.name) {
            const categoryName = apiProduct.category.name.toLowerCase();
            if (categoryName.includes("homme") || categoryName.includes("men")) {
                category = "homme";
            } else if (categoryName.includes("femme") || categoryName.includes("women")) {
                category = "femme";
            } else if (categoryName.includes("enfant") || categoryName.includes("kids") || categoryName.includes("children")) {
                category = "enfant";
            } else if (categoryName.includes("montre") || categoryName.includes("watch")) {
                category = "montre";
            }
        }

        return {
            id: apiProduct.id, // Garder l'ID original (string)
            name: apiProduct.name,
            price: `${apiProduct.price} ${apiProduct.currency.toLowerCase()}`,
            priceValue: apiProduct.price,
            image: apiProduct.images[0] || "/placeholder.jpg",
            hoverImage: apiProduct.hover_images?.[0] || apiProduct.images[1],
            image1: apiProduct.images[1],
            image2: apiProduct.images[2],
            date: new Date(apiProduct.created_at),
            category: category,
            size: apiProduct.sizes[0] as ProductSize,
            sizes: apiProduct.sizes.join(","),
            color: apiProduct.colors[0] as ProductColor,
            colors: apiProduct.colors.join(","),
        };
    };

    // Fonction pour récupérer les produits depuis l'API
    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            params.append('limit', '100');
            if (selectedSize) params.append('sizes', selectedSize);
            if (selectedColor) params.append('colors', selectedColor);

            const response = await fetch(`/api/products?${params.toString()}`);
            if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);

            const responseData = await response.json();
            let apiProducts: ApiProduct[];

            if (Array.isArray(responseData)) {
                apiProducts = responseData;
            } else if (responseData && Array.isArray(responseData.products)) {
                apiProducts = responseData.products;
            } else if (responseData && Array.isArray(responseData.data)) {
                apiProducts = responseData.data;
            } else {
                throw new Error('Format de réponse API inattendu');
            }

            const activeProducts = apiProducts.filter(product => product.is_active);
            setApiProducts(activeProducts); // Stocker les produits API originaux
            setProducts(activeProducts.map(mapApiProductToProduct));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            setProducts([
                {
                    id: "1",
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
                    id: "2",
                    name: "Robe élégante",
                    price: "15000 fcfa",
                    priceValue: 15000,
                    image: "/robe_femme.jpg",
                    hoverImage: "/7.png",
                    image1: "/10.png",
                    image2: "/11.png",
                    date: new Date(2023, 6, 10),
                    category: "femme",
                    size: "m",
                    color: "noir"
                },
                {
                    id: "3",
                    name: "T-shirt enfant",
                    price: "5000 fcfa",
                    priceValue: 5000,
                    image: "/tshirt_enfant.jpg",
                    hoverImage: "/12.png",
                    image1: "/13.png",
                    image2: "/14.png",
                    date: new Date(2023, 7, 5),
                    category: "enfant",
                    size: "s",
                    color: "blanc"
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);
    useEffect(() => { fetchProducts(); }, [selectedSize, selectedColor]);

    const allProducts = [...products];
    const filteredByCategory = allProducts.filter(product => {
        if (activeCategory === "vedette") return true;
        if (activeCategory === "nouveaute") {
            const today = new Date();
            const productDate = new Date(product.date);
            const daysDiff = Math.floor((today.getTime() - productDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= 30;
        }
        return product.category === activeCategory;
    });

    const sortProducts = (products: Product[], option: SortOption) => {
        const sortedProducts = [...products];
        switch (option) {
            case "newest": return sortedProducts.sort((a, b) => b.date.getTime() - a.date.getTime());
            case "price-low": return sortedProducts.sort((a, b) => a.priceValue - b.priceValue);
            case "price-high": return sortedProducts.sort((a, b) => b.priceValue - a.priceValue);
            case "featured":
            default: return sortedProducts;
        }
    };

    const sortedProducts = sortProducts(filteredByCategory, sortOption);

    const handleCategoryChange = (category: ProductCategory) => {
        setActiveCategory(category);
        setSelectedSize(undefined);
        setSelectedColor(undefined);
    };

    const handleSizeChange = (size: ProductSize | undefined) => setSelectedSize(size);
    const handleColorChange = (color: ProductColor | undefined) => setSelectedColor(color);
    const handleSortChange = (option: SortOption) => setSortOption(option);

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => setIsModalOpen(false);

    return (
        <div className="min-h-screen bg-white">
            <ToastProvider>
                <TopBanner />
                <Header />
                <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                    <div className="flex justify-center mb-4 sm:mb-6 overflow-x-auto">
                        <FilterBar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black text-center mb-6 sm:mb-8 px-2">
                        {activeCategory === "vedette"
                            ? "En Vedette"
                            : activeCategory === "nouveaute"
                                ? "Nouveautés"
                                : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                    </h1>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                            <p>Erreur lors du chargement des produits: {error}</p>
                            <button
                                onClick={fetchProducts}
                                className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                            >
                                Réessayer
                            </button>
                        </div>
                    )}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adawi-gold"></div>
                            <span className="ml-3 text-gray-600">Chargement des produits...</span>
                        </div>
                    )}
                    {!isLoading && (
                        <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
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
                            <div className="w-full md:w-2/3 lg:w-3/4 xl:w-4/5">
                                {sortedProducts.length === 0 && !isLoading ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 text-lg">Aucun produit trouvé pour cette sélection.</p>
                                    </div>
                                ) : (
                                    <ProductGrid
                                        products={sortedProducts}
                                        selectedSize={selectedSize}
                                        selectedColor={selectedColor}
                                        onProductClick={handleProductClick}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </main>
                {/* Modal produit - on passe les produits API originaux */}
                <ProductModal
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    apiProducts={apiProducts}
                />
                <Outlet />
                <Footer />
            </ToastProvider>
        </div>
    );
}