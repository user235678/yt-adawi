import { json, type ActionFunction } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
    }

    try {
        const token = await readToken(request);
        const formData = await request.json();

        const { item_id, quantity } = formData;

        // Validation
        if (!item_id || quantity === undefined) {
            return json({ 
                success: false, 
                error: "item_id et quantity sont requis" 
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

        console.log("📤 Mise à jour quantité panier:", { item_id, quantity });

        // Appeler l'API backend pour mettre à jour la quantité
        const response = await fetch(`https://showroom-backend-2x3g.onrender.com/cart/items/${item_id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ quantity: parseInt(quantity) }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("❌ Erreur mise à jour panier:", response.status, errorData);
            
            return json({ 
                success: false, 
                error: errorData.detail || `Erreur ${response.status}` 
            }, { status: response.status });
        }

        const updatedCart = await response.json();
        
        console.log("✅ Panier mis à jour:", updatedCart);
        
        return json({ 
            success: true, 
            cart: updatedCart,
            message: "Quantité mise à jour"
        });

    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour du panier:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};
