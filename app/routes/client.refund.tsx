// app/routes/client.refund.tsx
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import ClientLayout from "~/components/client/ClientLayout";
import { readToken } from "~/utils/session.server";

export const meta: MetaFunction = () => [
  { title: "Demande de remboursement - Adawi" },
  { name: "description", content: "Formulaire de demande de remboursement" },
];

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
}

interface LoaderData {
  user: User | null;
  orders: Order[];
  token: string;
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const tokenData = await readToken(request);
    if (!tokenData) throw redirect("/login"); // redirection si pas connecté

    const token =
      typeof tokenData === "string"
        ? (() => {
            try {
              return JSON.parse(tokenData)?.access_token || tokenData;
            } catch {
              return tokenData;
            }
          })()
        : tokenData;

    if (!token) throw redirect("/login");

    const [userRes, ordersRes] = await Promise.all([
      fetch("https://showroom-backend-2x3g.onrender.com/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("https://showroom-backend-2x3g.onrender.com/orders/", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const user = userRes.ok ? await userRes.json() : null;
    const orders = ordersRes.ok ? await ordersRes.json() : [];

    return json<LoaderData>({ user, orders, token });
  } catch (err: any) {
    console.error("Erreur loader refund:", err);
    return json<LoaderData>({
      user: null,
      orders: [],
      token: "",
      error: err.message || "Erreur serveur",
    });
  }
};

export default function RefundRequest() {
  const { user, orders, token, error } = useLoaderData<LoaderData>();
  const [orderId, setOrderId] = useState(orders.length > 0 ? orders[0].id : "");
  const [reason, setReason] = useState("other");
  const [comment, setComment] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setSuccess(null);

    try {
      const response = await fetch("https://showroom-backend-2x3g.onrender.com/refunds/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // auth obligatoire
        },
        body: JSON.stringify({
          order_id: orderId,
          reason,
          comment,
          items,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.[0]?.msg || "Erreur lors de la demande de remboursement");
      }

      const data = await response.json();
      setSuccess(`Remboursement demandé avec succès. ID: ${data.id}`);
      setOrderId(orders.length > 0 ? orders[0].id : "");
      setReason("other");
      setComment("");
      setItems([]);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout userName={user?.full_name}>
      <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-adawi-brown">Demande de Remboursement</h1>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        {formError && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{formError}</div>}
        {success && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {orders.length > 0 ? (
            <div>
              <label className="block text-sm font-medium">Commande</label>
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                className="w-full p-2 border rounded"
              >
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    #{order.id.slice(-8)} - {new Date(order.created_at).toLocaleDateString("fr-FR")}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">Vous n'avez pas encore de commandes.</p>
          )}

          <div>
            <label className="block text-sm font-medium">Raison</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="other">Autre</option>
              <option value="damaged">Article endommagé</option>
              <option value="wrong_item">Article incorrect</option>
              <option value="not_satisfied">Insatisfait</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Commentaire</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Articles à retourner (IDs séparés par des virgules)
            </label>
            <input
              type="text"
              value={items.join(",")}
              onChange={(e) =>
                setItems(e.target.value.split(",").map((item) => item.trim()))
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading || orders.length === 0}
            className="w-full bg-adawi-brown text-white py-2 rounded hover:bg-adawi-brown/90 transition"
          >
            {loading ? "Traitement..." : "Soumettre la demande"}
          </button>
        </form>
      </div>
    </ClientLayout>
  );
}
