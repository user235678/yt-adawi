import { useState } from "react";
import { X, CheckCircle, XCircle, Clock, Package, Truck, AlertCircle } from "lucide-react";
import type { Order } from "~/routes/admin.orders";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onUpdateStatus: (orderId: number, newStatus: string) => void;
}

export default function UpdateStatusModal({ 
  isOpen, 
  onClose, 
  order, 
  onUpdateStatus 
}: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  if (!isOpen) return null;

  const statusOptions = [
    { value: "En attente", label: "En attente", icon: <Clock className="w-5 h-5" />, color: "bg-gray-100 text-gray-800" },
    { value: "En préparation", label: "En préparation", icon: <Package className="w-5 h-5" />, color: "bg-yellow-100 text-yellow-800" },
    { value: "En cours de livraison", label: "En cours de livraison", icon: <Truck className="w-5 h-5" />, color: "bg-blue-100 text-blue-800" },
    { value: "Livré", label: "Livré", icon: <CheckCircle className="w-5 h-5" />, color: "bg-green-100 text-green-800" },
    { value: "Annulé", label: "Annulé", icon: <XCircle className="w-5 h-5" />, color: "bg-red-100 text-red-800" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(order.id, selectedStatus);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Mettre à jour le statut</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Commande: <span className="font-medium">{order.orderNumber}</span>
              </p>
              <p className="text-gray-700">
                Client: <span className="font-medium">{order.customer.name}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner le nouveau statut
              </label>
              
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label 
                    key={status.value} 
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedStatus === status.value 
                        ? 'border-adawi-gold bg-adawi-beige' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={selectedStatus === status.value}
                      onChange={() => setSelectedStatus(status.value)}
                      className="sr-only"
                    />
                    <div className={`p-2 rounded-full mr-3 ${status.color}`}>
                      {status.icon}
                    </div>
                    <span className="font-medium">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors"
            >
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
