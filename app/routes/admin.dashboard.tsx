import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAdmin } from "~/utils/auth.server";

import StatsCards from "~/components/admin/StatsCards";
import SalesChart from "~/components/admin/SalesChart";
import TopCategories from "~/components/admin/TopCategories";

export const meta: MetaFunction = () => ([
  { title: "Dashboard - Adawi Admin" },
  { name: "description", content: "Tableau de bord administrateur" },
]);

// 🔒 Protection admin
export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);
  return json({ user });
};

export default function AdminDashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-adawi-brown mb-2">
          Bienvenue, {user.name ?? "Administrateur"}
        </h1>
        <p className="text-gray-600">
          Voici les statistiques d'aujourd'hui de votre boutique en ligne !
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Performance Chart */}
        <div className="lg:col-span-2">
          <SalesChart />
        </div>

        {/* Top Categories */}
        <div className="lg:col-span-1">
          <TopCategories />
        </div>
      </div>
    </div>
  );
}
