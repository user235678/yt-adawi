import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import ClientLayout from "~/components/client/ClientLayout";
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { readToken } from "~/utils/session.server";
import { API_BASE } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Support - Adawi" },
    { name: "description", content: "Centre d'aide et tickets de support" },
  ];
};

// Types pour les données de l'API
interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  order_id?: string;
  product_id?: string;
  customer_id: string;
  customer_name: string;
  assigned_to?: string;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  messages_count: number;
  last_message_at?: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface LoaderData {
  tickets: Ticket[];
  orders: Order[];
  user: User | null;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const tokenData = await readToken(request);

  if (!tokenData) {
    throw new Response("Non autorisé", { status: 401 });
  }

  try {
    // Parse le token
    const parsedToken = typeof tokenData === 'string' ? JSON.parse(tokenData) : tokenData;
    const token = parsedToken?.access_token || tokenData;

    // Récupérer les informations de l'utilisateur
    const userRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    let user = null;
    if (userRes.ok) {
      user = await userRes.json();
    }

    // Récupérer les tickets - URL corrigée
    const ticketsRes = await fetch(`${API_BASE}/support/tickets`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    let tickets = [];
    if (ticketsRes.ok) {
      tickets = await ticketsRes.json();
    }

    // Récupérer les commandes pour le dropdown
    const ordersRes = await fetch(`${API_BASE}/orders/`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    let orders = [];
    if (ordersRes.ok) {
      orders = await ordersRes.json();
    }

    return json<LoaderData>({ 
      tickets: tickets || [], 
      orders: orders || [],
      user,
      error: undefined 
    });

  } catch (error: any) {
    console.error("Erreur lors de la récupération des tickets:", error);
    
    return json<LoaderData>({ 
      tickets: [], 
      orders: [],
      user: null,
      error: "Erreur de connexion au serveur" 
    });
  }
};

export default function ClientTickets() {
  const { tickets, orders, user, error } = useLoaderData<LoaderData>();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ouvert": 
      case "open": 
        return <AlertCircle className="w-4 h-4" />;
      case "en_cours":
      case "en cours": 
      case "in_progress": 
        return <Clock className="w-4 h-4" />;
      case "résolu": 
      case "resolu":
      case "resolved": 
      case "fermé":
      case "ferme":
      case "closed": 
        return <CheckCircle className="w-4 h-4" />;
      default: 
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ouvert": 
      case "open": 
        return "text-red-600 bg-red-50 border-red-200";
      case "en_cours":
      case "en cours": 
      case "in_progress": 
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "résolu": 
      case "resolu":
      case "resolved": 
      case "fermé":
      case "ferme":
      case "closed": 
        return "text-green-600 bg-green-50 border-green-200";
      default: 
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "haute": 
      case "high": 
        return "text-red-600 bg-red-50";
      case "moyenne": 
      case "normal": 
      case "normale": 
        return "text-yellow-600 bg-yellow-50";
      case "basse": 
      case "low": 
        return "text-green-600 bg-green-50";
      default: 
        return "text-gray-600 bg-gray-50";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "commande": return "Commande";
      case "livraison": return "Livraison";
      case "produit": return "Produit";
      case "paiement": return "Paiement";
      case "technique": return "Technique";
      case "autre": return "Autre";
      default: return category;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <ClientLayout userName={user?.full_name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-adawi-brown mb-2">
              Centre de Support
            </h1>
            <p className="text-gray-600">
              Créez et suivez vos demandes d'assistance
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-adawi-gold hover:bg-adawi-gold-light text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Ticket</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Create Ticket Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-adawi-brown mb-4">
              Créer un nouveau ticket
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  placeholder="Décrivez brièvement votre problème"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="commande">Commande</option>
                    <option value="livraison">Livraison</option>
                    <option value="produit">Produit</option>
                    <option value="paiement">Paiement</option>
                    <option value="technique">Technique</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité *
                  </label>
                  <select
                    name="priority"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  >
                    <option value="">Sélectionner une priorité</option>
                    <option value="basse">Basse</option>
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commande associée (optionnel)
                </label>
                <select
                  name="order_id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                >
                  <option value="">Aucune commande</option>
                  {orders && orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      #{order.id.slice(-8)} - {formatDate(order.created_at)} - {formatPrice(order.total)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                  placeholder="Décrivez votre problème en détail..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold-light transition-colors"
                >
                  Créer le ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty State */}
        {!error && (!tickets || tickets.length === 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun ticket trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore créé de ticket de support.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-6 py-3 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold-light transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer mon premier ticket
            </button>
          </div>
        )}

        {/* Tickets List */}
        {!error && tickets && tickets.length > 0 && (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-adawi-beige rounded-lg">
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">#{ticket.id.slice(-8)}</h3>
                      <p className="text-gray-600 font-medium">{ticket.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Catégorie: {getCategoryLabel(ticket.category)}
                        {ticket.order_id && ` • Commande: #${ticket.order_id.slice(-8)}`}
                        {ticket.messages_count > 0 && ` • ${ticket.messages_count} message${ticket.messages_count > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 text-sm">{ticket.description}</p>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Créé le {formatDate(ticket.created_at)}</span>
                  <div className="flex space-x-4">
                    {ticket.last_message_at && (
                      <span>Dernier message: {formatDate(ticket.last_message_at)}</span>
                    )}
                    <span>Mise à jour: {formatDate(ticket.updated_at)}</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button className="text-adawi-brown hover:text-adawi-gold font-medium transition-colors">
                    Voir les détails →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
