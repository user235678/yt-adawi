// import { AlertTriangle, Package, TrendingDown } from "lucide-react";

// interface InventoryAlert {
//   product_id: string;
//   name: string;
//   current_stock: number;
//   min_stock: number;
// }

// interface InventoryAlertsProps {
//   data: InventoryAlert[];
// }

// export default function InventoryAlerts({ data }: InventoryAlertsProps) {
//   const criticalAlerts = data.filter(item => item.current_stock <= 0);
//   const lowStockAlerts = data.filter(item => item.current_stock > 0 && item.current_stock <= item.min_stock);

//   return (
//     <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-lg font-semibold text-gray-900">Alertes Inventaire</h3>
//         <div className="flex items-center gap-2">
//           {data.length > 0 ? (
//             <div className="flex items-center gap-1 text-red-600">
//               <AlertTri