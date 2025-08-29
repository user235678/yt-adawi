import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";

import StatsCards from "~/components/admin/StatsCards";
import SalesChart from "~/components/admin/SalesChart";
import TopCategories from "~/components/admin/TopCategories";
import UserGrowthChart from "~/components/admin/UserGrowthChart";
import GeographicSales from "~/components/admin/GeographicSales";
// import TopProducts from "~/components/admin/TopProducts";
// import TopVendors from "~/components/admin/TopVendors";
// import RecentOrders from "~/components/admin/RecentOrders";
import OrdersStatus from "~/components/admin/OrdersStatus";
import RefundStats from "~/components/admin/RefundStats";
// import InventoryAlerts from "~/components/admin/InventoryAlerts";

export const meta: MetaFunction = () => ([
  { title: "Dashboard - Adawi Admin" },
  { name: "description", content: "Tableau de bord administrateur" },
]);

// Types pour l'API
interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_vendors: number;
  total_products: number;
  commission_collected: number;
  total_cost: number;
  gross_profit: number;
  gross_margin_percent: number;
  refunds_count: number;
  refunds_total_amount: number;
  low_stock_products: number;
  revenue_growth: number;
  orders_growth: number;
  customers_growth: number;
  revenue_evolution: Array<{
    date: string;
    revenue: number;
    orders_count: number;
  }>;
  cost_revenue_evolution: Array<{
    date: string;
    revenue: number;
    cost: number;
  }>;
  sales_by_category: Array<{
    category_name: string;
    total_sales: number;
    product_count: number;
    percentage: number;
  }>;
  user_growth: Array<{
    date: string;
    new_clients: number;
    new_vendors: number;
    total_users: number;
  }>;
  geographic_sales: Array<{
    region: string;
    sales_count: number;
    revenue: number;
  }>;
  refund_stats: {
    total_refunds: number;
    total_refunded_amount: number;
    pending_refunds: number;
    approved_refunds: number;
    rejected_refunds: number;
    processed_refunds: number;
  };
  inventory_alerts: Array<{
    product_id: string;
    name: string;
    current_stock: number;
    min_stock: number;
  }>;
  top_products: Array<{
    product_id: string;
    name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  top_vendors: Array<{
    user_id: string;
    name: string;
    total_orders: number;
    total_revenue: number;
  }>;
  recent_orders: Array<{
    order_id: string;
    user_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
  orders_by_status: Array<{
    status: string;
    count: number;
  }>;
  pending_orders: Array<{
    order_id: string;
    user_name: string;
    status: string;
    created_at: string;
    total: number;
  }>;
}

// 🔒 Protection admin + récupération des données
export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);
  
  try {
    // Récupération des données du dashboard depuis votre API
    const response = await fetch(`${process.env.API_URL}/dashboard/admin`, {
      headers: {
        'Authorization': `Bearer ${user.token}`, // ou selon votre système d'auth
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }
    
    const dashboardData: DashboardStats = await response.json();
    
    return json({ user, dashboardData });
  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    // Retourner des données par défaut en cas d'erreur
    const defaultData: DashboardStats = {
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
    };
    
    return json({ user, dashboardData: defaultData });
  }
};

export default function AdminDashboard() {
  const { user, dashboardData } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-adawi-brown mb-2">
          Bienvenue, {user.name ?? "Administrateur"}
        </h1>
        <p className="text-gray-600">
          Voici les statistiques d'aujourd'hui de votre plateforme Adawi !
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards data={dashboardData} />

      {/* Charts Section - Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Performance Chart */}
        <div className="lg:col-span-2">
          <SalesChart data={dashboardData.cost_revenue_evolution} />
        </div>

        {/* Top Categories */}
        <div className="lg:col-span-1">
          <TopCategories data={dashboardData.sales_by_category} />
        </div>
      </div>

      {/* Charts Section - Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <UserGrowthChart data={dashboardData.user_growth} />
        
        {/* Geographic Sales */}
        <GeographicSales data={dashboardData.geographic_sales} />
      </div>

      {/* Stats Section - Row 3 */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Orders Status */}
        <OrdersStatus data={dashboardData.orders_by_status} />
        
        {/* Refund Stats */}
        <RefundStats data={dashboardData.refund_stats} />
        
        {/* Inventory Alerts */}
        {/* <div className="lg:col-span-2">
          <InventoryAlerts data={dashboardData.inventory_alerts} />
        </div> */}
      </div>

      {/* Tables Section - Row 4 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        {/* <TopProducts data={dashboardData.top_products} /> */}
        
        {/* Top Vendors */}
        {/* <TopVendors data={dashboardData.top_vendors} /> */}
      </div>

      {/* Recent Orders */}
       {/* <RecentOrders data={dashboardData.recent_orders} /> */}
    </div>
  );
}