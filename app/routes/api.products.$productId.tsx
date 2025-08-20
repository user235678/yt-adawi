import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
    // ===== CONFIGURATION =====
    const BACKEND_URL = "https://showroom-backend-2x3g.onrender.com/products/";
    const REQUIRE_AUTH = false; // Mettre à true si vous voulez que seuls les connectés voient les détails
    // =========================

    // ===== VALIDATION DES PARAMÈTRES =====
    const productId = params.productId;
    if (!productId) {
        return json({ error: "ID du produit manquant" }, { status: 400 });
    }
    // ====================================

    // ===== AUTHENTIFICATION (OPTIONNELLE) =====
    const token = await readToken(request);
    
    if (REQUIRE_AUTH && !token) {
        return json({ error: "Vous devez être connecté pour voir ce produit." }, { status: 401 });
    }
    // ==========================================

    try {
        // ===== APPEL À L'API BACKEND =====
        const apiUrl = `${BACKEND_URL}${productId}`;
        console.log("🔍 Récupération du produit:", apiUrl);

        const headers: HeadersInit = {
            "Content-Type": "application/json"
        };

        // Ajouter le token si disponible
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, {
            method: "GET",
            headers
        });

        console.log("Réponse API produit:", response.status, response.statusText);
        // =================================

        // ===== GESTION DES ERREURS =====
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: "Erreur inconnue" };
            }

            console.error("Erreur API backend:", errorData);

            if (response.status === 404) {
                return json({ 
                    error: "Produit non trouvé",
                    productId 
                }, { status: 404 });
            } else if (response.status === 401) {
                return json({ error: "Session expirée. Veuillez vous reconnecter." }, { status: 401 });
            } else if (response.status === 422) {
                return json({ 
                    error: "ID de produit invalide",
                    details: errorData.detail || {}
                }, { status: 422 });
            } else {
                return json({ 
                    error: `Erreur ${response.status}: ${errorData.message || "Erreur lors de la récupération du produit"}`
                }, { status: response.status });
            }
        }
        // ===============================

        // ===== TRAITEMENT DU SUCCÈS =====
        const product = await response.json();
        console.log("✅ Produit récupéré avec succès:", product.name);

        return json({
            success: true,
            product
        });
        // ================================

    } catch (error) {
        // ===== GESTION DES EXCEPTIONS =====
        console.error("Erreur lors de la récupération du produit:", error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return json({
                error: "Impossible de contacter le serveur. Veuillez réessayer plus tard."
            }, { status: 503 });
        }

        return json({
            error: "Erreur technique lors de la récupération du produit."
        }, { status: 500 });
        // =================================
    }
}
