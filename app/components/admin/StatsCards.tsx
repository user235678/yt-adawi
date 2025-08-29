import { TrendingUp, TrendingDown, Users, ShoppingCart, Package, AlertTriangle, DollarSign, RotateCcw } from "lucide-react";

interface DashboardData {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_vendors: number;
  total_products: number;
  commission_collected: number;
  gross_profit: number;
  gross_margin_percent: number;
  refunds_count: number;
  refunds_total_amount: number;
  low_stock_products: number;
  revenue_growth: number;
  orders_growth: number;
  customers_growth: number;
}

interface StatsCardsProps {
  data: DashboardData;
}

export default function StatsCards({ data }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const stats = [
    {
      title: "Chiffre d'Affaires Total",
      value: formatCurrency(data.total_revenue),
      unit: "FCFA",
      change: `${data.revenue_growth >= 0 ? '+' : ''}${data.revenue_growth.toFixed(1)}%`,
      changeValue: `Commission: ${formatCurrency(data.commission_collected)} FCFA`,
      trend: data.revenue_growth >= 0 ? "up" : "down",
      icon: DollarSign,
      bgColor: "bg-gray-800",
      textColor: "text-white"
    },
    {
      title: "Commandes Totales",
      value: formatNumber(data.total_orders),
      subtitle: `Croissance: ${data.orders_growth >= 0 ? '+' : ''}${data.orders_growth.toFixed(1)}%`,
      change: `${data.orders_growth >= 0 ? '+' : ''}${data.orders_growth.toFixed(1)}%`,
      changeValue: "cette période",
      trend: data.orders_growth >= 0 ? "up" : "down",
      icon: ShoppingCart,
      bgColor: "bg-white",
      textColor: "text-gray-900"
    },
    {
      title: "Utilisateurs",
      value: formatNumber(data.total_customers + data.total_vendors),
      subtitle: `${data.total_customers} clients • ${data.total_vendors} vendeurs`,
      change: `${data.customers_growth >= 0 ? '+' : ''}${data.customers_growth.toFixed(1)}%`,
      changeValue: "nouveaux clients",
      trend: data.customers_growth >= 0 ? "up" : "down",
      icon: Users,
      bgColor: "bg-white",
      textColor: "text-gray-900"
    },
    {
      title: "Produits",
      value: formatNumber(data.total_products),
      subtitle: `${data.low_stock_products} en stock faible`,
      change: data.low_stock_products > 0 ? "Attention" : "Stock OK",
      changeValue: `${data.low_stock_products} alertes`,
      trend: data.low_stock_products > 0 ? "down" : "up",
      icon: Package,
      bgColor: "bg-white",
      textColor: "text-gray-900"
    },
    {
      title: "Bénéfice Brut",
      value: formatCurrency(data.gross_profit),
      unit: "FCFA",
      subtitle: `Marge: ${data.gross_margin_percent.toFixed(1)}%`,
      change: `${data.gross_margin_percent.toFixed(1)}%`,
      changeValue: "marge bénéficiaire",
      trend: data.gross_margin_percent > 20 ? "up" : "down",
      icon: TrendingUp,
      bgColor: "bg-white",
      textColor: "text-gray-900"
    },
    {
      title: "Remboursements",
      value: formatNumber(data.refunds_count),
      subtitle: `${formatCurrency(data.refunds_total_amount)} FCFA`,
      change: data.refunds_count > 0 ? `${data.refunds_count}` : "0",
      changeValue: "remboursements",
      trend: data.refunds_count > 10 ? "down" : "up",
      icon: RotateCcw,
      bgColor: "bg-white",
      textColor: "text-gray-900"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.trend === "up";
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor === 'bg-gray-800' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.bgColor === 'bg-gray-800' ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <button className={`${stat.textColor} hover:opacity-70`}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="mb-2">
              <h3 className={`text-xs sm:text-sm font-medium ${stat.textColor} opacity-70 mb-1`}>
                {stat.title}
              </h3>
              {stat.subtitle && (
                <p className={`text-xs ${stat.textColor} opacity-50 mb-2`}>
                  {stat.subtitle}
                </p>
              )}
            </div>
            
            <div className="mb-3 sm:mb-4">
              <div className="flex items-baseline">
                <span className={`text-xl sm:text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className={`text-xs sm:text-sm ${stat.textColor} opacity-70 ml-1`}>
                    {stat.unit}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                )}
                <span className="text-xs sm:text-sm font-medium">{stat.change}</span>
              </div>
              <span className={`text-xs ${stat.textColor} opacity-50 ml-2 truncate`}>
                {stat.changeValue}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}