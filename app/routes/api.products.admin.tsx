import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    const token = await readToken(request);
    if (!token) {
        return json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    try {
        // Récupérer les paramètres de pagination
        const url = new URL(request.url);
        const skip = url.searchParams.get("skip") || "0";
        const limit = url.searchParams.get("limit") || "50";
        
        console.log(`📋 Chargement des produits admin (skip=${skip}, limit=${limit})`);

        // Construire l'URL avec les paramètres
        const apiUrl = `https://showroom-backend-2x3g.onrender.com/products/admin/all?skip=${skip}&limit=${limit}`;

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erreur API produits admin:", response.status, errorText);
            
            let errorMessage = "Erreur lors du chargement des produits";
            
            if (response.status === 403) {
                errorMessage = "Vous n'avez pas l'autorisation d'accéder à ces produits";
            } else if (response.status === 401) {
                errorMessage = "Session expirée, veuillez vous reconnecter";
            }

            return json({ 
                success: false, 
                error: errorMessage 
            }, { status: response.status });
        }

        const products = await response.json();
        console.log(`✅ ${products.length} produits chargés`);

        return json({
            success: true,
            products: products,
            total: response.headers.get('X-Total-Count') || products.length
        });

    } catch (error) {
        console.error("❌ Erreur lors du chargement des produits:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};
