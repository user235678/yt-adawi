import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { Link } from "@remix-run/react";

interface InventoryAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  low_stock_threshold: number;
  seller_id: string;
}

interface InventoryAlertsProps {
  data: InventoryAlert[];
}

export default function InventoryAlerts({ data }: InventoryAlertsProps) {
  const criticalAlerts = data.filter(item => item.current_stock <= 0);
  const lowStockAlerts = data.filter(item => item.current_stock > 0 && item.current_stock <= item.low_stock_threshold);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Alertes Inventaire</h3>
        <div className="flex items-center gap-2">
          {data.length > 0 ? (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{data.length}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-600">
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">Aucun</span>
            </div>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {criticalAlerts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Produits en rupture de stock
            </h4>
            <ul className="space-y-2">
              {criticalAlerts.map((alert) => (
                <li key={alert.product_id} className="text-sm text-gray-700 bg-red-50 p-2 rounded hover:bg-red-100 cursor-pointer">
                  <Link to={`/admin/products`} className="block w-full">
                    {alert.product_name} - Stock: {alert.current_stock}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {lowStockAlerts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-orange-600 mb-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Produits en stock faible
            </h4>
            <ul className="space-y-2">
              {lowStockAlerts.map((alert) => (
                <li key={alert.product_id} className="text-sm text-gray-700 bg-orange-50 p-2 rounded hover:bg-orange-100 cursor-pointer">
                    {alert.product_name} - Stock: {alert.current_stock} / Min: {alert.low_stock_threshold}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            Aucun alerte d'inventaire
          </div>
        )}
      </div>
    </div>
  );
}