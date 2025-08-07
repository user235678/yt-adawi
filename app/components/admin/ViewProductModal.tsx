import { X } from "lucide-react";

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export default function ViewProductModal({ isOpen, onClose, product }: ViewProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Détails du produit</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image */}
            <div className="md:w-1/3">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="md:w-2/3 space-y-4">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500">ID: {product.id}</p>
              </div>

              {/* Price and Status */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-500">Prix</p>
                  <p className="text-lg font-medium text-gray-900">{product.price} FCFA</p>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-500">Catégorie</p>
                  <p className="text-lg font-medium text-gray-900">{product.category}</p>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className="text-lg font-medium text-gray-900">{product.stock} unités</p>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-500">Statut</p>
                  <p className={`text-lg font-medium ${
                    product.status === 'Actif' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.status}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                <p className="text-gray-600">
                  {product.description || "Aucune description disponible."}
                </p>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Tailles disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes && product.sizes.length > 0 ? (
                    product.sizes.map((size: string) => (
                      <span 
                        key={size} 
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg"
                      >
                        {size}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">Aucune taille spécifiée</p>
                  )}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Couleurs disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors && product.colors.length > 0 ? (
                    product.colors.map((color: string) => (
                      <span 
                        key={color} 
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg"
                      >
                        {color}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">Aucune couleur spécifiée</p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Date d'ajout</h4>
                <p className="text-gray-600">{product.createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
