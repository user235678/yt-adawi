import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import StatsCards from "~/components/admin/StatsCards";
import SalesChart from "~/components/admin/SalesChart";
import InventoryAlerts from "~/components/admin/InventoryAlerts";
import { readToken } from "~/utils/session.server";
import GeographicSales from "~/components/admin/GeographicSales";
import RefundStats from "~/components/admin/RefundStats";
import { requireAdmin } from "~/utils/auth.server";


export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - Adawi Admin" },
    { name: "description", content: "Tableau de bord administrateur" },
  ];
};


export const loader: LoaderFunction = async ({ request }) => {
  // Vérifier que l'utilisateur est admin
  const user = await requireAdmin(request);

  try {
    const token = await readToken(request);
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch("https://showroom-backend-2x3g.onrender.com/dashboard/admin", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return json({ ...data, user });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return empty data or handle error
    return json({
      user,
      total_revenue: 0,
      total_orders: 0,
      total_customers: 0,
      total_vendors: 0,
      total_products: 0,
      commission_collected: 0,
      total_cost: 0,
      gross_profit: 0,
      gross_margin_percent: 0,
      refunds_count: 0,
      refunds_total_amount: 0,
      low_stock_products: 0,
      revenue_growth: 0,
      orders_growth: 0,
      customers_growth: 0,
      revenue_evolution: [],
      cost_revenue_evolution: [],
      sales_by_category: [],
      user_growth: [],
      geographic_sales: [],
      refund_stats: {
        total_refunds: 0,
        total_refunded_amount: 0,
        pending_refunds: 0,
        approved_refunds: 0,
        rejected_refunds: 0,
        processed_refunds: 0,
      },
      inventory_alerts: [],
      top_products: [],
      top_vendors: [],
      recent_orders: [],
      orders_by_status: [],
      pending_orders: [],
    });
  }
};


export default function AdminDashboard() {
  const data = useLoaderData<typeof loader>();
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'sales', label: 'Ventes', icon: '💰' },
    { id: 'inventory', label: 'Inventaire', icon: '📦' },
    // { id: 'geographic', label: 'Géographie', icon: '🌍' },
    { id: 'refunds', label: 'Remboursements', icon: '🔄' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <StatsCards data={data} />
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Résumé rapide</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commandes en attente:</span>
                    <span className="font-medium">{data.pending_orders?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Produits en rupture:</span>
                    <span className="font-medium text-red-600">{data.low_stock_products}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marge brute:</span>
                    <span className="font-medium text-green-600">{data.gross_margin_percent?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveSection('inventory')}
                    className="w-full text-left px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 text-sm transition-colors"
                  >
                    ⚠️ Vérifier les stocks faibles ({data.low_stock_products})
                  </button>
                  <button
                    onClick={() => setActiveSection('refunds')}
                    className="w-full text-left px-3 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-700 text-sm transition-colors"
                  >
                    🔄 Gérer les remboursements ({data.refund_stats.pending_refunds})
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'sales':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance des ventes</h3>
              <SalesChart data={data} />
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <InventoryAlerts data={data.inventory_alerts} />
            {/* {data.top_products?.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Produits populaires</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ventes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.top_products.slice(0, 5).map((product: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.sales}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )} */}
          </div>
        );

      // case 'geographic':
      //   return (
      //     <div className="space-y-6">
      //       <GeographicSales data={data.geographic_sales} />
      //     </div>
      //   );

      case 'refunds':
        return (
          <div className="space-y-6">
            <RefundStats data={data.refund_stats} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-adawi-brown mb-2">
            Bienvenue, Administrateur
          </h1>
          <p className="text-gray-600">
            Voici les statistiques d'aujourd'hui de votre boutique en ligne !
          </p>
        </div>
      </div>

      {/* Navigation Tabs - Desktop */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 hidden md:block">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'border-adawi-brown text-adawi-brown'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Navigation Tabs - Mobile */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 md:hidden">
        <div className="flex overflow-x-auto py-2 space-x-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-adawi-brown text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </div>

      {/* Floating Action Button - Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <div className="relative">
          <button className="bg-adawi-brown hover:bg-adawi-brown/90 text-white rounded-full p-4 shadow-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Stats Sidebar - Desktop */}
      <div className="hidden xl:block fixed right-6 top-1/2 transform -translate-y-1/2 w-64 bg-white rounded-lg shadow-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Stats en temps réel</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Revenus du jour</span>
            <span className="font-semibold text-green-600">
              {new Intl.NumberFormat('fr-FR', { 
                style: 'currency', 
                currency: 'XOF',
                minimumFractionDigits: 0 
              }).format(data.total_revenue)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Commandes</span>
            <span className="font-semibold">{data.total_orders}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Nouveaux clients</span>
            <span className="font-semibold text-blue-600">{data.total_customers}</span>
          </div>
          <div className="h-px bg-gray-200 my-3"></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Croissance revenus</span>
            <span className={`font-semibold ${data.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.revenue_growth >= 0 ? '+' : ''}{data.revenue_growth?.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}