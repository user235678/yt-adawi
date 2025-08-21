import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    console.log("🔄 Début du chargement des produits vendeur...");

    try {
        const token = await readToken(request);
        console.log("🔑 Token récupéré:", token ? "✅ Présent" : "❌ Absent");

        if (!token) {
            console.log("❌ Pas de token, retour 401");
            return json({ success: false, error: "Non authentifié" }, { status: 401 });
        }

        console.log("📡 Appel API vers:", "https://showroom-backend-2x3g.onrender.com/products/vendor/my-products");

        // Utiliser le bon endpoint pour récupérer les produits du vendeur
        const response = await fetch("https://showroom-backend-2x3g.onrender.com/products/vendor/my-products", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("📡 Réponse API reçue:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Erreur API: ${response.status} - ${errorText}`);

            return json({ 
                success: false, 
                error: `Erreur API ${response.status}: ${errorText}` 
            }, { status: response.status });
        }

        const products = await response.json();
        console.log("📦 Produits récupérés:", Array.isArray(products) ? products.length : "Format invalide");

        return json({ 
            success: true, 
            products: Array.isArray(products) ? products : [] 
        });

    } catch (error: any) {
        console.error("❌ Erreur lors du chargement des produits:", error);

        return json({ 
            success: false, 
            error: `Erreur serveur: ${error.message || 'Erreur inconnue'}`,
            products: [] 
        }, { status: 500 });
    }
};