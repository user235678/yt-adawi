// app/routes/api.cart.increase.ts
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { readSessionData } from "~/utils/session.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Récupérer les données de session
    const sessionData = await readSessionData(request);
    if (!sessionData || !sessionData.session_id) {
      return json({ 
        success: false, 
        error: "Session non trouvée" 
      }, { status: 401 });
    }

    // Récupérer les données du body
    const { product_id, size, color } = await request.json();

    if (!product_id) {
      return json({ 
        success: false, 
        error: "product_id requis" 
      }, { status: 400 });
    }

    // Construire l'URL avec les paramètres
    const apiUrl = new URL(`${process.env.API_BASE_URL || 'https://showroom-backend-2x3g.onrender.com'}/cart/increase_quantity`);
    apiUrl.searchParams.append('product_id', product_id);
    if (size) apiUrl.searchParams.append('size', size);
    if (color) apiUrl.searchParams.append('color', color);

    // Appel à l'API backend
    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.access_token}`,
        'session-id': sessionData.session_id,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json({ 
        success: false, 
        error: `Erreur API: ${response.status} - ${errorText}` 
      }, { status: response.status });
    }

    const result = await response.json();
    return json({ success: true, data: result });

  } catch (error) {
    return json({ 
      success: false, 
      error: `Erreur serveur: ${error.message}` 
    }, { status: 500 });
  }
}