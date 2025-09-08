import { X, Package, User, MapPin, CreditCard, Calendar, CheckCircle, XCircle, Clock, Truck, AlertCircle } from "lucide-react";

interface OrderItem {
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  name: string;
}

interface Address {
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  address: Address;
  total: number;
  status: string;
  payment_status: string;
  status_history: any[];
  payment_method: string;
  delivery_method: string;
  delivery_status: string;
  created_at: string;
  updated_at: string;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  if (!isOpen) return null;

  // Fonction pour obtenir l'icône et la couleur du statut
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case "livree":
      case "delivered":
        return { 
          icon: <CheckCircle className="w-5 h-5" />, 
          color: "bg-green-100 text-green-800" 
        };
      case "en_cours":
      case "en cours":
      case "processing":
        return { 
          icon: <Truck className="w-5 h-5" />, 
          color: "bg-blue-100 text-blue-800" 
        };
      case "en_preparation":
      case "en préparation":
      case "preparing":
        return { 
          icon: <Package className="w-5 h-5" />, 
          color: "bg-yellow-100 text-yellow-800" 
        };
      case "en_attente":
      case "en attente":
      case "pending":
        return { 
          icon: <Clock className="w-5 h-5" />, 
          color: "bg-orange-100 text-orange-800" 
        };
      case "annulé":
      case "cancelled":
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  };

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
              <div className="p-3 bg-adawi-beige rounded-lg mr-4">
                <Package className="w-6 h-6 text-adawi-brown" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">#{order.id.slice(-8)}</h3>
                <div className="flex items-center mt-1">
                  <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    Commandé le {formatDate(order.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.icon}
                <span className="ml-1">{order.status}</span>
              </span>
              <p className="mt-1 text-lg font-semibold text-adawi-brown">{formatPrice(order.total)}</p>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Order Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Package className="w-5 h-5 text-gray-500 mr-2" />
                <h4 className="font-medium text-gray-900">Informations de commande</h4>
              </div>
              <div className="space-y-2 pl-7">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de commande:</span>
                  <span className="font-medium text-gray-900">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date de création:</span>
                  <span className="font-medium text-gray-900">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernière mise à jour:</span>
                  <span className="font-medium text-gray-900">{formatDate(order.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.address && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                  <h4 className="font-medium text-gray-900">Adresse de livraison</h4>
                </div>
                <div className="space-y-1 pl-7">
                  <p className="text-gray-600">{order.address.street}</p>
                  <p className="text-gray-600">{order.address.postal_code} {order.address.city}</p>
                  <p className="text-gray-600">{order.address.country}</p>
                  {order.address.phone && <p className="text-gray-600">Tél: {order.address.phone}</p>}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
                <h4 className="font-medium text-gray-900">Informations de paiement</h4>
              </div>
              <div className="space-y-2 pl-7">
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.payment_status === 'paid' || order.payment_status === 'effectue' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {order.payment_status === 'en_attente' ? 'En attente' : 
                     order.payment_status === 'paid' ? 'Payé' : order.payment_status}
                  </span>
                </div>
                {order.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Méthode:</span>
                    <span className="font-medium text-gray-900">{order.payment_method}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Truck className="w-5 h-5 text-gray-500 mr-2" />
                <h4 className="font-medium text-gray-900">Informations de livraison</h4>
              </div>
              <div className="space-y-2 pl-7">
                {order.delivery_method && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Méthode:</span>
                    <span className="font-medium text-gray-900">{order.delivery_method}</span>
                  </div>
                )}
                {order.delivery_status && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className="font-medium text-gray-900">{order.delivery_status}</span>
                  </div>
                )}
              </div>
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
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Prix unitaire</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <div className="text-sm text-gray-500 space-x-2">
                            {item.size && <span>Taille: {item.size}</span>}
                            {item.color && <span>• Couleur: {item.color}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-900">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-gray-900">{formatPrice(item.price)}</td>
                      <td className="py-4 px-4 text-right text-gray-900 font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right font-medium text-gray-900">
                      Total de la commande
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-adawi-brown text-lg">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Status History */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Historique des statuts</h4>
              <div className="space-y-2">
                {order.status_history.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{status.status || status}</span>
                    <span className="text-sm text-gray-500">
                      {status.date ? formatDate(status.date) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold-light transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
