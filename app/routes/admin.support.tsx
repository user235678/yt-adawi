import { useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Search, Filter, Eye, MessageCircle, CheckCircle, XCircle, Clock, AlertCircle, X, User } from "lucide-react";
import ViewTicketModal from "~/components/admin/ViewTicketModal";
import UpdateTicketModal from "~/components/admin/UpdateTicketModal";

export const meta: MetaFunction = () => {
  return [
    { title: "Support - Adawi Admin" },
    { name: "description", content: "Gestion des tickets de support" },
  ];
};

// Définir une interface pour le type Ticket
export interface Ticket {
  id: number;
  ticketNumber: string;
  subject: string;
  message: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  date: string;
  status: string;
  priority: string;
  category: string;
  responses: Array<{
    id: number;
    message: string;
    date: string;
    isAdmin: boolean;
    author: string;
    authorAvatar?: string;
  }>;
}

export default function AdminSupport() {
  // États pour les modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  
  // État pour les filtres
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Données simulées des tickets
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 1,
      ticketNumber: "TKT-001-2024",
      subject: "Problème de livraison",
      message: "Bonjour, ma commande CMD-001-2024 devait être livrée hier mais je n'ai toujours rien reçu. Pouvez-vous me donner des informations sur le statut de ma livraison ?",
      customer: {
        id: 101,
        name: "Kofi Asante",
        email: "kofi.asante@email.com",
        phone: "+228 90 12 34 56",
        avatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=KA"
      },
      date: "2024-01-20",
      status: "Ouvert",
      priority: "Élevée",
      category: "Livraison",
      responses: []
    },
    {
      id: 2,
      ticketNumber: "TKT-002-2024",
      subject: "Demande de remboursement",
      message: "J'ai reçu un produit endommagé et je souhaite être remboursé. J'ai déjà envoyé des photos par email mais je n'ai pas eu de réponse.",
      customer: {
        id: 102,
        name: "Ama Mensah",
        email: "ama.mensah@email.com",
        phone: "+228 91 23 45 67",
        avatar: "https://placehold.co/40x40/8B4513/FFFFFF?text=AM"
      },
      date: "2024-01-18",
      status: "En cours",
      priority: "Normale",
      category: "Remboursement",
      responses: [
        {
          id: 101,
          message: "Bonjour, pourriez-vous nous fournir le numéro de commande concerné ? Merci.",
          date: "2024-01-18",
          isAdmin: true,
          author: "Support Adawi",
          authorAvatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=SA"
        },
        {
          id: 102,
          message: "Bien sûr, il s'agit de la commande CMD-002-2024.",
          date: "2024-01-19",
          isAdmin: false,
          author: "Ama Mensah",
          authorAvatar: "https://placehold.co/40x40/8B4513/FFFFFF?text=AM"
        }
      ]
    },
    {
      id: 3,
      ticketNumber: "TKT-003-2024",
      subject: "Question sur la taille",
      message: "Je souhaite acheter une robe mais je ne suis pas sûre de la taille à choisir. Je mesure 1m65 et je pèse 60kg. Quelle taille me conseillez-vous ?",
      customer: {
        id: 103,
        name: "Efua Adjei",
        email: "efua.adjei@email.com",
        phone: "+228 95 67 89 01",
        avatar: "https://placehold.co/40x40/8B4513/FFFFFF?text=EA"
      },
      date: "2024-01-15",
      status: "Résolu",
      priority: "Basse",
      category: "Produit",
      responses: [
        {
          id: 103,
          message: "Bonjour, pour votre taille et votre poids, je vous recommande une taille M. N'hésitez pas à consulter notre guide des tailles pour plus de détails.",
          date: "2024-01-16",
          isAdmin: true,
          author: "Support Adawi",
          authorAvatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=SA"
        },
        {
          id: 104,
          message: "Merci beaucoup pour votre réponse rapide ! Je vais commander la taille M.",
          date: "2024-01-16",
          isAdmin: false,
          author: "Efua Adjei",
          authorAvatar: "https://placehold.co/40x40/8B4513/FFFFFF?text=EA"
        },
        {
          id: 105,
          message: "Parfait ! N'hésitez pas si vous avez d'autres questions.",
          date: "2024-01-17",
          isAdmin: true,
          author: "Support Adawi",
          authorAvatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=SA"
        }
      ]
    },
    {
      id: 4,
      ticketNumber: "TKT-004-2024",
      subject: "Problème technique sur le site",
      message: "Je n'arrive pas à finaliser ma commande. Quand je clique sur 'Payer', j'obtiens une erreur 404.",
      customer: {
        id: 104,
        name: "Kwame Nkrumah",
        email: "kwame.nkrumah@email.com",
        phone: "+228 92 34 56 78",
        avatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=KN"
      },
      date: "2024-01-10",
      status: "Fermé",
      priority: "Urgente",
      category: "Technique",
      responses: [
        {
          id: 106,
          message: "Bonjour, nous sommes désolés pour ce désagrément. Notre équipe technique est en train de résoudre ce problème. Pourriez-vous nous dire quel navigateur vous utilisez ?",
          date: "2024-01-10",
          isAdmin: true,
          author: "Support Adawi",
          authorAvatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=SA"
        },
        {
          id: 107,
          message: "J'utilise Chrome sur Windows 10.",
          date: "2024-01-11",
          isAdmin: false,
          author: "Kwame Nkrumah",
          authorAvatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=KN"
        },
        {
          id: 108,
          message: "Merci pour cette information. Le problème a été résolu. Pourriez-vous essayer à nouveau ?",
          date: "2024-01-11",
          isAdmin: true,
          author: "Support Adawi",
          authorAvatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=SA"
        },
        {
          id: 109,
          message: "Ça fonctionne maintenant ! Merci beaucoup.",
          date: "2024-01-12",
          isAdmin: false,
          author: "Kwame Nkrumah",
          authorAvatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=KN"
        }
      ]
    },
    {
      id: 5,
      ticketNumber: "TKT-005-2024",
      subject: "Demande d'information sur les délais de livraison",
      message: "Bonjour, j'aimerais savoir quels sont les délais de livraison pour une commande à Kpalimé ?",
      customer: {
        id: 105,
        name: "Akosua Osei",
        email: "akosua.osei@email.com",
        phone: "+228 93 45 67 89",
        avatar: "https://placehold.co/40x40/8B4513/FFFFFF?text=AO"
      },
      date: "2024-01-05",
      status: "Ouvert",
      priority: "Normale",
      category: "Livraison",
      responses: []
    }
  ]);

  // Filtrage des tickets
  const filteredTickets = tickets.filter(ticket => {
    // Filtre de recherche
    const matchesSearch = 
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre de statut
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    
    // Filtre de priorité
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    // Filtre de catégorie
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Fonctions pour gérer les tickets
  const handleUpdateTicket = (ticketId: number, updates: Partial<Ticket>) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
    setIsUpdateModalOpen(false);
  };

  const handleAddResponse = (ticketId: number, responseText: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const newResponse = {
      id: Math.max(0, ...ticket.responses.map(r => r.id)) + 1,
      message: responseText,
      date: new Date().toISOString().split('T')[0],
      isAdmin: true,
      author: "Support Adawi",
      authorAvatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=SA"
    };

    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            responses: [...ticket.responses, newResponse],
            status: ticket.status === "Ouvert" ? "En cours" : ticket.status
          } 
        : ticket
    ));

    // Rafraîchir le ticket sélectionné si nécessaire
    if (selectedTicket && selectedTicket.id === ticketId) {
      const updatedTicket = tickets.find(t => t.id === ticketId);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
    }
  };

  // Fonctions pour ouvrir les modals
  const openViewModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewModalOpen(true);
  };

  const openUpdateModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsUpdateModalOpen(true);
  };

  // Fonction pour obtenir l'icône et la couleur du statut
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Résolu":
        return { 
          icon: <CheckCircle className="w-4 h-4" />, 
          color: "bg-green-100 text-green-800" 
        };
      case "En cours":
        return { 
          icon: <MessageCircle className="w-4 h-4" />, 
          color: "bg-blue-100 text-blue-800" 
        };
      case "Ouvert":
        return { 
          icon: <Clock className="w-4 h-4" />, 
          color: "bg-yellow-100 text-yellow-800" 
        };
      case "Fermé":
        return { 
          icon: <XCircle className="w-4 h-4" />, 
          color: "bg-gray-100 text-gray-800" 
        };
      default:
        return { 
          icon: <AlertCircle className="w-4 h-4" />, 
          color: "bg-gray-100 text-gray-800" 
        };
    }
  };

  // Fonction pour obtenir la couleur de la priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgente":
        return "bg-red-100 text-red-800";
      case "Élevée":
        return "bg-orange-100 text-orange-800";
      case "Normale":
        return "bg-blue-100 text-blue-800";
      case "Basse":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <h1 className="text-2xl font-bold text-adawi-brown">Support Client</h1>
        <p className="text-gray-600">Gérez les tickets de support et les demandes des clients</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              <p className="text-sm text-gray-600">Total Tickets</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tickets.filter(t => t.status === "Ouvert").length}</p>
              <p className="text-sm text-gray-600">Tickets Ouverts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tickets.filter(t => t.status === "En cours").length}</p>
              <p className="text-sm text-gray-600">En Traitement</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.filter(t => t.status === "Résolu" || t.status === "Fermé").length}
              </p>
              <p className="text-sm text-gray-600">Résolus/Fermés</p>
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
                placeholder="Rechercher par numéro de ticket, sujet ou client..."
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
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <option value="Ouvert">Ouvert</option>
                <option value="En cours">En cours</option>
                <option value="Résolu">Résolu</option>
                <option value="Fermé">Fermé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorité
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              >
                <option value="all">Toutes les priorités</option>
                <option value="Urgente">Urgente</option>
                <option value="Élevée">Élevée</option>
                <option value="Normale">Normale</option>
                <option value="Basse">Basse</option>
              </select>
            </div>
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
                <option value="Livraison">Livraison</option>
                <option value="Remboursement">Remboursement</option>
                <option value="Produit">Produit</option>
                <option value="Technique">Technique</option>
                <option value="Paiement">Paiement</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Ticket</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Catégorie</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Priorité</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => {
                  const statusInfo = getStatusInfo(ticket.status);
                  const priorityColor = getPriorityColor(ticket.priority);
                  
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <MessageCircle className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{ticket.ticketNumber}</p>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">{ticket.subject}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {ticket.customer.avatar ? (
                            <img 
                              src={ticket.customer.avatar} 
                              alt={ticket.customer.name}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="p-2 bg-gray-100 rounded-full mr-3">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{ticket.customer.name}</p>
                            <p className="text-sm text-gray-500">{ticket.customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {new Date(ticket.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4 px-4 text-gray-900">
                        {ticket.category}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          {statusInfo.icon}
                          <span className="ml-1">{ticket.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openViewModal(ticket)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openUpdateModal(ticket)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Mettre à jour le statut"
                          >
                            <MessageCircle className="w-4 h-4" />
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
                      <p>Aucun ticket trouvé</p>
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
          Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredTickets.length}</span> sur <span className="font-medium">{tickets.length}</span> tickets
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

      {/* View Ticket Modal */}
      {selectedTicket && (
        <ViewTicketModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          ticket={selectedTicket}
          onAddResponse={handleAddResponse}
          onUpdateTicket={handleUpdateTicket}
        />
      )}

      {/* Update Ticket Modal */}
      {selectedTicket && (
        <UpdateTicketModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          ticket={selectedTicket}
          onUpdateTicket={handleUpdateTicket}
        />
      )}
    </div>
  );
}
