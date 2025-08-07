import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import type { Product } from "~/routes/admin.products";

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    onEditProduct: (product: Product) => void;
}

// Définir un type pour le formulaire qui permet stock comme string
interface ProductFormData {
    id: number;
    name: string;
    category: string;
    price: string;
    stock: string; // String pour le formulaire
    status: string;
    image: string;
    createdAt: string;
    description: string;
    sizes: string[];
    colors: string[];
}

export default function EditProductModal({ isOpen, onClose, product, onEditProduct }: EditProductModalProps) {
    const [formData, setFormData] = useState<ProductFormData>({
        id: 0,
        name: "",
        category: "",
        price: "",
        stock: "",
        status: "",
        image: "",
        createdAt: "",
        description: "",
        sizes: [],
        colors: [],
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialiser le formulaire avec les données du produit
    useEffect(() => {
        if (product) {
            setFormData({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                stock: product.stock.toString(),
                status: product.status,
                image: product.image,
                createdAt: product.createdAt,
                description: product.description || "",
                sizes: product.sizes || [],
                colors: product.colors || [],
            });
        }
    }, [product]);

    const categories = ["Homme", "Femme", "Enfant", "Montre"];
    const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];
    const availableColors = ["Noir", "Blanc", "Rouge", "Bleu", "Vert", "Jaune", "Marron"];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convertir le stock en nombre
        const updatedProduct: Product = {
            ...formData,
            stock: parseInt(formData.stock, 10), // Ajouter la base 10 pour être explicite
            description: formData.description || undefined,
            sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
            colors: formData.colors.length > 0 ? formData.colors : undefined,
        };

        onEditProduct(updatedProduct);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
            setFormData(prev => ({ ...prev, image: imageUrl }));
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Modifier le produit</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image du produit
                        </label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        
                        <div className="flex items-center space-x-4">
                            <img
                                src={imagePreview || formData.image}
                                alt={formData.name}
                                className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                            />
                            <div 
                                onClick={triggerFileInput}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-adawi-gold transition-colors flex-1 cursor-pointer"
                            >
                                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">
                                    Cliquez pour changer l'image
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom du produit *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Catégorie *
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix (FCFA) *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.stock}
                                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut *
                            </label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                            >
                                <option value="Actif">Actif</option>
                                <option value="Rupture">Rupture</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                            placeholder="Description détaillée du produit..."
                        />
                    </div>

                    {/* Sizes */}
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
                                    className={`px-3 py-2 text-sm border rounded-lg transition-colors ${formData.sizes.includes(size) ? 'bg-adawi-gold text-white border-adawi-gold' : 'bg-white text-gray-700 border-gray-300 hover:border-adawi-gold'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Colors */}
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
                                    className={`px-3 py-2 text-sm border rounded-lg transition-colors ${formData.colors.includes(color) ? 'bg-adawi-gold text-white border-adawi-gold' : 'bg-white text-gray-700 border-gray-300 hover:border-adawi-gold'}`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
                        >
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
