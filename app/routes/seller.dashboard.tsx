import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import TopBanner from "~/components/TopBanner";
import CompactHeader from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { readToken } from "~/utils/session.server";
import EditProductModal from "~/components/admin/EditProductModal";
import DeleteConfirmationModal from "~/components/admin/DeleteConfirmationModal";
import ViewProductModal from "~/components/admin/ViewProductModal";
import {
    Package,
    Plus,
    Upload,
    DollarSign,
    Tag,
    Palette,
    Ruler,
    FileText,
    Save,
    X,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Edit,
    Trash2,
    Eye,
    BarChart2,
    Settings,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Calendar,
    ArrowUpRight
} from "lucide-react";

export const meta: MetaFunction = () => {
    return [
        { title: "Dashboard Vendeur - Adawi" },
        { name: "description", content: "Gérez vos produits et ventes" },
    ];
};
export const loader: LoaderFunction = async ({ request }) => {
    const token = await readToken(request);
    if (!token) {
        return redirect("/login");
    }
    try {
        // Vérifier les permissions utilisateur
        const userResponse = await fetch("https://showroom-backend-2x3g.onrender.com/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) {
            return redirect("/login");
        }
        const user = await userResponse.json();
        // Vérifier si l'utilisateur est vendeur ou admin
        if (user.role !== 'vendeur' && user.role !== 'admin' && user.role !== '') {
            return redirect("/");
        }
        return json({ user });
    } catch (error) {
        console.error("❌ Erreur loader dashboard:", error);
        return redirect("/login");
    }
};
const categories = [
    { id: "homme", name: "Homme" },
    { id: "femme", name: "Femme" },
    { id: "enfant", name: "Enfant" },
];
// Interface mise à jour avec les nouveaux champs
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    cost_price: number;
    currency: string;
    category_id: string;
    sizes: string[];
    colors: string[];
    stock: number;
    low_stock_threshold: number;
    images: string[];
    hover_images: string[];
    tags: string[];
    seller_id: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    category: {
        id: string;
        name: string;
        description: string;
        parent_id: string;
    };
    profit: number;
    margin_percent: number;
}
// Interface pour typer la réponse des fetchers
interface FetcherResponse {
    success?: boolean;
    error?: string;
    message?: string;
    product?: any;
    productId?: string;
}
export default function SellerDashboard() {
    const { user } = useLoaderData<{ user: any }>();

    const fetcher = useFetcher<FetcherResponse>();
    const deleteFetcher = useFetcher<FetcherResponse>();
    const editFetcher = useFetcher<FetcherResponse>();
    const toggleFetcher = useFetcher<FetcherResponse>();

    // États pour les produits
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [productsError, setProductsError] = useState<string | null>(null);

    // États pour les filtres et le tri
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortField, setSortField] = useState<string>("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // États pour les modals
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isTogglingProduct, setIsTogglingProduct] = useState<string | null>(null);

    // États pour le formulaire de création
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        cost_price: "",
        category_id: "",
        stock: "",
        low_stock_threshold: "",
        sizes: [] as string[],
        colors: [] as string[],
        tags: [] as string[],
        is_active: true
    });
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedHoverImages, setSelectedHoverImages] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [hoverImagePreview, setHoverImagePreview] = useState<string[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    // Options disponibles
    const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    const availableColors = ["Noir", "Blanc", "Rouge", "Bleu", "Vert", "Jaune", "Rose", "Violet", "Orange", "Gris", "Marron"];
    const availableTags = ["Nouveau", "Promotion", "Populaire", "Tendance", "Exclusif", "Édition limitée", "Bio", "Éco-responsable", "Fait main"];

    const isSubmitting = fetcher.state === "submitting";

    // Fonction pour charger les produits du vendeur - avec plus de logging
    const loadProducts = async () => {
        console.log("🔄 Début du chargement des produits...");
        setIsLoadingProducts(true);
        setProductsError(null);
        try {
            console.log("📡 Appel vers /api/products/vendor");
            const response = await fetch('/api/products/vendor', {
                credentials: 'include',
            });
            console.log("📡 Réponse reçue:", response.status, response.statusText);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur API: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log("📦 Données reçues:", data);
            if (data.success) {
                setProducts(data.products || []);
                console.log(`✅ ${data.products?.length || 0} produits chargés`);
            } else {
                const errorMessage = data.error || "Erreur lors du chargement des produits";
                setProductsError(errorMessage);
                console.error("❌ Erreur API:", errorMessage);
            }
        } catch (error: any) { // Ajout du type any pour éviter l'erreur TypeScript
            console.error("❌Erreur lors du chargement des produits:", error);
            setProductsError(`Erreur de connexion: ${error.message}`);
        } finally {
            setIsLoadingProducts(false);
            console.log("🏁 Fin du chargement des produits");
        }
    };
    // Charger les produits au montage du composant
    useEffect(() => {
        loadProducts();
    }, []);
    // Gérer la réponse du fetcher de création
    useEffect(() => {
        if (fetcher.data?.success) {
            loadProducts();
            // Réinitialiser le formulaire après succès
            setTimeout(() => {
                setFormData({
                    name: "",
                    description: "",
                    price: "",
                    cost_price: "",
                    category_id: "",
                    stock: "",
                    low_stock_threshold: "",
                    sizes: [],
                    colors: [],
                    tags: [],
                    is_active: true
                });
                setSelectedImages([]);
                setSelectedHoverImages([]);
                setImagePreview([]);
                setHoverImagePreview([]);
                setErrors({});
                setShowCreateForm(false);
            }, 2000);
        }
    }, [fetcher.data]);
    // Gérer la réponse du fetcher de suppression
    useEffect(() => {
        if (deleteFetcher.data?.success) {
            loadProducts();
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        }
    }, [deleteFetcher.data]);
    // Gérer la réponse du fetcher de modification
    useEffect(() => {
        if (editFetcher.data?.success) {
            loadProducts();
            setIsEditModalOpen(false);
            setSelectedProductForEdit(null);
        }
    }, [editFetcher.data]);
    // Gérer la réponse du fetcher de toggle
    useEffect(() => {
        if (toggleFetcher.data?.success) {
            loadProducts();
            setIsTogglingProduct(null);
        }
    }, [toggleFetcher.data]);
    // Fonctions pour le formulaire de création
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Effacer les erreurs
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: [] }));
        }
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages(files);
        // Créer des aperçus
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreview(previews);
    };
    const handleHoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedHoverImages(files);
        // Créer des aperçus
        const previews = files.map(file => URL.createObjectURL(file));
        setHoverImagePreview(previews);
    };
    const toggleSize = (size: string) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };
    const toggleColor = (color: string) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.includes(color)
                ? prev.colors.filter(c => c !== color)
                : [...prev.colors, color]
        }));
    };
    const toggleTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };
    const removeImagePreview = (index: number, isHover = false) => {
        if (isHover) {
            const newFiles = selectedHoverImages.filter((_, i) => i !== index);
            const newPreviews = hoverImagePreview.filter((_, i) => i !== index);
            setSelectedHoverImages(newFiles);
            setHoverImagePreview(newPreviews);
        } else {
            const newFiles = selectedImages.filter((_, i) => i !== index);
            const newPreviews = imagePreview.filter((_, i) => i !== index);
            setSelectedImages(newFiles);
            setImagePreview(newPreviews);
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation côté client
        const newErrors: { [key: string]: string[] } = {};
        if (!formData.name.trim()) newErrors.name = ["Le nom est requis"];
        if (!formData.description.trim()) newErrors.description = ["La description est requise"];
        if (!formData.price.trim()) newErrors.price = ["Le prix est requis"];
        if (!formData.category_id) newErrors.category_id = ["La catégorie est requise"];
        if (!formData.stock.trim()) newErrors.stock = ["Le stock est requis"];
        if (selectedImages.length === 0) newErrors.images = ["Au moins une image est requise"];
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        // Créer FormData pour l'envoi
        const submitFormData = new FormData();
        // Ajouter les champs texte
        submitFormData.append("name", formData.name);
        submitFormData.append("description", formData.description);
        submitFormData.append("price", formData.price);
        submitFormData.append("category_id", formData.category_id);
        submitFormData.append("stock", formData.stock);
        submitFormData.append("is_active", formData.is_active.toString());
        // Ajouter les champs optionnels
        if (formData.cost_price) submitFormData.append("cost_price", formData.cost_price);
        if (formData.low_stock_threshold) submitFormData.append("low_stock_threshold", formData.low_stock_threshold);
        // Ajouter les arrays
        if (formData.sizes.length > 0) submitFormData.append("sizes", JSON.stringify(formData.sizes));
        if (formData.colors.length > 0) submitFormData.append("colors", JSON.stringify(formData.colors));
        if (formData.tags.length > 0) submitFormData.append("tags", JSON.stringify(formData.tags));
        // Ajouter les images
        selectedImages.forEach(image => {
            submitFormData.append("images", image);
        });
        selectedHoverImages.forEach(image => {
            submitFormData.append("hover_images", image);
        });
        fetcher.submit(submitFormData, {
            method: "post",
            action: "/api/products/create",
            encType: "multipart/form-data"
        });
    };
    // Fonctions pour les actions sur les produits
    const handleDeleteProduct = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };
    const confirmDeleteProduct = () => {
        if (productToDelete) {
            deleteFetcher.submit(null, {
                method: "delete",
                action: `/api/products/${productToDelete.id}/delete`
            });
        }
    };
    const handleToggleActive = (product: Product) => {
        setIsTogglingProduct(product.id);
        toggleFetcher.submit(
            { is_active: !product.is_active },
            {
                method: "post",
                action: `/api/products/${product.id}/toggle`,
                encType: "application/json"
            }
        );
    };
    // Fonctions pour le tri et le filtrage
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };
    const handleFilterChange = (filter: string) => {
        setActiveFilter(activeFilter === filter ? null : filter);
    };
    // Filtrer et trier les produits
    const filteredProducts = products.filter(product => {
        // Filtrer par recherche
        const matchesSearch =
            searchTerm === "" ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        // Filtrer par catégorie
        const matchesCategory = selectedCategory === "" || product.category_id === selectedCategory;
        // Filtrer par statut actif
        const matchesActive =
            activeFilter === null ||
            (activeFilter === "active" && product.is_active) ||
            (activeFilter === "inactive" && !product.is_active) ||
            (activeFilter === "low_stock" && product.stock <= product.low_stock_threshold);
        return matchesSearch && matchesCategory && matchesActive;
    });
    // Trier les produits
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let valueA, valueB;
        switch (sortField) {
            case "name":
                valueA = a.name.toLowerCase();
                valueB = b.name.toLowerCase();
                break;
            case "price":
                valueA = a.price;
                valueB = b.price;
                break;
            case "stock":
                valueA = a.stock;
                valueB = b.stock;
                break;
            case "created_at":
            default:
                valueA = new Date(a.created_at).getTime();
                valueB = new Date(b.created_at).getTime();
                break;
        }
        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });
    // Calculer les statistiques
    const stats = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.is_active).length,
        totalStock: products.reduce((sum, p) => sum + p.stock, 0),
        lowStockProducts: products.filter(p => p.stock <= p.low_stock_threshold).length,
        totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
        totalProfit: products.reduce((sum, p) => sum + (p.price - p.cost_price) * p.stock, 0)
    };
    // Formater la date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    };
    return (
        <div className="min-h-screen bg-gray-50">
            <TopBanner />
            <CompactHeader />
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard Vendeur</h1>
                            <p className="text-gray-600 mt-2">Bienvenue, {user.full_name}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => loadProducts()}
                                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 border border-gray-300 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Actualiser</span>
                            </button>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-adawi-gold hover:bg-adawi-gold/90 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Nouveau Produit</span>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Produits</h3>
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Package className="w-5 h-5" />
                            </span>
                        </div>
                        <div className="flex items-baseline">
                            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                            <p className="ml-2 text-sm text-gray-500">
                                ({stats.activeProducts} actifs)
                            </p>
                        </div>
                        <div className="mt-1 flex items-center text-xs">
                            <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                            <span className="text-green-500 font-medium">
                                {Math.round((stats.activeProducts / Math.max(stats.totalProducts, 1)) * 100)}%
                            </span>
                            <span className="text-gray-500 ml-1">actifs</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Stock</h3>
                            <span className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <Package className="w-5 h-5" />
                            </span>
                        </div>
                        <div className="flex items-baseline">
                            <p className="text-2xl font-bold text-gray-900">{stats.totalStock}</p>
                            <p className="ml-2 text-sm text-gray-500">
                                unités
                            </p>
                        </div>
                        {stats.lowStockProducts > 0 && (
                            <div className="mt-1 flex items-center text-xs">
                                <AlertCircle className="w-3 h-3 text-amber-500 mr-1" />
                                <span className="text-amber-500 font-medium">
                                    {stats.lowStockProducts} produit{stats.lowStockProducts > 1 ? 's' : ''}
                                </span>
                                <span className="text-gray-500 ml-1">en stock bas</span>
                            </div>
                        )}
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Valeur Stock</h3>
                            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <DollarSign className="w-5 h-5" />
                            </span>
                        </div>
                        <div className="flex items-baseline">
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.totalValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                            </p>
                            <p className="ml-2 text-sm text-gray-500">
                                EUR
                            </p>
                        </div>
                        <div className="mt-1 flex items-center text-xs">
                            <span className="text-gray-500">Valeur totale du stock</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Profit Potentiel</h3>
                            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <BarChart2 className="w-5 h-5" />
                            </span>
                        </div>
                        <div className="flex items-baseline">
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.totalProfit.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                            </p>
                            <p className="ml-2 text-sm text-gray-500">
                                EUR
                            </p>
                        </div>
                        <div className="mt-1 flex items-center text-xs">
                            <span className="text-gray-500">Profit estimé sur le stock actuel</span>
                        </div>
                    </div>
                </div>
                {/* Liste des produits */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <h2 className="text-xl font-semibold text-gray-900">Mes Produits</h2>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Barre de recherche */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Rechercher un produit..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                                    />
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                </div>
                                {/* Filtres */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span>Filtres</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    {showFilters && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                            <div className="p-4">
                                                <h3 className="font-medium text-gray-900 mb-3">Filtrer par</h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Catégorie
                                                        </label>
                                                        <select
                                                            value={selectedCategory}
                                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                                                        >
                                                            <option value="">Toutes les catégories</option>
                                                            {categories.map(cat => (
                                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Statut
                                                        </label>
                                                        <div className="space-y-2">
                                                            <button
                                                                onClick={() => handleFilterChange("active")}
                                                                className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center ${activeFilter === "active" ? "bg-green-100 text-green-800" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Produits actifs
                                                            </button>
                                                            <button
                                                                onClick={() => handleFilterChange("inactive")}
                                                                className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center ${activeFilter === "inactive" ? "bg-red-100 text-red-800" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-2" />
                                                                Produits inactifs
                                                            </button>
                                                            <div className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center ${activeFilter === "low_stock" ? "bg-amber-100 text-amber-800" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                                                                <AlertCircle className="w-4 h-4 mr-2" />
                                                                Stock bas
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Tableau des produits */}
                    <div className="overflow-x-auto">
                        {isLoadingProducts ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-adawi-gold border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-600">Chargement des produits...</span>
                            </div>
                        ) : productsError ? (
                            <div className="text-center py-12">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                                    <p className="text-red-800">{productsError}</p>
                                </div>
                            </div>
                        ) : sortedProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                                <p className="text-gray-600 mb-4">
                                    {searchTerm || selectedCategory || activeFilter
                                        ? "Essayez de modifier vos filtres de recherche."
                                        : "Commencez par ajouter votre premier produit."}
                                </p>
                                {(searchTerm || selectedCategory || activeFilter) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedCategory("");
                                            setActiveFilter(null);
                                        }}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                )}
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSort("name")}
                                                className="flex items-center space-x-1 hover:text-gray-700"
                                            >
                                                <span>Produit</span>
                                                {sortField === "name" && (
                                                    sortDirection === "asc" ?
                                                        <ChevronUp className="w-4 h-4" /> :
                                                        <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSort("price")}
                                                className="flex items-center space-x-1 hover:text-gray-700"
                                            >
                                                <span>Prix</span>
                                                {sortField === "price" && (
                                                    sortDirection === "asc" ?
                                                        <ChevronUp className="w-4 h-4" /> :
                                                        <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSort("stock")}
                                                className="flex items-center space-x-1 hover:text-gray-700"
                                            >
                                                <span>Stock</span>
                                                {sortField === "stock" && (
                                                    sortDirection === "asc" ?
                                                        <ChevronUp className="w-4 h-4" /> :
                                                        <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <button
                                                onClick={() => handleSort("created_at")}
                                                className="flex items-center space-x-1 hover:text-gray-700"
                                            >
                                                <span>Date</span>
                                                {sortField === "created_at" && (
                                                    sortDirection === "asc" ?
                                                        <ChevronUp className="w-4 h-4" /> :
                                                        <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img
                                                                className="h-10 w-10 rounded-md object-cover"
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {product.category?.name || "Sans catégorie"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {product.price.toLocaleString('fr-FR', { style: 'currency', currency: product.currency || 'EUR' })}
                                                </div>
                                                {product.cost_price && (
                                                    <div className="text-xs text-gray-500">
                                                        Marge: {Math.round((product.price - product.cost_price) / product.price * 100)}%
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-medium ${product.stock <= 0
                                                        ? 'text-red-600'
                                                        : product.stock <= product.low_stock_threshold
                                                            ? 'text-amber-600'
                                                            : 'text-green-600'
                                                    }`}>
                                                    {product.stock}
                                                </div>
                                                {product.low_stock_threshold && (
                                                    <div className="text-xs text-gray-500">
                                                        Seuil: {product.low_stock_threshold}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(product.created_at)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    <Clock className="inline-block w-3 h-3 mr-1" />
                                                    {new Date(product.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProductForView(product);
                                                            setIsViewModalOpen(true);
                                                        }}
                                                        className="text-gray-400 hover:text-gray-700 p-1"
                                                        title="Voir le produit"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProductForEdit(product);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="text-blue-400 hover:text-blue-700 p-1"
                                                        title="Modifier le produit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(product)}
                                                        disabled={isTogglingProduct === product.id}
                                                        className={`${product.is_active
                                                                ? 'text-amber-400 hover:text-amber-700'
                                                                : 'text-green-400 hover:text-green-700'
                                                            } p-1`}
                                                        title={product.is_active ? "Désactiver le produit" : "Activer le produit"}
                                                    >
                                                        {isTogglingProduct === product.id ? (
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                        ) : product.is_active ? (
                                                            <XCircle className="w-4 h-4" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product)}
                                                        className="text-red-400 hover:text-red-700 p-1"
                                                        title="Supprimer le produit"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
            {/* Modal de création de produit */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Créer un nouveau produit</h2>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Informations de base */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-adawi-gold" />
                                    Informations de base
                                </h3>
                                {/* Nom du produit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom du produit *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                        placeholder="Ex: T-shirt Premium"
                                    />
                                    {errors.name && (
                                        <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>
                                    )}
                                </div>
                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                        placeholder="Description détaillée du produit..."
                                    />
                                    {errors.description && (
                                        <p className="text-red-600 text-sm mt-1">{errors.description[0]}</p>
                                    )}
                                </div>
                                {/* Catégorie */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Catégorie *
                                    </label>
                                    <select
                                        name="category_id"
                                        required
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && (
                                        <p className="text-red-600 text-sm mt-1">{errors.category_id[0]}</p>
                                    )}
                                </div>
                            </div>
                            {/* Prix et stock */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <DollarSign className="w-5 h-5 mr-2 text-adawi-gold" />
                                    Prix et stock
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Prix de vente */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prix de vente (FCFA) *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                            placeholder="29.99"
                                        />
                                        {errors.price && (
                                            <p className="text-red-600 text-sm mt-1">{errors.price[0]}</p>
                                        )}
                                    </div>
                                    {/* Prix d'achat */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prix d'achat (FCFA)
                                        </label>
                                        <input
                                            type="number"
                                            name="cost_price"
                                            step="0.01"
                                            value={formData.cost_price}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                            placeholder="15.00"
                                        />
                                    </div>
                                    {/* Stock initial */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Stock initial *
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            required
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                            placeholder="25"
                                        />
                                        {errors.stock && (
                                            <p className="text-red-600 text-sm mt-1">{errors.stock[0]}</p>
                                        )}
                                    </div>
                                    {/* Seuil de stock bas */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Seuil de stock bas
                                        </label>
                                        <input
                                            type="number"
                                            name="low_stock_threshold"
                                            value={formData.low_stock_threshold}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                            placeholder="5"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Variantes */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Ruler className="w-5 h-5 mr-2 text-adawi-gold" />
                                    Tailles et couleurs
                                </h3>
                                {/* Tailles */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tailles disponibles
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSizes.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => toggleSize(size)}
                                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${formData.sizes.includes(size)
                                                        ? 'bg-adawi-gold text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Couleurs */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Couleurs disponibles
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableColors.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => toggleColor(color)}
                                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${formData.colors.includes(color)
                                                        ? 'bg-adawi-gold text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Tags */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Tag className="w-5 h-5 mr-2 text-adawi-gold" />
                                    Tags et étiquettes
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags du produit
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${formData.tags.includes(tag)
                                                        ? 'bg-adawi-gold text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Images */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Upload className="w-5 h-5 mr-2 text-adawi-gold" />
                                    Images du produit
                                </h3>
                                {/* Images principales */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Images principales *
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Vous pouvez sélectionner plusieurs images
                                    </p>
                                    {errors.images && (
                                        <p className="text-red-600 text-sm mt-1">{errors.images[0]}</p>
                                    )}
                                    {/* Aperçu des images */}
                                    {imagePreview.length > 0 && (
                                        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {imagePreview.map((src, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={src}
                                                        alt={`Aperçu ${index + 1}`}
                                                        className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImagePreview(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Images au survol */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Images au survol (optionnel)
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleHoverImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Images affichées au survol du produit
                                    </p>
                                    {/* Aperçu des images au survol */}
                                    {hoverImagePreview.length > 0 && (
                                        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {hoverImagePreview.map((src, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={src}
                                                        alt={`Aperçu survol ${index + 1}`}
                                                        className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImagePreview(index, true)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Statut du produit */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Settings className="w-5 h-5 mr-2 text-adawi-gold" />
                                    Paramètres
                                </h3>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                        className="h-4 w-4 text-adawi-gold focus:ring-adawi-gold border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                        Produit actif (visible sur la boutique)
                                    </label>
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Création en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>Créer le produit</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            {/* Messages de succès/erreur */}
                            {fetcher.data?.success && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-800">{fetcher.data.message}</p>
                                </div>
                            )}
                            {fetcher.data?.error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800">{fetcher.data.error}</p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
            {/* Modal de modification de produit */}
            {isEditModalOpen && selectedProductForEdit && (
                <EditProductModal
                    product={selectedProductForEdit}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={(formData) => {
                        editFetcher.submit(formData, {
                            method: "post",
                            action: `/api/products/${selectedProductForEdit.id}/update`,
                            encType: "multipart/form-data"
                        });
                    }}
                    isSubmitting={editFetcher.state === "submitting"}
                    error={editFetcher.data?.error}
                    categories={categories}
                />
            )}
            {/* Modal de visualisation de produit */}
            {isViewModalOpen && selectedProductForView && (
                <ViewProductModal
                    product={selectedProductForView}
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                />
            )}
            {/* Modal de confirmation de suppression */}
            {isDeleteModalOpen && productToDelete && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDeleteProduct}
                    productName={productToDelete.name}
                    isDeleting={deleteFetcher.state === "submitting"}
                />
            )}
            <Footer />
        </div>
    );
}
// Fonction utilitaire pour formater les dates
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
// Fonction pour obtenir les tailles disponibles
function getAvailableSizes(): string[] {
    return ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
}
// Fonction pour obtenir les couleurs disponibles
function getAvailableColors(): string[] {
    return ["Noir", "Blanc", "Rouge", "Bleu", "Vert", "Jaune", "Rose", "Violet", "Orange", "Gris", "Marron"];
}
// Fonction pour obtenir les tags disponibles
function getAvailableTags(): string[] {
    return ["Nouveau", "Promotion", "Populaire", "Tendance", "Exclusif", "Édition limitée", "Bio", "Éco-responsable", "Fait main"];
}
