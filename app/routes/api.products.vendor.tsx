import { json, type LoaderFunction } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Récupérer le token depuis la session côté serveur
    const token = await readToken(request);

    if (!token) {
      return json({ error: "Non authentifié", success: false }, { status: 401 });
    }

    // Récupérer les paramètres de requête pour la pagination
    const url = new URL(request.url);
    const skip = url.searchParams.get('skip') || '0';
    const limit = url.searchParams.get('limit') || '100'; // Récupérer plus de produits par défaut

    // Construire l'URL avec les paramètres de pagination
    const apiUrl = new URL('https://showroom-backend-2x3g.onrender.com/products/vendor/my-products');
    apiUrl.searchParams.set('skip', skip);
    apiUrl.searchParams.set('limit', limit);

    console.log('🔗 URL API produits:', apiUrl.toString());

    // Appeler l'API des produits avec le token
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Status de la réponse:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API produits:', errorText);
      return json({ 
        error: `Erreur ${response.status}: ${errorText}`, 
        success: false 
      }, { status: response.status });
    }

    const products = await response.json();
    console.log(`✅ Produits récupérés: ${products.length}`);

    return json({ 
      products: products, 
      success: true 
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des produits:', error);
    return json({ 
      error: "Erreur serveur", 
      success: false 
    }, { status: 500 });
  }
};