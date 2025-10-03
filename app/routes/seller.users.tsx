import { useState, useEffect } from "react";
import type { MetaFunction, LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useActionData, useNavigation } from "@remix-run/react";
import { Plus, Search, Filter, Eye, Mail, Phone, AlertCircle, CheckCircle } from "lucide-react";
import AddUserModal from "~/components/admin/AddUserModal";
import ViewUserModal from "~/components/admin/ViewUserModal";
import { readToken } from "~/utils/session.server";
import SellerLayout from "~/components/seller/SellerLayout";
import { requireVendor } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Utilisateurs - Vendeur Adawi" },
    { name: "description", content: "Gestion des utilisateurs pour vendeurs" },
  ];
};

// URL de l'API corrigée
const API_BASE = "https://showroom-backend-2x3g.onrender.com";

// Types pour les données de l'API
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_banned: boolean;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface LoaderData {
  users: User[];
  error?: string;
  debug?: any;
  success?: string;
}

interface ActionData {
  success?: boolean;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  console.log("🔍 Début du loader seller.users");
  // Vérifier que l'utilisateur est vendeur
  await requireVendor(request);

  const tokenData = await readToken(request);
  console.log("🔑 Token data récupéré:", !!tokenData);

  if (!tokenData) {
    console.log("❌ Pas de token trouvé");
    throw new Response("Non autorisé", { status: 401 });
  }

  // Récupérer les paramètres de l'URL pour les messages de succès
  const url = new URL(request.url);
  const success = url.searchParams.get("success");

  try {
    // Parse le token
    let token;
    try {
      const parsedToken = typeof tokenData === 'string' ? JSON.parse(tokenData) : tokenData;
      token = parsedToken?.access_token || tokenData;
      console.log("🔑 Token extrait:", token ? `${token.substring(0, 20)}...` : "null");
    } catch (parseError) {
      console.error("❌ Erreur parsing token:", parseError);
      token = tokenData;
    }

    if (!token) {
      console.log("❌ Token vide après extraction");
      return json<LoaderData>({
        users: [],
        error: "Token invalide",
        debug: { tokenData: typeof tokenData }
      });
    }

    // Récupérer les utilisateurs
    console.log("👥 Récupération des utilisateurs...");
    console.log("🌐 URL utilisateurs:", `${API_BASE}/admin/users?skip=0&limit=1000`);

    const usersRes = await fetch(`${API_BASE}/admin/users?skip=0&limit=1000`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    console.log("👥 Réponse utilisateurs:", usersRes.status, usersRes.statusText);

    if (!usersRes.ok) {
      let errorMessage = `Erreur ${usersRes.status}: ${usersRes.statusText}`;
      let errorDetail = null;

      try {
        const errorData = await usersRes.json();
        console.log("❌ Détail erreur utilisateurs:", errorData);
        errorMessage = errorData.detail || errorData.message || errorMessage;
        errorDetail = errorData;
      } catch (e) {
        console.log("❌ Impossible de parser l'erreur JSON");
        const errorText = await usersRes.text();
        console.log("❌ Erreur texte:", errorText);
        errorDetail = errorText;
      }

      return json<LoaderData>({
        users: [],
        error: errorMessage,
        debug: {
          status: usersRes.status,
          statusText: usersRes.statusText,
          errorDetail,
          apiBase: API_BASE,
          hasToken: !!token
        }
      });
    }

    const users = await usersRes.json();
    console.log("✅ Utilisateurs récupérés:", users?.length || 0);

    return json<LoaderData>({
      users: users || [],
      error: undefined,
      success: success || undefined,
      debug: {
        usersCount: users?.length || 0,
        apiBase: API_BASE,
        hasToken: !!token
      }
    });

  } catch (error: any) {
    console.error("💥 Erreur dans le loader:", error);
    console.error("💥 Stack trace:", error.stack);

    return json<LoaderData>({
      users: [],
      error: `Erreur de connexion: ${error.message}`,
      debug: {
        errorType: error.constructor.name,
        errorMessage: error.message,
        apiBase: API_BASE,
        stack: error.stack
      }
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const tokenData = await readToken(request);
  if (!tokenData) throw new Response("Non autorisé", { status: 401 });

  const formData = await request.formData();
  const intent = String(formData.get("intent") || ""); // 👈 pour savoir quoi faire

  // --- Cas : Créer un utilisateur ---
  if (intent === "createUser") {
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const role = String(formData.get("role") || "");
    const password = String(formData.get("password") || "");
    const status = String(formData.get("status") || "");

    if (!name || !email || !role || !password) {
      return json<ActionData>({ error: "Tous les champs requis doivent être remplis" }, { status: 400 });
    }

    try {
      let token;
      try {
        const parsedToken = typeof tokenData === "string" ? JSON.parse(tokenData) : tokenData;
        token = parsedToken?.access_token || tokenData;
      } catch {
        token = tokenData;
      }

      const userData = {
        name,
        email,
        role,
        password,
        status
      };

      const response = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch { }
        return json<ActionData>({ error: errorMessage }, { status: response.status });
      }

      return json<ActionData>({ success: true });

    } catch (error: any) {
      return json<ActionData>({ error: "Erreur de connexion au serveur" }, { status: 500 });
    }
  }

  return json<ActionData>({ error: "Intent non reconnu" }, { status: 400 });
};

export default function SellerUsers() {
  const { users, error, debug, success } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const submit = useSubmit();

  const isSubmitting = navigation.state === "submitting";

  // ✅ FIX: Added null checks for user properties
  const filteredUsers = users.filter(user => {
    // Check if user properties exist and provide fallbacks
    const fullName = user.full_name || "";
    const email = user.email || "";
    const role = user.role || "";

    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || role.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const getRoleColor = (role: string) => {
    // ✅ FIX: Added null check
    if (!role) return "bg-gray-100 text-gray-800";

    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "seller":
      case "vendeur":
      case "Vendeur":
        return "bg-blue-100 text-blue-800";
      case "client":
      case "customer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    // ✅ FIX: Added null check
    if (!role) return "Non défini";

    switch (role.toLowerCase()) {
      case "admin": return "Admin";
      case "seller": return "Vendeur";
      case "client": return "Client";
      case "customer": return "Client";
      default: return role;
    }
  };

  const getStatusColor = (user: User) => {
    if (user.is_banned) return "bg-red-100 text-red-800";
    if (!user.is_active) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusLabel = (user: User) => {
    if (user.is_banned) return "Banni";
    if (!user.is_active) return "Inactif";
    return "Actif";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const generateAvatar = (name: string) => {
    // ✅ FIX: Added null check for name
    if (!name) name = "?";

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['DAA520', '8B4513', 'CD853F', 'D2691E', 'B8860B'];
    const color = colors[name.length % colors.length];
    return `https://placehold.co/40x40/${color}/FFFFFF?text=${initials}`;
  };

  return (
    <SellerLayout userName="Vendeur">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-adawi-brown">Gestion des Utilisateurs</h1>
            <p className="text-gray-600">Ajoutez et consultez les utilisateurs</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un utilisateur
          </button>
        </div>

        {/* Success Message */}
        {(success || actionData?.success) && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700 font-medium">
                {success || "Utilisateur créé avec succès"}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {(error || actionData?.error) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-red-700 font-medium">{error || actionData?.error}</p>
                {debug && (
                  <details className="mt-2">
                    <summary className="text-red-600 text-sm cursor-pointer">Détails techniques</summary>
                    <pre className="text-xs text-red-600 mt-2 overflow-auto bg-red-100 p-2 rounded">
                      {JSON.stringify(debug, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Total Utilisateurs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => {
                    const role = u.role || "";
                    return role.toLowerCase() === "client" || role.toLowerCase() === "customer";
                  }).length}
                </p>
                <p className="text-sm text-gray-600">Clients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => {
                    const role = u.role || "";
                    return role.toLowerCase() === "seller" || role.toLowerCase() === "vendeur";
                  }).length}
                </p>
                <p className="text-sm text-gray-600">Vendeurs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="sm:w-48">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              >
                <option value="all">Tous les rôles</option>
                <option value="client">Clients</option>
                <option value="seller">Vendeurs</option>
                <option value="admin">Administrateurs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!error && users.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter votre premier utilisateur.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold-light transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un utilisateur
            </button>
          </div>
        )}

        {/* Users Table */}
        {!error && users.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rôle</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date d'inscription</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <img
                            src={generateAvatar(user.full_name || "")}
                            alt={user.full_name || "User"}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name || "Nom non disponible"}</p>
                            <p className="text-sm text-gray-500">ID: {user.id ? user.id.slice(-8) : "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {user.email || "Email non disponible"}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user)}`}>
                          {getStatusLabel(user)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Voir détails"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!error && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredUsers.length}</span> sur <span className="font-medium">{users.length}</span> utilisateurs
            </p>

            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Précédent
              </button>
              <button className="px-3 py-2 text-sm bg-adawi-gold text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />

        <ViewUserModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          user={selectedUser}
        />

      </div>
    </SellerLayout>
  );
}
