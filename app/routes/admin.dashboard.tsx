import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import StatsCards from "~/components/admin/StatsCards";
import SalesChart from "~/components/admin/SalesChart";
import TopCategories from "~/components/admin/TopCategories";
import { readToken } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - Adawi Admin" },
    { name: "description", content: "Tableau de bord administrateur" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
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
    return json(data);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return empty data or handle error
    return json({
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      
      <div> 
        <h1 className="text-2xl font-bold text-adawi-brown mb-2">
          Bienvenue, Administrateur
        </h1>
        <p className="text-gray-600">
          Voici les statistiques d'aujourd'hui de votre boutique en ligne !
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards data={data} />

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Performance Chart */}
        <div className="lg:col-span-2">
          <SalesChart data={data} />
        </div>

        {/* Top Categories */}
        <div className="lg:col-span-1">
          <TopCategories data={data} />
        </div>
      </div>
    </div>
  );
}
