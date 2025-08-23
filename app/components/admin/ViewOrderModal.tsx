import React, { useEffect, useState } from "react";

type OrderItem = {
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  name: string;
};

type Order = {
  id: string;
  items: OrderItem[];
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
  };
  total: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  delivery_method?: string;
  delivery_status?: string;
  status_history?: any[];
  user_id: string;
  created_at: string;
  updated_at: string;
};

interface ViewOrderModalProps {
  isOpen: boolean;
  orderId: string | null;   // <-- passe juste l'ID
  token: string;            // <-- et le token depuis ton loader/parent
  onClose: () => void;
}

const API_BASE = "https://showroom-backend-2x3g.onrender.com";

const ViewOrderModal: React.FC<ViewOrderModalProps> = ({ isOpen, orderId, token, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !orderId || !token) return;

    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      setErr(null);
      setOrder(null);
      try {
        const res = await fetch(`${API_BASE}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal,
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || "Erreur lors de la récupération de la commande");
        }
        const data: Order = await res.json();
        if (!cancelled) setOrder(data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Erreur réseau");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [isOpen, orderId, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Détails de la commande</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {!token && <p className="text-red-600">Token manquant.</p>}
        {loading && <p>Chargement…</p>}
        {err && <p className="text-red-600">{err}</p>}

        {!loading && !err && order && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">ID :</span> <span className="font-medium">{order.id}</span></div>
              <div><span className="text-gray-500">Utilisateur :</span> <span className="font-medium">{order.user_id}</span></div>
              <div><span className="text-gray-500">Statut :</span> <span className="font-medium">{order.status}</span></div>
              <div><span className="text-gray-500">Paiement :</span> <span className="font-medium">{order.payment_status}</span></div>
              <div><span className="text-gray-500">Créée le :</span> <span className="font-medium">{new Date(order.created_at).toLocaleString("fr-FR")}</span></div>
              <div><span className="text-gray-500">MAJ le :</span> <span className="font-medium">{new Date(order.updated_at).toLocaleString("fr-FR")}</span></div>
              <div><span className="text-gray-500">Total :</span> <span className="font-medium">{order.total} FCFA</span></div>
              <div><span className="text-gray-500">Méthode :</span> <span className="font-medium">{order.payment_method || "—"}</span></div>
              <div><span className="text-gray-500">Livraison :</span> <span className="font-medium">{order.delivery_method || "—"}</span></div>
              <div><span className="text-gray-500">Statut livraison :</span> <span className="font-medium">{order.delivery_status || "—"}</span></div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Adresse</h3>
              <div className="rounded-lg border p-3 text-sm">
                <div>{order.address?.street || "—"}</div>
                <div>{order.address?.postal_code || "—"} {order.address?.city || ""}</div>
                <div>{order.address?.country || "—"}</div>
                <div>Tél : {order.address?.phone || "—"}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Articles</h3>
              <div className="rounded-lg border divide-y">
                {order.items?.length ? order.items.map((it, i) => (
                  <div key={`${it.product_id}-${i}`} className="p-3 text-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.name || it.product_id}</div>
                      <div className="text-gray-500">
                        Qté: {it.quantity}
                        {it.size ? ` • Taille: ${it.size}` : ""}
                        {it.color ? ` • Couleur: ${it.color}` : ""}
                      </div>
                    </div>
                    <div className="font-medium">{it.price} FCFA</div>
                  </div>
                )) : (
                  <div className="p-3 text-sm text-gray-500">Aucun article</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;
