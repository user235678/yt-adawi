import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Plus, Search, Filter, Edit, Trash2, Eye, X, AlertCircle, Loader2 } from "lucide-react";
import { useFetcher } from "@remix-run/react";
import AddProductModal from "~/components/admin/AddProductModal";


// Mettre à jour l'interface pour correspondre à l'API
export interface Product {
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

export const meta: MetaFunction = () => {
  return [
    { title: "Produits - Adawi Admin" },
    { name: "description", content: "Gestion des produits" },
  ];
};

// Composant Pagination simple
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Affichage de <span className="font-medium">{startItem}</span> à{' '}
            <span className="font-medium">{endItem}</span> sur{' '}
            <span className="font-medium">{totalItems}</span> résultats
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? 'z-10 bg-adawi-gold border-adawi-gold text-white'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

// Modal simple pour ajouter un produit
function AddProductModal({ 
  isOpen, 
  onClose, 
  onAddProduct 
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: any) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Ajouter un produit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Fonctionnalité d'ajout de produit à implémenter.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal simple pour modifier un produit
function EditProductModal({ 
  isOpen, 
  onClose, 
  product, 
  onEditProduct 
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onEditProduct: (product: any) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Modifier le produit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Modification du produit: <strong>{product.name}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Fonctionnalité de modification à implémenter.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal simple pour confirmer la suppression
function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName, 
  itemType 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Confirmer la suppression</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Êtes-vous sûr de vouloir supprimer le {itemType} <strong>\"{itemName}\"</strong> ?
        </p>
        <p className="text-sm text-red-600 mb-4">
          Cette action est irréversible.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal simple pour voir les détails d'un produit
function ViewProductModal({ 
  isOpen, 
  onClose, 
  product 
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Détails du produit</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              {product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
            </div>

            {/* Détails */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500">ID: {product.id}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Prix:</span>
                <p className="text-lg font-bold text-gray-900">{product.price.toLocaleString()} {product.currency}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Stock:</span>
                <p className="text-gray-900">{product.stock} unités</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Catégorie:</span>
                <p className="text-gray-900">{product.category?.name || "Non catégorisé"}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Statut:</span>
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {product.sizes.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Tailles:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.sizes.map((size, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.colors.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Couleurs:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.colors.map((color, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-sm font-medium text-gray-700">Description:</span>
            <p className="text-gray-900 mt-1">{product.description}</p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  // États pour les modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // État pour les filtres
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // États pour les produits et la pagination
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 10;

  // Catégories disponibles
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  // Fetcher pour l'ajout de produit
  const createFetcher = useFetcher<{ success: boolean; error?: string; product?: Product }>();

  // Charger les produits depuis l'API
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await fetch(`/api/products/admin?skip=${skip}&limit=${itemsPerPage}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        setTotalProducts(parseInt(data.total) || data.products.length);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les catégories
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
    }
  };

  // Charger les données au montage du composant et quand la page change
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [currentPage]);

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    // Filtre de recherche
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (product.category?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre de catégorie
    const matchesCategory = categoryFilter === "all" || product.category?.id === categoryFilter;

    // Filtre de statut
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "Actif" && product.is_active) || 
                         (statusFilter === "Rupture" && !product.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Fonctions pour gérer les produits
  const handleAddProduct = async (formData: FormData) => {
    createFetcher.submit(formData, {
      method: "POST",
      action: "/api/products/create",
      encType: "multipart/form-data"
    });
  };

  // Gérer la réponse de création
  useEffect(() => {
    if (createFetcher.data?.success) {
      // Recharger les produits après création réussie
      loadProducts();
      // Fermer le modal
      setIsAddModalOpen(false);
      // Afficher un message de succès (optionnel)
      alert("Produit créé avec succès !");
    }
  }, [createFetcher.data]);

  const handleEditProduct = async (updatedProduct: any) => {
    setIsEditModalOpen(false);
    loadProducts();
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      loadProducts();
    }
  };

  // Fonctions pour ouvrir les modals
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  // Fonction pour effacer la recherche
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculer les statistiques
  const activeProducts = products.filter(p => p.is_active).length;
  const inactiveProducts = products.filter(p => !p.is_active).length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-adawi-brown">Gestion des Produits</h1>
          <p className="text-gray-600">Gérez votre catalogue de produits</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un produit
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-sm text-gray-600">Total Produits</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
              <p className="text-sm text-gray-600">Produits Actifs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inactiveProducts}</p>
              <p className="text-sm text-gray-600">Produits Inactifs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
              <p className="text-sm text-gray-600">Stock Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className={`relative rounded-lg transition-all duration-200 ${ 
              searchFocused ? 'ring-2 ring-adawi-gold shadow-sm' : 'hover:shadow-sm'
            }`}>
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${ 
                searchFocused ? 'text-adawi-gold' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Rechercher un produit par nom ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none"
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex text-black items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtres
            <span className={`ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>

        {/* Filtres étendus */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="Rupture">Inactif</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-adawi-gold animate-spin" />
            <span className="ml-3 text-gray-600">Chargement des produits...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Produit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Catégorie</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Prix</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <img
                            src={product.images[0] || "/placeholder-product.png"}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">{product.category?.name || "Non catégorisé"}</td>
                      <td className="py-4 px-4 text-gray-900">{product.price.toLocaleString()} {product.currency}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-800'
                            : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} unités
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openViewModal(product)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(product)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(product)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mb-2" />
                        <p>Aucun produit trouvé</p>
                        {searchTerm && (
                          <button 
                            onClick={clearSearch}
                            className="mt-2 text-adawi-gold hover:underline"
                          >
                            Effacer la recherche
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalProducts / itemsPerPage)}
        onPageChange={handlePageChange}
        totalItems={totalProducts}
        itemsPerPage={itemsPerPage}
      />

      {/* Add Product Modal */}
     <AddProductModal
  isOpen={isAddModalOpen}
  onClose={() => setIsAddModalOpen(false)}
  onSubmit={handleAddProduct}
  categories={categories}
  isSubmitting={createFetcher.state === "submitting"}
  error={createFetcher.data?.error}
/>

      {/* Edit Product Modal */}
      {selectedProduct && (
        <EditProductModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProduct}
          onEditProduct={handleEditProduct}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedProduct && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteProduct}
          itemName={selectedProduct.name}
          itemType="produit"
        />
      )}

      {/* View Product Modal */}
      {selectedProduct && (
        <ViewProductModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
