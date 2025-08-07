import { useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Plus, Search, Filter, Edit, Trash2, Eye, X, AlertCircle } from "lucide-react";
import AddProductModal from "~/components/admin/AddProductModal";
import EditProductModal from "~/components/admin/EditProductModal";
import DeleteConfirmationModal from "~/components/admin/DeleteConfirmationModal";
import ViewProductModal from "~/components/admin/ViewProductModal";

// Définir une interface pour le type Product
export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: string;
  image: string;
  createdAt: string;
  description?: string;
  sizes?: string[];
  colors?: string[];
}

export const meta: MetaFunction = () => {
  return [
    { title: "Produits - Adawi Admin" },
    { name: "description", content: "Gestion des produits" },
  ];
};

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

  // Données simulées des produits (maintenant avec useState pour permettre les modifications)
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "T-shirt Premium Homme",
      category: "Homme",
      price: "15000",
      stock: 25,
      status: "Actif",
      image: "/5.png",
      createdAt: "2024-01-15",
      description: "T-shirt premium en coton pour homme, disponible en plusieurs tailles et couleurs.",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Noir", "Blanc", "Rouge"]
    },
    {
      id: 2,
      name: "Robe Élégante Femme",
      category: "Femme",
      price: "18000",
      stock: 12,
      status: "Actif",
      image: "/5.png",
      createdAt: "2024-01-14",
      description: "Robe élégante pour femme, parfaite pour les occasions spéciales.",
      sizes: ["S", "M", "L"],
      colors: ["Noir", "Rouge", "Bleu"]
    },
    {
      id: 3,
      name: "Montre Classique",
      category: "Montre",
      price: "35000",
      stock: 8,
      status: "Rupture",
      image: "/mont.png",
      createdAt: "2024-01-13",
      description: "Montre classique avec bracelet en cuir véritable et mécanisme suisse.",
      sizes: ["Standard"],
      colors: ["Noir", "Marron"]
    },
    {
      id: 4,
      name: "T-shirt Enfant",
      category: "Enfant",
      price: "3500",
      stock: 30,
      status: "Actif",
      image: "/9.png",
      createdAt: "2024-01-12",
      description: "T-shirt confortable pour enfant, 100% coton et facile à entretenir.",
      sizes: ["3-4", "5-6", "7-8", "9-10"],
      colors: ["Bleu", "Rouge", "Vert"]
    }
  ]);

  // Catégories disponibles
  const categories = ["Homme", "Femme", "Enfant", "Montre"];

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    // Filtre de recherche
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre de catégorie
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

    // Filtre de statut
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Fonctions pour gérer les produits
  const handleAddProduct = (newProduct: Omit<Product, 'id' | 'createdAt'>) => {
    // Générer un nouvel ID (dans une vraie application, cela serait fait par le backend)
    const newId = Math.max(...products.map(p => p.id)) + 1;
    const productToAdd: Product = {
      ...newProduct,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProducts([...products, productToAdd]);
    setIsAddModalOpen(false);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
    setIsEditModalOpen(false);
  };

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      setProducts(products.filter(product => product.id !== selectedProduct.id));
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
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
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.status === "Actif").length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.status === "Rupture").length}</p>
              <p className="text-sm text-gray-600">En Rupture</p>
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
              <p className="text-2xl font-bold text-gray-900">
                {products.reduce((sum, product) => sum + product.stock, 0)}
              </p>
              <p className="text-sm text-gray-600">Stock Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search - Améliorée et plus jolie */}
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
            className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                  <option key={category} value={category}>{category}</option>
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
                <option value="Rupture">Rupture</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{product.category}</td>
                    <td className="py-4 px-4 text-gray-900">{product.price} FCFA</td>
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
                        product.status === 'Actif'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredProducts.length}</span> sur <span className="font-medium">{products.length}</span> produits
        </p>
        
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Précédent
          </button>
          <button className="px-3 py-2 text-sm bg-adawi-gold text-white rounded-lg">
            1
          </button>
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Suivant
          </button>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
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
