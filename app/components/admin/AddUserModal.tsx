import { useState, useEffect } from "react";
import { useSubmit, useNavigation, useActionData } from "@remix-run/react";
import { X, Upload, Loader2, CheckCircle } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<{ success?: boolean; error?: string }>();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    status: "Actif"
  });

  const roles = ["Client", "Vendeur", "Admin"];

  const isSubmitting = navigation.state === "submitting";

  // Reset form fields after successful submission
  useEffect(() => {
    if (actionData?.success) {
      setFormData({
        name: "",
        email: "",
        role: "",
        password: "",
        status: "Actif"
      });
    }
  }, [actionData?.success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mapper le rôle au format API
    const roleMapping: { [key: string]: string } = {
      "Client": "client",
      "Vendeur": "vendeur",
      "Admin": "admin"
    };

    const userData = {
      intent: "createUser",
      name: formData.name,
      email: formData.email,
      role: roleMapping[formData.role] || formData.role.toLowerCase(),
      password: formData.password,
      status: formData.status
    };

    console.log("Envoi des données utilisateur:", userData);

    submit(userData, { method: "post" });
  };

  const handleCreateAnother = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      password: "",
      status: "Actif"
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Ajouter un nouvel utilisateur</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Display */}
        {actionData?.success && (
          <div className="px-6 py-3 bg-green-50 border-l-4 border-green-400 text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-medium">Utilisateur créé avec succès !</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {actionData?.error && (
          <div className="px-6 py-3 bg-red-50 border-l-4 border-red-400 text-red-700">
            <p className="text-sm">{actionData.error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              placeholder="Ex: Kofi Asante"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              placeholder="kofi.asante@email.com"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle *
            </label>
            <select
              name="role"
              required
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
            >
              <option value="">Sélectionner un rôle</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              placeholder="Au moins 6 caractères"
            />
            <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Création..." : "Créer l'utilisateur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
