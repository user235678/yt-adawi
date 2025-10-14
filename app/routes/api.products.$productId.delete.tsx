import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
    // ===== CONFIGURATION =====
    const BACKEND_URL = "https://showroom-backend-2x3g.onrender.com/products/";
    const ALLOWED_ROLES = ["client", "vendeur", "admin"]; // Rôles autorisés à supprimer des produits
    // =========================

    // ===== AUTHENTIFICATION ET AUTORISATION =====
    const token = await readToken(request);
    if (!token) {
        return json({ error: "Vous devez être connecté pour supprimer un produit." }, { status: 401 });
    }

    const productId = params.productId;
    if (!productId) {
        return json({ error: "ID du produit manquant" }, { status: 400 });
    }

    console.log("🗑️ Tentative de suppression du produit ID:", productId);

    // Vérification du rôle utilisateur
    let userRole = null;
    try {
        const userResponse = await fetch("https://showroom-backend-2x3g.onrender.com/auth/me", {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (userResponse.ok) {
            const user = await userResponse.json();
            userRole = user.role;
            console.log("Rôle utilisateur pour suppression:", userRole);

            if (!ALLOWED_ROLES.includes(userRole)) {
                return json({ 
                    error: `Accès refusé. Votre rôle (${userRole}) n'est pas autorisé à supprimer des produits.` 
                }, { status: 403 });
            }
        } else {
            return json({ 
                error: "Session expirée. Veuillez vous reconnecter." 
            }, { status: 401 });
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du rôle:", error);
        return json({ 
            error: "Erreur lors de la vérification des permissions." 
        }, { status: 500 });
    }
    // ============================================

    try {
        // ===== SUPPRESSION DU PRODUIT =====
        const apiUrl = `${BACKEND_URL}${productId}`;
        console.log("🗑️ URL de suppression:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Réponse API suppression:", response.status, response.statusText);

        // Lire la réponse même si elle n'est pas OK pour avoir plus d'infos
        let responseData;
        try {
            responseData = await response.text();
            console.log("Réponse brute:", responseData);
            
            // Essayer de parser en JSON si possible
            if (responseData) {
                try {
                    responseData = JSON.parse(responseData);
                } catch (e) {
                    // Garder comme texte si ce n'est pas du JSON
                }
            }
        } catch (e) {
            console.log("Pas de contenu dans la réponse");
        }
        // =================================

        // ===== GESTION DES ERREURS =====
        if (!response.ok) {
            console.error("Erreur API backend:", responseData);

            if (response.status === 404) {
                return json({ 
                    error: "Produit non trouvé ou déjà supprimé" 
                }, { status: 404 });
            } else if (response.status === 401) {
                return json({ 
                    error: "Non autorisé. Vérifiez vos permissions." 
                }, { status: 401 });
            } else if (response.status === 403) {
                return json({ 
                    error: "Accès interdit. Vous n'avez pas les droits pour supprimer ce produit." 
                }, { status: 403 });
            } else {
                return json({ 
                    error: `Erreur ${response.status}: ${typeof responseData === 'object' ? responseData.message || 'Erreur lors de la suppression' : responseData || 'Erreur inconnue'}` 
                }, { status: response.status });
            }
        }
        // ===============================

        // ===== TRAITEMENT DU SUCCÈS =====
        console.log(`✅ Produit ${productId} supprimé avec succès par utilisateur (rôle: ${userRole})`);

        return json({ 
            success: true,
            message: "Produit supprimé avec succès !",
            productId
        });
        // ================================

    } catch (error) {
        // ===== GESTION DES EXCEPTIONS =====
        console.error("Erreur lors de la suppression du produit:", error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return json({ 
                error: "Impossible de contacter le serveur. Veuillez réessayer plus tard." 
            }, { status: 503 });
        }

        return json({ 
            error: "Erreur technique lors de la suppression du produit." 
        }, { status: 500 });
        // =================================
    }
}
