import { useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Package, Truck, Calendar, User, CreditCard, AlertCircle } from "lucide-react";
import ViewOrderModal from "~/components/admin/ViewOrderModal";
import UpdateStatusModal from "~/components/admin/UpdateStatusModal";

export const meta: MetaFunction = () => {
  return [
    { title: "Commandes - Adawi Admin" },
    { name: "description", content: "Gestion des commandes" },
  ];
};

// Définir une interface pour le type Order
export interface Order {
  id: number;
  orderNumber: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  date: string;
  total: string;
  totalValue: number;
  status: string;
  paymentMethod: string;
  items: Array<{
    id: number;
    productId: number;
    name: string;
    price: string;
    quantity: number;
    image: string;
    size?: string;
    color?: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function AdminOrders() {
  // États pour les modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  
  // État pour les filtres
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Données simulées des commandes
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      orderNumber: "CMD-001-2024",
      customer: {
        id: 101,
        name: "Kofi Asante",
        email: "kofi.asante@email.com",
        phone: "+228 90 12 34 56"
      },
      date: "2024-01-20",
      total: "45000 FCFA",
      totalValue: 45000,
      status: "Livré",
      paymentMethod: "Paiement à la livraison",
      items: [
        {
          id: 1001,
          productId: 1,
          name: "T-shirt Premium Homme",
          price: "15000 FCFA",
          quantity: 2,
          image: "/5.png",
          size: "XL",
          color: "Noir"
        },
        {
          id: 1002,
          productId: 3,
          name: "Montre Classique",
          price: "15000 FCFA",
          quantity: 1,
          image: "/mont.png"
        }
      ],
      shippingAddress: {
        street: "123 Rue Principale",
        city: "Lomé",
        state: "Maritime",
        zipCode: "00000",
        country: "Togo"
      }
    },
    {
      id: 2,
      orderNumber: "CMD-002-2024",
      customer: {
        id: 102,
        name: "Ama Mensah",
        email: "ama.mensah@email.com",
        phone: "+228 91 23 45 67"
      },
      date: "2024-01-18",
      total: "18000 FCFA",
      totalValue: 18000,
      status: "En cours de livraison",
      paymentMethod: "Carte bancaire",
      items: [
        {
          id: 1003,
          productId: 2,
          name: "Robe Élégante Femme",
          price: "18000 FCFA",
          quantity: 1,
          image: "/5.png",
          size: "M",
          color: "Rouge"
        }
      ],
      shippingAddress: {
        street: "45 Avenue de l'Indépendance",
        city: "Lomé",
        state: "Maritime",
        zipCode: "00000",
        country: "Togo"
      }
    },
    {
      id: 3,
      orderNumber: "CMD-003-2024",
      customer: {
        id: 103,
        name: "Kwame Nkrumah",
        email: "kwame.nkrumah@email.com",
        phone: "+228 92 34 56 78"
      },
      date: "2024-01-15",
      total: "38500 FCFA",
      totalValue: 38500,
      status: "En préparation",
      paymentMethod: "Mobile Money",
      items: [
        {
          id: 1004,
          productId: 4,
          name: "T-shirt Enfant",
          price: "3500 FCFA",
          quantity: 1,
          image: "/9.png",
          size: "5-6",
          color: "Bleu"
        },
        {
          id: 1005,
          productId: 3,
          name: "Montre Classique",
          price: "35000 FCFA",
          quantity: 1,
          image: "/mont.png"
        }
      ],
      shippingAddress: {
        street: "78 Rue du Commerce",
        city: "Kpalimé",
        state: "Plateaux",
        zipCode: "00000",
        country: "Togo"
      }
    },
    {
      id: 4,
      orderNumber: "CMD-004-2024",
      customer: {
        id: 104,
        name: "Akosua Osei",
        email: "akosua.osei@email.com",
        phone: "+228 93 45 67 89"
      },
      date: "2024-01-10",
      total: "15000 FCFA",
      totalValue: 15000,
      status: "Annulé",
      paymentMethod: "Carte bancaire",
      items: [
        {
          id: 1006,
          productId: 1,
          name: "T-shirt Premium Homme",
          price: "15000 FCFA",
          quantity: 1,
          image: "/5.png",
          size: "L",
          color: "Blanc"
        }
      ],
      shippingAddress: {
        street: "12 Rue des Fleurs",
        city: "Lomé",
        state: "Maritime",
        zipCode: "00000",
        country: "Togo"
      }
    },
    {
      id: 5,
      orderNumber: "CMD-005-2024",
      customer: {
        id: 105,
        name: "Efua Adjei",
        email: "efua.adjei@email.com",
        phone: "+228 95 67 89 01"
      },
      date: "2024-01-05",
      total: "53000 FCFA",
      totalValue: 53000,
      status: "Livré",
      paymentMethod: "Mobile Money",
      items: [
        {
          id: 1007,
          productId: 2,
          name: "Robe Élégante Femme",
          price: "18000 FCFA",
          quantity: 1,
          image: "/5.png",
          size: "S",
          color: "Noir"
        },
        {
          id: 1008,
          productId: 3,
          name: "Montre Classique",
          price: "35000 FCFA",
          quantity: 1,
          image: "/mont.png"
        }
      ],
      shippingAddress: {
        street: "34 Avenue de la Paix",
        city: "Sokodé",
        state: "Centrale",
        zipCode: "00000",
        country: "Togo"
      }
    }
  ]);

  // Filtrage des commandes
  const filteredOrders = orders.filter(order => {
    // Filtre de recherche
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre de statut
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    // Filtre de date
    let matchesDate = true;
    const orderDate = new Date(order.date);
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    if (dateFilter === "today") {
      matchesDate = orderDate.toDateString() === today.toDateString();
    } else if (dateFilter === "week") {
      matchesDate = orderDate >= sevenDaysAgo;
    } else if (dateFilter === "month") {
      matchesDate = orderDate >= thirtyDaysAgo;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Fonctions pour gérer les commandes
  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setIsUpdateStatusModalOpen(false);
  };

  // Fonctions pour ouvrir les modals
  const openViewModal = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const openUpdateStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateStatusModalOpen(true);
  };

  // Fonction pour obtenir l'icône et la couleur du statut
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Livré":
        return { 
          icon: <CheckCircle className="w-4 h-4" />, 
          color: "bg-green-100 text-green-800" 
        };
      case "En cours de livraison":
        return { 
          icon: <Truck className="w-4 h-4" />, 
          color: "bg-blue-100 text-blue-800" 
        };
      case "En préparation":
        return { 
          icon: <Package className="w-4 h-4" />, 
          color: "bg-yellow-100 text-yellow-800" 
        };
      case "En attente":
        return { 
          icon: <Clock className="w-4 h-4" />, 
          color: "bg-gray-100 text-gray-800" 
        };
      case "Annulé":
        return { 
          icon: <XCircle className="w-4 h-4" />, 
          color: "bg-red-100 text-red-800" 
        };
      default:
        return { 
          icon: <AlertCircle className="w-4 h-4" />, 
          color: "bg-gray-100 text-gray-800" 
        };
    }
  };

  // Fonction pour effacer la recherche
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-adawi-brown">Gestion des Commandes</h1>
        <p className="text-gray-600">Suivez et gérez les commandes de vos clients</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-sm text-gray-600">Total Commandes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === "Livré").length}</p>
              <p className="text-sm text-gray-600">Commandes Livrées</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => ["En préparation", "En cours de livraison"].includes(o.status)).length}
              </p>
              <p className="text-sm text-gray-600">En Traitement</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === "Annulé").length}
              </p>
              <p className="text-sm text-gray-600">Commandes Annulées</p>
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
                placeholder="Rechercher par numéro de commande, nom ou email du client..."
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
                  <XCircle className="w-5 h-5" />
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
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="Livré">Livré</option>
                <option value="En cours de livraison">En cours de livraison</option>
                <option value="En préparation">En préparation</option>
                <option value="En attente">En attente</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Période
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              >
                <option value="all">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Commande</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Paiement</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">{order.items.length} article(s)</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.customer.name}</p>
                            <p className="text-sm text-gray-500">{order.customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <Calendar className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(order.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {order.total}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          {statusInfo.icon}
                          <span className="ml-1">{order.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                          </div>
                          <p className="text-sm text-gray-700">{order.paymentMethod}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openViewModal(order)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openUpdateStatusModal(order)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Mettre à jour le statut"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="w-12 h-12 text-gray-300 mb-2" />
                      <p>Aucune commande trouvée</p>
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
          Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredOrders.length}</span> sur <span className="font-medium">{orders.length}</span> commandes
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

      {/* View Order Modal */}
      {selectedOrder && (
        <ViewOrderModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          order={selectedOrder}
        />
      )}

      {/* Update Status Modal */}
      {selectedOrder && (
        <UpdateStatusModal
          isOpen={isUpdateStatusModalOpen}
          onClose={() => setIsUpdateStatusModalOpen(false)}
          order={selectedOrder}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
