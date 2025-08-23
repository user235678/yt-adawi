import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import TopBanner from "~/components/TopBanner";
import CompactHeader from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { readToken } from "~/utils/session.server";
import {
    Package,
    RefreshCw,
    DollarSign,
    BarChart2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Eye,
    Edit,
    Trash2,
    ArrowUpRight
} from "lucide-react";

export const meta: MetaFunction = () => {
    return [
        { title: "Dashboard Vendeur Essai - Adawi" },
        { name: "description", content: "Test du dashboard vendeur avec API" },
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

// Interface pour les produits
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

export default function SellerDashboardEssai() {
    const { user } = useLoaderData<{ user: any }>();

    // États pour les produits
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [productsError, setProductsError] = useState<string | null>(null);

    // Fonction pour charger les produits du vendeur
    const loadProducts = async () => {
        console.log("🔄 Début du chargement des produits...");
        setIsLoadingProducts(true);
        setProductsError(null);
        
        try {
            console.log("📡 Appel vers /api/products/vendor");
            const response = await fetch('/api/products/vendor?limit=100&skip=0');
            console.log("📡 Réponse reçue:", response.status, response.statusText);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erreur API: ${response.status}`);
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
        } catch (error: any) {
            console.error("❌ Erreur lors du chargement des produits:", error);
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

    // Calculer les statistiques
    const stats = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.is_active).length,
        totalStock: products.reduce((sum, p) => sum + p.stock, 0),
        lowStockProducts: products.filter(p => p.stock <= p.low_stock_threshold).length,
        totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
        totalProfit: products.reduce((sum, p) => sum + (p.price - (p.cost_price || 0)) * p.stock, 0)
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
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard Vendeur - Test API</h1>
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
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Stock Total</h3>
                            <span className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <Package className="w-5 h-5" />
                            </span>
                        </div>
                        <div className="flex items-baseline">
                            <p className="text-2xl font-bold text-gray-900">{stats.totalStock}</p>
                            <p className="ml-2 text-sm text-gray-500">unités</p>
                        </div>
                        {stats.lowStockProducts > 0 && (
                            <div className="mt-1 flex items-center text-xs">
                                <AlertCircle className="w-3 h-3 text-amber-500 mr-1" />
                                <span className="text-amber-500 font-medium">
                                    {stats.lowStockProducts} en stock bas
                                </span>
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
                            <p className="ml-2 text-sm text-gray-500">FCFA</p>
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
                            <p className="ml-2 text-sm text-gray-500">FCFA</p>
                        </div>
                    </div>
                </div>

                {/* Liste des produits */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Mes Produits</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Test de récupération via l'API
                        </p>
                    </div>

                    {/* Contenu du tableau */}
                    <div className="overflow-x-auto">
                        {isLoadingProducts ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-adawi-gold border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-600">Chargement des produits...</span>
                            </div>
                        ) : productsError ? (
                            <div className="text-center py-12">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                                    <p className="text-red-800 font-medium">Erreur de chargement</p>
                                    <p className="text-red-600 text-sm mt-1">{productsError}</p>
                                    <button
                                        onClick={loadProducts}
                                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Réessayer
                                    </button>
                                </div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                                <p className="text-gray-600">Aucun produit n'a été trouvé pour ce vendeur.</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Produit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prix
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img
                                                                className="h-10 w-10 rounded-md object-cover"
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center ${product.images?.length > 0 ? 'hidden' : ''}`}>
                                                            <Package className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
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
                                                    {product.price.toLocaleString('fr-FR')} {product.currency || 'FCFA'}
                                                </div>
                                                {product.cost_price && product.cost_price > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        Marge: {Math.round(((product.price - product.cost_price) / product.price) * 100)}%
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-medium ${
                                                    product.stock <= 0
                                                        ? 'text-red-600'
                                                        : product.stock <= (product.low_stock_threshold || 5)
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
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    product.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {product.is_active ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Actif
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Inactif
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(product.created_at)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(product.created_at).toLocaleTimeString('fr-FR', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        className="text-gray-400 hover:text-gray-700 p-1"
                                                        title="Voir le produit"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="text-blue-400 hover:text-blue-700 p-1"
                                                        title="Modifier le produit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
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

                {/* Debug Info */}
                <div className="mt-8 bg-gray-100 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Informations de Debug</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p>• Utilisateur: {user.full_name} ({user.role})</p>
                        <p>• Produits chargés: {products.length}</p>
                        <p>• Statut de chargement: {isLoadingProducts ? 'En cours...' : 'Terminé'}</p>
                        {productsError && <p className="text-red-600">• Erreur: {productsError}</p>}
                        <p>• URL API utilisée: /api/products/vendor?limit=100&skip=0</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
