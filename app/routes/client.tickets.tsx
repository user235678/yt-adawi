import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import ClientLayout from "~/components/client/ClientLayout";
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { readToken } from "~/utils/session.server";

export const meta: MetaFunction = () => [
  { title: "Support - Adawi" },
  { name: "description", content: "Centre d'aide et tickets de support" },
];

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  order_id?: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
  last_message_at?: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface LoaderData {
  tickets: Ticket[];
  orders: Order[];
  user: User | null;
  token: string;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const tokenData = await readToken(request);
    if (!tokenData) throw new Response("Non autorisé", { status: 401 });

    const token = typeof tokenData === "string"
      ? (() => { 
          try { return JSON.parse(tokenData)?.access_token || tokenData } 
          catch { return tokenData } 
        })()
      : tokenData;

    if (!token) throw new Response("Token invalide", { status: 401 });

    const [userRes, ticketsRes, ordersRes] = await Promise.all([
      fetch("https://showroom-backend-2x3g.onrender.com/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("https://showroom-backend-2x3g.onrender.com/support/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("https://showroom-backend-2x3g.onrender.com/orders/", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const user = userRes.ok ? await userRes.json() : null;
    const tickets = ticketsRes.ok ? await ticketsRes.json() : [];
    const orders = ordersRes.ok ? await ordersRes.json() : [];

    return json<LoaderData>({ tickets, orders, user, token });
  } catch (err: any) {
    console.error("Erreur loader tickets:", err);
    return json<LoaderData>({
      tickets: [],
      orders: [],
      user: null,
      token: "",
      error: err.message || "Erreur serveur",
    });
  }
};

export default function ClientTickets() {
  const { tickets, orders, user, token, error } = useLoaderData<LoaderData>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "commande",
    priority: "normale",
    order_id: orders.length > 0 ? orders[0].id : "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticketsList, setTicketsList] = useState<Ticket[]>(tickets);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("https://showroom-backend-2x3g.onrender.com/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        setSubmitError(errData.detail?.[0]?.msg || "Erreur lors de la création du ticket");
      } else {
        const newTicket = await res.json();
        setTicketsList([newTicket, ...ticketsList]);
        setShowCreateForm(false);
        setFormData({ title: "", description: "", category: "commande", priority: "normale", order_id: orders.length > 0 ? orders[0].id : "" });
      }
    } catch (err: any) {
      setSubmitError(err.message || "Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ouvert": case "open": return <AlertCircle className="w-4 h-4" />;
      case "en_cours": case "en cours": case "in_progress": return <Clock className="w-4 h-4" />;
      case "résolu": case "resolu": case "resolved": case "fermé": case "closed": return <CheckCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ouvert": case "open": return "text-red-600 bg-red-50 border-red-200";
      case "en_cours": case "in_progress": return "text-blue-600 bg-blue-50 border-blue-200";
      case "résolu": case "resolved": case "fermé": case "closed": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "haute": return "text-red-600 bg-red-50";
      case "normale": return "text-yellow-600 bg-yellow-50";
      case "basse": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
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

  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString("fr-FR") : "N/A";

  return (
    <ClientLayout userName={user?.full_name}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-adawi-brown mb-2">Centre de Support</h1>
            <p className="text-gray-600">Créez et suivez vos demandes d'assistance</p>
          </div>
          <button onClick={() => setShowCreateForm(true)} className="bg-adawi-gold hover:bg-adawi-gold-light text-white px-6 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nouveau Ticket</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
              <h2 className="text-lg font-semibold text-adawi-brown mb-4">Créer un nouveau ticket</h2>

              {submitError && <p className="text-red-600 mb-2">{submitError}</p>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titre</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2">
                    <option value="commande">Commande</option>
                    <option value="livraison">Livraison</option>
                    <option value="produit">Produit</option>
                    <option value="paiement">Paiement</option>
                    <option value="technique">Technique</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Priorité</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2">
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                    <option value="basse">Basse</option>
                  </select>
                </div>

                {orders.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Commande associée</label>
                    <select name="order_id" value={formData.order_id} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2">
                      {orders.map(order => (
                        <option key={order.id} value={order.id}>#{order.id.slice(-8)} - {new Date(order.created_at).toLocaleDateString()}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-gray-100 rounded">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-adawi-gold text-white rounded">{submitting ? "Création..." : "Créer"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {ticketsList.length === 0 && !error && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Aucun ticket trouvé</h3>
            <p className="text-gray-600">Vous n'avez pas encore créé de ticket.</p>
          </div>
        )}

        {ticketsList.length > 0 && (
          <div className="space-y-4">
            {ticketsList.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-adawi-beige rounded">{getStatusIcon(ticket.status)}</div>
                    <div>
                      <h3 className="font-semibold">#{ticket.id.slice(-8)} - {ticket.title}</h3>
                      <p className="text-sm text-gray-600">{ticket.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getCategoryLabel(ticket.category)}
                        {ticket.order_id && ` • Commande #${ticket.order_id.slice(-8)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Créé le {formatDate(ticket.created_at)} • {ticket.messages_count} message(s)
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
