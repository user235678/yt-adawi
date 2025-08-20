import { json, type ActionFunction } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "DELETE") {
        return json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
    }

    try {
        const token = await readToken(request);
        const formData = await request.json();

        const { item_id } = formData;

        // Validation
        if (!item_id) {
            return json({ 
                success: false, 
                error: "item_id est requis" 
            }, { status: 400 });
        }

        // Préparer les headers
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const sessionId = request.headers.get("cookie")?.match(/session-id=([^;]+)/)?.[1];
        if (sessionId) {
            headers["session-id"] = sessionId;
        }

        console.log("📤 Suppression item panier:", item_id);

        // Appeler l'API backend pour supprimer l'item
        const response = await fetch(`https://showroom-backend-2x3g.onrender.com/cart/items/${item_id}`, {
            method: "DELETE",
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("❌ Erreur suppression item panier:", response.status, errorData);
            
            return json({ 
                success: false, 
                error: errorData.detail || `Erreur ${response.status}` 
            }, { status: response.status });
        }

        const updatedCart = await response.json();
        
        console.log("✅ Item supprimé du panier:", updatedCart);
        
        return json({ 
            success: true, 
            cart: updatedCart,
            message: "Produit retiré du panier"
        });

    } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'item:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};
