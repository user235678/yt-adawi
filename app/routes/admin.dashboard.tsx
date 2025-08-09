import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import AdminSidebar from "~/components/admin/AdminSidebar";
import AdminHeader from "~/components/admin/AdminHeader";
import StatsCards from "~/components/admin/StatsCards";
import SalesChart from "~/components/admin/SalesChart";
import TopCategories from "~/components/admin/TopCategories";
import CompactHeader from "~/components/CompactHeader";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - Adawi Admin" },
    { name: "description", content: "Tableau de bord administrateur" },
  ];
};

export default function AdminDashboard() {
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
