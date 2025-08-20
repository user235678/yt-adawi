import { useState, useRef } from "react";
import { X, Upload, Plus, Image, Trash2, Save } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (formData: FormData) => void;
  categories: Category[];
  isSubmitting: boolean;
  error?: string;
}

export default function AddProductModal({ 
  isOpen, 
  onClose, 
  onAddProduct,
  categories,
  isSubmitting,
  error
}: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost_price: "",
    category_id: "",
    stock: "1",
    low_stock_threshold: "",
    sizes: "",
    colors: "",
    tags: "",
    is_active: "true"
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedHoverImages, setSelectedHoverImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [hoverImagePreviewUrls, setHoverImagePreviewUrls] = useState<string[]>([]);

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const hoverImageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedImages(prev => [...prev, ...files]);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleHoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedHoverImages(prev => [...prev, ...files]);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setHoverImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeMainImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeHoverImage = (index: number) => {
    setSelectedHoverImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(hoverImagePreviewUrls[index]);
    setHoverImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.description || !formData.price || !formData.category_id || !formData.stock) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validate at least one image
    if (selectedImages.length === 0) {
      alert("Veuillez ajouter au moins une image principale");
      return;
    }

    const submitFormData = new FormData();

    // Add form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        submitFormData.append(key, value);
      }
    });

    // Add images
    selectedImages.forEach(image => {
      submitFormData.append("images", image);
    });

    // Add hover images
    selectedHoverImages.forEach(image => {
      submitFormData.append("hover_images", image);
    });

    onAddProduct(submitFormData);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      cost_price: "",
      category_id: "",
      stock: "1",
      low_stock_threshold: "",
      sizes: "",
      colors: "",
      tags: "",
      is_active: "true"
    });
    setSelectedImages([]);
    setSelectedHoverImages([]);

    // Revoke all URLs to avoid memory leaks
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    hoverImagePreviewUrls.forEach(url => URL.revokeObjectURL(url));

    setImagePreviewUrls([]);
    setHoverImagePreviewUrls([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Ajouter un produit</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Basic info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informations de base</h3>
              
              {/* Product name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Price and Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix de vente (EUR) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix de revient (EUR)
                  </label>
                  <input
                    type="number"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seuil d'alerte stock
                  </label>
                  <input
                    type="number"
                    name="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                >
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>
            </div>

            {/* Right column - Variants and Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Variantes et Images</h3>
              
              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tailles (séparées par des virgules)
                </label>
                <input
                  type="text"
                  name="sizes"
                  value={formData.sizes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  placeholder="S,M,L,XL"
                />
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couleurs (séparées par des virgules)
                </label>
                <input
                  type="text"
                  name="colors"
                  value={formData.colors}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  placeholder="Rouge,Bleu,Noir"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                  placeholder="été,casual,tendance"
                />
              </div>

              {/* Main Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images principales *
                </label>
                <input
                  type="file"
                  ref={mainImageInputRef}
                  onChange={handleMainImageChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => mainImageInputRef.current?.click()}
                  className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-adawi-gold transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-gray-600">Ajouter des images</span>
                </button>

                {/* Image previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeMainImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images de survol (optionnel)
                </label>
                <input
                  type="file"
                  ref={hoverImageInputRef}
                  onChange={handleHoverImageChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => hoverImageInputRef.current?.click()}
                  className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-adawi-gold transition-colors"
                >
                  <Image className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="text-gray-600">Ajouter des images de survol</span>
                </button>

                {/* Hover image previews */}
                {hoverImagePreviewUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {hoverImagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Hover Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeHoverImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Créer le produit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
