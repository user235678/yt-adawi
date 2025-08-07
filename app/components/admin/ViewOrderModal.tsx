import { X, Package, User, MapPin, CreditCard, Calendar, CheckCircle, XCircle, Clock, Truck, AlertCircle } from "lucide-react";
import type { Order } from "~/routes/admin.orders";

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export default function ViewOrderModal({ isOpen, onClose, order }: ViewOrderModalProps) {
  if (!isOpen) return null;

  // Fonction pour obtenir l'icône et la couleur du statut
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Livré":
        return { 
          icon: <CheckCircle className="w-5 h-5" />, 
          color: "bg-green-100 text-green-800" 
        };
      case "En cours de livraison":
        return { 
          icon: <Truck className="w-5 h-5" />, 
          color: "bg-blue-100 text-blue-800" 
        };
      case "En préparation":
        return { 
          icon: <Package className="w-5 h-5" />, 
          color: "bg-yellow-100 text-yellow-800" 
        };
      case "En attente":
        return { 
          icon: <Clock className="w-5 h-5" />, 
          color: "bg-gray-100 text-gray-800" 
        };
      case "Annulé":
        return { 
          icon: <XCircle className="w-5 h-5" />, 
          color: "bg-red-100 text-red-800" 
        };
      default:
        return { 
          icon: <AlertCircle className="w-5 h-5" />, 
          color: "bg-gray-100 text-gray-800" 
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Détails de la commande</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="p-3 bg-gray-100 rounded-lg mr-4">
                <Package className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                <div className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}><div className="flex items-center"></div>
                {statusInfo.icon}
                <span className="ml-1">{order.status}</span>
              </span>
              <p className="mt-1 text-lg font-semibold text-gray-900">{order.total}</p>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <User className="w-5 h-5 text-gray-500 mr-2" />
                <h4 className="font-medium text-gray-900">Informations client</h4>
              </div>
              <div className="space-y-2 pl-7">
                <p className="text-gray-900 font-medium">{order.customer.name}</p>
                <p className="text-gray-600">{order.customer.email}</p>
                <p className="text-gray-600">{order.customer.phone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                <h4 className="font-medium text-gray-900">Adresse de livraison</h4>
              </div>
              <div className="space-y-1 pl-7">
                <p className="text-gray-600">{order.shippingAddress.street}</p>
                <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p className="text-gray-600">{order.shippingAddress.zipCode}</p>
                <p className="text-gray-600">{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
                <h4 className="font-medium text-gray-900">Méthode de paiement</h4>
              </div>
              <p className="text-gray-600 pl-7">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-4">Articles commandés</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Produit</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-900">Quantité</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Prix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.size && item.color && (
                              <p className="text-sm text-gray-500">
                                Taille: {item.size}, Couleur: {item.color}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-900">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-gray-900">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 text-right font-medium text-gray-900">
                      Total
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {order.total}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
