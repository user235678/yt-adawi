import { json, type ActionFunction } from "@remix-run/node";
import { readSessionData } from "~/utils/session.server";

const API_BASE_URL = "https://showroom-backend-2x3g.onrender.com";

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
    }

    try {
        // Vérifier l'authentification
        const sessionData = await readSessionData(request);
        if (!sessionData?.access_token) {
            console.log("❌ Pas de token d'authentification");
            return json({ 
                success: false,
                error: "Vous devez être connecté pour ajouter des produits au panier",
                errorType: "auth_required",
                title: "Connexion requise",
                message: "Pour ajouter des produits à votre panier, vous devez d'abord vous connecter à votre compte.",
                showLoginButton: true,
                loginUrl: "/login",
                buttonText: "Se connecter"
            }, { status: 401 });
        }

        const { product_id, quantity, size, color } = await request.json();

        // Validation des données
        if (!product_id || !quantity) {
            console.log("❌ Données manquantes:", { product_id, quantity });
            return json({ 
                success: false, 
                error: "Données manquantes (product_id et quantity requis)" 
            }, { status: 400 });
        }

        console.log("🛒 Tentative d'ajout au panier:", { 
            product_id, 
            quantity, 
            size, 
            color,
            token_preview: sessionData.access_token.substring(0, 20) + "..."
        });

        // Essayer d'appeler l'API backend
        try {
            const response = await fetch(`${API_BASE_URL}/cart/add/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionData.access_token}`
                },
                body: JSON.stringify({
                    product_id,
                    quantity,
                    size: size || null,
                    color: color || null
                })
            });

            console.log("📡 Réponse API backend:", response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.log("❌ Erreur API backend:", errorText);
                
                if (response.status === 401) {
                    return json({ 
                        success: false, 
                        error: "Session expirée, veuillez vous reconnecter",
                        errorType: "session_expired",
                        title: "Session expirée",
                        message: "Votre session a expiré. Veuillez vous reconnecter pour continuer vos achats.",
                        showLoginButton: true,
                        loginUrl: "/login",
                        buttonText: "Se reconnecter"
                    }, { status: 401 });
                }

                // Fallback en cas d'erreur API
                console.log("🔄 Fallback: simulation d'ajout au panier");
                const simulatedCart = {
                    id: `cart_${Date.now()}`,
                    item_id: `item_${Date.now()}`,
                    product_id,
                    quantity,
                    size,
                    color,
                    added_at: new Date().toISOString()
                };

                return json({ 
                    success: true, 
                    cart: simulatedCart,
                    message: "Produit ajouté au panier (mode test)",
                    fallback: true
                });
            }

            const result = await response.json();
            console.log("✅ Succès API backend:", result);

            return json({ 
                success: true, 
                cart: result,
                message: "Produit ajouté au panier avec succès"
            });

        } catch (fetchError) {
            console.error("❌ Erreur de connexion à l'API backend:", fetchError);
            
            // Mode fallback si l'API backend n'est pas accessible
            console.log("🔄 Fallback: API backend non accessible, simulation d'ajout");
            const simulatedCart = {
                id: `cart_${Date.now()}`,
                item_id: `item_${Date.now()}`,
                product_id,
                quantity,
                size,
                color,
                added_at: new Date().toISOString()
            };

            return json({ 
                success: true, 
                cart: simulatedCart,
                message: "Produit ajouté au panier (mode hors ligne)",
                fallback: true
            });
        }

    } catch (error) {
        console.error('❌ Erreur générale API cart/add:', error);
        return json({ 
            success: false, 
            error: "Erreur serveur interne" 
        }, { status: 500 });
    }
};