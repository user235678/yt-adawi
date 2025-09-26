import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { readToken } from "~/utils/session.server";
import { API_BASE } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const token = await readToken(request);
    if (!token) {
      return json({ error: "Non authentifié" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE}/promotions/active`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return json({ error: "Non authentifié" }, { status: 401 });
      }
      return json({ error: "Erreur lors de la récupération de la promotion" }, { status: response.status });
    }

    const promotionData = await response.json();
    if (promotionData.is_active) {
      return json(promotionData);
    } else {
      return json(null);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la promotion:", error);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
}
