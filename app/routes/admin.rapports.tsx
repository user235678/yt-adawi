import { useState } from "react";
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign
} from "lucide-react";
import Pagination from "~/components/admin/Pagination";

export default function AdminRapports() {
  const [activeTab, setActiveTab] = useState("ventes");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState("30-days");
  const itemsPerPage = 10;

  // Données de démonstration pour les rapports de ventes
  const salesData = [
    { id: 1, date: "2024-01-15", produit: "Robe Traditionnelle", quantite: 3, montant: 45000, client: "Aminata Diallo" },
    { id: 2, date: "2024-01-15", produit: "Boubou Homme", quantite: 1, montant: 25000, client: "Mamadou Sy" },
    { id: 3, date: "2024-01-14", produit: "Ensemble Femme", quantite: 2, montant: 38000, client: "Fatou Ba" },
    { id: 4, date: "2024-01-14", produit: "Chemise Brodée", quantite: 4, montant: 32000, client: "Omar Ndiaye" },
    { id: 5, date: "2024-01-13", produit: "Robe Moderne", quantite: 1, montant: 18000, client: "Aissatou Fall" },
    { id: 6, date: "2024-01-13", produit: "Pantalon Traditionnel", quantite: 2, montant: 22000, client: "Ibrahima Sarr" },
    { id: 7, date: "2024-01-12", produit: "Veste Homme", quantite: 1, montant: 35000, client: "Moussa Diop" },
    { id: 8, date: "2024-01-12", produit: "Ensemble Enfant", quantite: 3, montant: 27000, client: "Khady Sow" },
    { id: 9, date: "2024-01-11", produit: "Robe de Soirée", quantite: 1, montant: 55000, client: "Ndeye Gueye" },
    { id: 10, date: "2024-01-11", produit: "Boubou Brodé", quantite: 2, montant: 48000, client: "Alioune Kane" },
    { id: 11, date: "2024-01-10", produit: "Chemise Simple", quantite: 5, montant: 40000, client: "Binta Thiam" },
    { id: 12, date: "2024-01-10", produit: "Robe Casual", quantite: 1, montant: 15000, client: "Seynabou Dieng" },
  ];

  // Données de démonstration pour les rapports produits
  const productsData = [
    { id: 1, nom: "Robe Traditionnelle", stock: 25, vendus: 45, revenus: 675000, statut: "En stock" },
    { id: 2, nom: "Boubou Homme", stock: 12, vendus: 38, revenus: 950000, statut: "Stock faible" },
    { id: 3, nom: "Ensemble Femme", stock: 18, vendus: 52, revenus: 988000, statut: "En stock" },
    { id: 4, nom: "Chemise Brodée", stock: 8, vendus: 29, revenus: 232000, statut: "Stock faible" },
    { id: 5, nom: "Robe Moderne", stock: 0, vendus: 67, revenus: 1206000, statut: "Rupture" },
  ];

  const totalPages = Math.ceil(salesData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = salesData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const tabs = [
    { id: "ventes", label: "Ventes", icon: TrendingUp },
    { id: "produits", label: "Produits", icon: ShoppingBag },
    { id: "clients", label: "Clients", icon: Users },
    { id: "revenus", label: "Revenus", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-600">Analysez les performances de votre boutique</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
          >
            <option value="7-days">7 derniers jours</option>
            <option value="30-days">30 derniers jours</option>
            <option value="90-days">3 derniers mois</option>
            <option value="year">Cette année</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventes totales</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-sm text-green-600">+12% ce mois</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus</p>
              <p className="text-2xl font-bold text-gray-900">2.4M F CFA</p>
              <p className="text-sm text-green-600">+8% ce mois</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nouveaux clients</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
              <p className="text-sm text-green-600">+15% ce mois</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produits vendus</p>
              <p className="text-2xl font-bold text-gray-900">456</p>
              <p className="text-sm text-green-600">+5% ce mois</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-adawi-gold text-adawi-gold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Table Content */}
        <div className="p-6">
          {activeTab === "ventes" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Détail des ventes</h3>
                <button className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrer
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sale.produit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.client}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.quantite}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sale.montant.toLocaleString()} F CFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={salesData.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}

          {activeTab === "produits" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance des produits</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock actuel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendus
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenus
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productsData.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.vendus}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.revenus.toLocaleString()} F CFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.statut === 'En stock' 
                              ? 'bg-green-100 text-green-800'
                              : product.statut === 'Stock faible'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(activeTab === "clients" || activeTab === "revenus") && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Rapport {activeTab} en cours de développement
              </h3>
              <p className="text-gray-600">
                Cette section sera bientôt disponible avec des données détaillées.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
