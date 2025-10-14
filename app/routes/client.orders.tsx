import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import ClientLayout from "~/components/client/ClientLayout";
import OrderDetailsModal from "~/components/client/OrderDetailsModal";
import { Eye, Download, Package, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { readToken } from "~/utils/session.server";
import { API_BASE } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Mes Commandes - Adawi" },
    { name: "description", content: "Historique de vos commandes" },
  ];
};

// Types pour les données de l'API
interface OrderItem {
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  name: string;
}

interface Address {
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  address: Address;
  total: number;
  status: string;
  payment_status: string;
  status_history: any[];
  payment_method: string;
  delivery_method: string;
  delivery_status: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface LoaderData {
  orders: Order[];
  user: User | null;
  token: string | null; // Ajouter le token
  error?: string;
  debug?: any;
}

export const loader: LoaderFunction = async ({ request }) => {
  console.log("🔍 Début du loader client.orders");

  const tokenData = await readToken(request);
  console.log("🔑 Token data récupéré:", !!tokenData);

  if (!tokenData) {
    console.log("❌ Pas de token trouvé");
    throw new Response("Non autorisé", { status: 401 });
  }

  try {
    // Parse le token si c'est une string JSON
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
        orders: [],
        user: null,
        token: null,
        error: "Token invalide",
        debug: { tokenData: typeof tokenData }
      });
    }

    // Récupérer les informations de l'utilisateur
    console.log("👤 Récupération des infos utilisateur...");
    console.log("🌐 URL utilisateur:", `${API_BASE}/auth/me`);

    const userRes = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    console.log("👤 Réponse utilisateur:", userRes.status, userRes.statusText);

    let user = null;
    if (userRes.ok) {
      user = await userRes.json();
      console.log("✅ Utilisateur récupéré:", user?.email);
    } else {
      console.log("❌ Erreur récupération utilisateur:", userRes.status);
      const errorText = await userRes.text();
      console.log("❌ Détail erreur utilisateur:", errorText);
    }

    // Récupérer les commandes
    console.log("📦 Récupération des commandes...");
    console.log("🌐 URL commandes:", `${API_BASE}/orders/`);

    const ordersRes = await fetch(`${API_BASE}/orders/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    console.log("📦 Réponse commandes:", ordersRes.status, ordersRes.statusText);

    if (!ordersRes.ok) {
      let errorMessage = `Erreur ${ordersRes.status}: ${ordersRes.statusText}`;
      let errorDetail = null;

      try {
        const errorData = await ordersRes.json();
        console.log("❌ Détail erreur commandes:", errorData);
        errorMessage = errorData.detail || errorData.message || errorMessage;
        errorDetail = errorData;
      } catch (e) {
        console.log("❌ Impossible de parser l'erreur JSON");
        const errorText = await ordersRes.text();
        console.log("❌ Erreur texte:", errorText);
        errorDetail = errorText;
      }

      return json<LoaderData>({
        orders: [],
        user,
        token: tokenData, // Passer le token même en cas d'erreur
        error: errorMessage,
        debug: {
          status: ordersRes.status,
          statusText: ordersRes.statusText,
          errorDetail,
          apiBase: API_BASE,
          hasToken: !!token
        }
      });
    }

    const orders = await ordersRes.json();
    console.log("✅ Commandes récupérées:", orders?.length || 0);

    return json<LoaderData>({
      orders: orders || [],
      user,
      token: tokenData, // Passer le token
      error: undefined,
      debug: {
        ordersCount: orders?.length || 0,
        apiBase: API_BASE,
        hasToken: !!token,
        userEmail: user?.email
      }
    });

  } catch (error: any) {
    console.error("💥 Erreur dans le loader:", error);
    console.error("💥 Stack trace:", error.stack);

    return json<LoaderData>({
      orders: [],
      user: null,
      token: null,
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

export default function ClientOrders() {
  const { orders, user, error, debug, token } = useLoaderData<LoaderData>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const generateInvoicePDF = (order: Order, user: User | null) => {
    // Créer le contenu HTML de la facture
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Facture ${order.id}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            color: #333;
            line-height: 1.6;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #DAA520;
            padding-bottom: 20px;
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #8B4513;
          }
          .invoice-info { 
            text-align: right; 
          }
          .invoice-number { 
            font-size: 18px; 
            font-weight: bold; 
            color: #DAA520;
          }
          .section { 
            margin: 20px 0; 
          }
          .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #8B4513; 
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .customer-info, .order-info { 
            background: #f9f9f9; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 10px 0;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
          }
          .items-table th, .items-table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left;
          }
          .items-table th { 
            background-color: #8B4513; 
            color: white; 
            font-weight: bold;
          }
          .items-table tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          .total-section { 
            text-align: right; 
            margin-top: 20px;
            padding: 15px;
            background: #f0f0f0;
            border-radius: 5px;
          }
          .total-amount { 
            font-size: 20px; 
            font-weight: bold; 
            color: #8B4513;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          /* Badges Statuts */
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
          }
          .status-payee { background: #d4edda; color: #155724; }    /* paiement ok = vert */
          .status-enattente { background: #fff3cd; color: #856404; }
          .status-en_cours, .status-processing { background: #cce7ff; color: #004085; }
          .status-livree { background: #d4edda; color: #155724; }   /* livraison ok = vert */
          .status-annulee { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ADAWI</div>
          <div class="invoice-info">
            <div class="invoice-number">Facture #${order.id.slice(-8)}</div>
            <div>Date: ${formatDate(order.created_at)}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Informations Client</div>
          <div class="customer-info">
            <strong>${user?.full_name || 'Client'}</strong><br>
            ${user?.email || ''}<br>
            ${order.address.street}<br>
            ${order.address.postal_code} ${order.address.city}<br>
            ${order.address.country}<br>
            ${order.address.phone ? `Tél: ${order.address.phone}` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Informations Commande</div>
          <div class="order-info">
            <div><strong>Numéro de commande:</strong> ${order.id}</div>
            <div><strong>Date de commande:</strong> ${formatDate(order.created_at)}</div>
            <div><strong>Statut commande:</strong> 
              <span class="status-badge status-${order.status.toLowerCase().replace(/[^a-z]/g, '')}">
                ${getStatusLabel(order.status)}
              </span>
            </div>
            <div><strong>Statut paiement:</strong> 
              <span class="status-badge status-${order.payment_status.toLowerCase().replace(/[^a-z]/g, '')}">
                ${order.payment_status === 'payee' ? 'Payée' : order.payment_status}
              </span>
            </div>
            ${order.payment_method ? `<div><strong>Méthode de paiement:</strong> ${order.payment_method}</div>` : ''}
            ${order.delivery_method ? `<div><strong>Méthode de livraison:</strong> ${order.delivery_method}</div>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Articles Commandés</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Détails</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>
                    ${item.size ? `Taille: ${item.size}` : ''}
                    ${item.size && item.color ? '<br>' : ''}
                    ${item.color ? `Couleur: ${item.color}` : ''}
                  </td>
                  <td>${item.quantity}</td>
                  <td>${formatPrice(item.price / item.quantity)}</td>
                  <td>${formatPrice(item.price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <div class="total-amount">Total: ${formatPrice(order.total)}</div>
        </div>
        <div class="footer">
          <p>Merci pour votre commande !</p>
          <p>ADAWI - Votre boutique de mode</p>
          <p>Pour toute question, contactez-nous à support@adawi.com</p>
        </div>
      </body>
      </html>
    `;

    return invoiceHTML;
  };

  const handleDownloadInvoice = async (order: Order) => {
    setDownloadingInvoice(order.id);

    try {
      // Générer le HTML de la facture
      const invoiceHTML = generateInvoicePDF(order, user);

      // Créer un blob avec le contenu HTML
      const blob = new Blob([invoiceHTML], { type: 'text/html' });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${order.id.slice(-8)}.html`;

      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nettoyer l'URL
      window.URL.revokeObjectURL(url);

      // Alternative: Ouvrir dans une nouvelle fenêtre pour impression
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();

        // Attendre que le contenu soit chargé puis déclencher l'impression
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }

    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error);
      alert('Erreur lors de la génération de la facture. Veuillez réessayer.');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "livree":
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "en_cours":
      case "en cours":
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "en_preparation":
      case "en préparation":
      case "preparing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "annulee":
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      case "en_attente":
      case "en attente":
      case "pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "en_cours": return "En cours";
      case "en_preparation": return "En préparation";
      case "en_attente": return "En attente";
      case "delivered": return "Livré";
      case "cancelled": return "Annulé";
      case "processing": return "En traitement";
      case "preparing": return "En préparation";
      case "pending": return "En attente";
      default: return status;
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  };

  return (
    <ClientLayout userName={user?.full_name}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header - Responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-adawi-brown mb-2">
              Mes Commandes
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Consultez l'historique et le statut de vos commandes
            </p>
          </div>

          {/* Error Message - Responsive */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-red-700 font-medium break-words">{error}</p>
                  {debug && (
                    <details className="mt-2">
                      <summary className="text-red-600 text-sm cursor-pointer">Détails techniques</summary>
                      <pre className="text-xs text-red-600 mt-2 overflow-auto bg-red-100 p-2 rounded max-w-full">
                        {JSON.stringify(debug, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State - Responsive */}
          {!error && orders.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune commande trouvée
              </h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Vous n'avez pas encore passé de commande.
              </p>
              <a
                href="/boutique"
                className="inline-flex items-center px-6 py-3 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold-light transition-colors text-sm sm:text-base"
              >
                Découvrir nos produits
              </a>
            </div>
          )}

          {/* Orders List - Responsive Grid */}
          {!error && orders.length > 0 && (
            <div className="grid gap-4 sm:gap-6">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Order Header - Mobile Optimized */}
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        {/* Left section - Order info */}
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="p-2 sm:p-3 bg-adawi-beige rounded-lg flex-shrink-0">
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-adawi-brown" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                              #{order.id.slice(-8)}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Right section - Status and Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(order.status)} text-center sm:text-left`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <div className="text-center sm:text-right">
                            <p className="text-lg sm:text-xl font-bold text-adawi-brown">
                              {formatPrice(order.total)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {order.items.length} article(s)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Toggle Button */}
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="mt-4 sm:hidden w-full flex items-center justify-center space-x-2 p-2 text-sm text-gray-600 bg-gray-50 rounded-lg"
                      >
                        <span>{isExpanded ? 'Masquer les détails' : 'Voir les détails'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expandable Content - Always shown on desktop, toggleable on mobile */}
                    <div className={`${isExpanded ? 'block' : 'hidden'} sm:block border-t border-gray-200`}>
                      {/* Order Items - Responsive */}
                      <div className="p-4 sm:p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Articles commandés :</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 min-w-0">
                                <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                  <span className="bg-white px-2 py-1 rounded">x{item.quantity}</span>
                                  {item.size && <span className="bg-white px-2 py-1 rounded">Taille: {item.size}</span>}
                                  {item.color && <span className="bg-white px-2 py-1 rounded">Couleur: {item.color}</span>}
                                </div>
                              </div>
                              <span className="text-sm font-medium text-adawi-brown self-end sm:self-auto">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Address - Responsive */}
                      {order.address && (
                        <div className="px-4 sm:px-6 pb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Adresse de livraison :</h4>
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <p className="break-words">{order.address.street}</p>
                            <p>{order.address.postal_code} {order.address.city}</p>
                            <p>{order.address.country}</p>
                            {order.address.phone && <p>Tél: {order.address.phone}</p>}
                          </div>
                        </div>
                      )}

                      {/* Payment and Delivery Info - Responsive Grid */}
                      <div className="px-4 sm:px-6 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-700 block mb-1">Paiement:</span>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${ 
                              order.payment_status === 'paid' || order.payment_status === 'effectue' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {order.payment_status === 'en_attente' ? 'En attente' : 
                               order.payment_status === 'paid' ? 'Payé' : order.payment_status}
                            </span>
                          </div>
                          {order.payment_method && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="font-medium text-gray-700 block mb-1">Méthode:</span>
                              <span className="text-gray-600 break-words">{order.payment_method}</span>
                            </div>
                          )}
                          {order.delivery_method && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="font-medium text-gray-700 block mb-1">Livraison:</span>
                              <span className="text-gray-600 break-words">{order.delivery_method}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Actions - Responsive */}
                      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                          <button 
                            onClick={() => handleViewDetails(order)}
                            className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Détails complets</span>
                          </button>
                          <button 
                            onClick={() => handleDownloadInvoice(order)}
                            disabled={downloadingInvoice === order.id}
                            className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-adawi-brown bg-adawi-beige border border-adawi-gold rounded-lg hover:bg-adawi-beige-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingInvoice === order.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-adawi-brown border-t-transparent rounded-full animate-spin" />
                                <span>Génération...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>Télécharger facture</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats Summary - Mobile Optimized */}
          {!error && orders.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-adawi-brown">{orders.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Commandes</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'livree' || o.status === 'delivered').length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Livrées</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {orders.filter(o => o.status === 'en_cours' || o.status === 'processing').length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">En cours</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-adawi-brown">
                    {formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Total</div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de détails - Passer le token depuis le loader */}
          {selectedOrder && (
            <OrderDetailsModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              order={selectedOrder}
              token={token} // Passer le token depuis le loader
              onAuthError={() => {
                // Rediriger vers la page de connexion ou afficher un message
                window.location.href = '/login';
              }}
            />
          )}
        </div>
      </div>
    </ClientLayout>
  );
}