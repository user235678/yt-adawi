import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser, API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request);
  if (!user) {
    return json({ error: "Non autorisé" }, { status: 401 });
  }

  const { orderId } = params;
  if (!orderId) {
    return json({ error: "ID de commande requis" }, { status: 400 });
  }

  const token = await readToken(request);

  try {
    console.log("🔍 Récupération des détails de la commande:", orderId);
    
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Réponse API:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("❌ Erreur API:", errorData);
      return json({
        error: errorData.detail || `Erreur ${response.status}: Impossible de récupérer les détails de la commande`
      }, { status: response.status });
    }

    const orderData = await response.json();
    console.log("✅ Détails de la commande récupérés:", orderData);

    return json(orderData);

  } catch (error) {
    console.error("💥 Erreur lors de la récupération:", error);
    return json({
      error: "Erreur de connexion. Veuillez réessayer."
    }, { status: 500 });
  }
};
