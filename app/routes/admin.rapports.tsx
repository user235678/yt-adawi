import { useState, useEffect } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Loader
} from "lucide-react";
import Pagination from "~/components/admin/Pagination";
import { readToken } from "~/utils/session.server";
import {
  fetchReportsSummary,
  fetchSalesReport,
  fetchProductsReport,
  exportReports,
  type ReportsSummary,
  type SalesReport,
  type ProductReport
} from "~/utils/adminReportsApi";

interface LoaderData {
  token: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const token = await readToken(request);
  if (!token) throw new Response("Non autorisé", { status: 401 });

  return json<LoaderData>({ token });
};

export default function AdminRapports() {
  const { token } = useLoaderData<LoaderData>();
  const [activeTab, setActiveTab] = useState("ventes");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState("30-days");
  const itemsPerPage = 10;

  // State for API data
  const [reportsSummary, setReportsSummary] = useState<ReportsSummary | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [productsReport, setProductsReport] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch summary data
        const summary = await fetchReportsSummary(token, dateRange);
        setReportsSummary(summary);

        // Fetch sales data if on ventes tab
        if (activeTab === "ventes") {
          const sales = await fetchSalesReport(token, currentPage, itemsPerPage, dateRange);
          setSalesReport(sales);
        }

        // Fetch products data if on produits tab
        if (activeTab === "produits") {
          const products = await fetchProductsReport(token);
          setProductsReport(products);
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, dateRange, activeTab, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportReports(token, dateRange);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapports-${dateRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
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
            <option value="today">Aujourd'hui</option>
            <option value="7-days">7 derniers jours</option>
            <option value="30-days">30 derniers jours</option>
            <option value="90-days">3 derniers mois</option>
            <option value="year">Cette année</option>
          </select>
          
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {exporting ? "Export en cours..." : "Exporter"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventes totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportsSummary ? reportsSummary.total_orders.toLocaleString() : "—"}
              </p>
              <p className={`text-sm ${reportsSummary && reportsSummary.orders_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportsSummary ? `${reportsSummary.orders_growth >= 0 ? '+' : ''}${reportsSummary.orders_growth}% ce mois` : "—"}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {reportsSummary ? `${(reportsSummary.total_revenue / 1000).toFixed(1)}K F CFA` : "—"}
              </p>
              <p className={`text-sm ${reportsSummary && reportsSummary.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportsSummary ? `${reportsSummary.revenue_growth >= 0 ? '+' : ''}${reportsSummary.revenue_growth}% ce mois` : "—"}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {reportsSummary ? reportsSummary.total_nouveaux_clients.toLocaleString() : "—"}
              </p>
              <p className={`text-sm ${reportsSummary && reportsSummary.customers_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportsSummary ? `${reportsSummary.customers_growth >= 0 ? '+' : ''}${reportsSummary.customers_growth}% ce mois` : "—"}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {reportsSummary ? reportsSummary.total_produits_vendus.toLocaleString() : "—"}
              </p>
              <p className="text-sm text-gray-600">Commission: {reportsSummary ? `${reportsSummary.commission_collected.toLocaleString()} F CFA` : "—"}</p>
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
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-adawi-gold" />
              <span className="ml-2 text-gray-600">Chargement des données...</span>
            </div>
          ) : (
            <>
              {activeTab === "ventes" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Détail des ventes</h3>
                    <button className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrer
                    </button>
                  </div>

                  {salesReport && salesReport.ventes.length > 0 ? (
                    <>
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
                            {salesReport.ventes.map((sale, index) => (
                              <tr key={`${sale.date}-${sale.produit}-${index}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {sale.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {sale.produit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {sale.client || "—"}
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
                        currentPage={salesReport.page}
                        totalPages={salesReport.total_pages}
                        onPageChange={handlePageChange}
                        totalItems={salesReport.total_items}
                        itemsPerPage={itemsPerPage}
                      />
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune vente trouvée
                      </h3>
                      <p className="text-gray-600">
                        Il n'y a pas de données de ventes pour la période sélectionnée.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "produits" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Performance des produits</h3>
                  </div>

                  {productsReport.length > 0 ? (
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
                          {productsReport.map((product, index) => (
                            <tr key={`${product.nom}-${index}`} className="hover:bg-gray-50">
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
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun produit trouvé
                      </h3>
                      <p className="text-gray-600">
                        Il n'y a pas de données de produits disponibles.
                      </p>
                    </div>
                  )}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
