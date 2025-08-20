import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
    // ===== CONFIGURATION =====
    const BACKEND_URL = "https://showroom-backend-2x3g.onrender.com/products/";
    const ALLOWED_ROLES = ["client", "vendeur", "admin"]; // Rôles autorisés à modifier des produits
    // =========================

    // ===== AUTHENTIFICATION ET AUTORISATION =====
    const token = await readToken(request);
    if (!token) {
        return json({ error: "Vous devez être connecté pour modifier un produit." }, { status: 401 });
    }

    const productId = params.productId;
    if (!productId) {
        return json({ error: "ID du produit manquant" }, { status: 400 });
    }

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
            console.log("Rôle utilisateur pour modification:", userRole);

            if (!ALLOWED_ROLES.includes(userRole)) {
                return json({ 
                    error: `Accès refusé. Votre rôle (${userRole}) n'est pas autorisé à modifier des produits.` 
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
        // ===== RÉCUPÉRATION DES DONNÉES =====
        // Traiter les données comme multipart/form-data
        const formData = await request.formData();

        console.log("Données de mise à jour reçues:");
        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        // Construire l'objet de mise à jour selon l'API
        const updateData: any = {};

        // Récupérer les valeurs du formData
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = formData.get("price") as string;
        const category_id = formData.get("category_id") as string;
        const stock = formData.get("stock") as string;
        const sizes = formData.get("sizes") as string;
        const colors = formData.get("colors") as string;
        const tags = formData.get("tags") as string;

        // Champs simples
        if (name && name.trim()) updateData.name = name.trim();
        if (description && description.trim()) updateData.description = description.trim();
        if (price && !isNaN(parseFloat(price))) updateData.price = parseFloat(price);
        if (category_id && category_id.trim()) updateData.category_id = category_id.trim();
        if (stock && !isNaN(parseInt(stock))) updateData.stock = parseInt(stock);

        // Champs tableaux - traiter les chaînes JSON
        try {
            if (sizes) {
                // Si c'est déjà un JSON, le parser, sinon traiter comme chaîne
                if (sizes.startsWith('[') || sizes.startsWith('\"')) {
                    updateData.sizes = JSON.parse(sizes);
                } else {
                    // Traiter comme chaîne séparée par des virgules
                    updateData.sizes = sizes.split(',').map(s => s.trim()).filter(Boolean);
                }
            }

            if (colors) {
                if (colors.startsWith('[') || colors.startsWith('\"')) {
                    updateData.colors = JSON.parse(colors);
                } else {
                    updateData.colors = colors.split(',').map(c => c.trim()).filter(Boolean);
                }
            }

            if (tags) {
                if (tags.startsWith('[') || tags.startsWith('\"')) {
                    updateData.tags = JSON.parse(tags);
                } else {
                    updateData.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
                }
            }
        } catch (error) {
            console.error("Erreur lors du parsing des tableaux:", error);
            return json({ 
                error: "Format invalide pour les tailles, couleurs ou tags" 
            }, { status: 422 });
        }

        console.log("Données à envoyer au backend:", updateData);
        // ==================================

        // ===== ENVOI À L'API BACKEND =====
        const apiUrl = `${BACKEND_URL}${productId}`;
        console.log("🔄 Mise à jour du produit:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateData)
        });

        console.log("Réponse API mise à jour:", response.status, response.statusText);
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
                    error: "Produit non trouvé" 
                }, { status: 404 });
            } else if (response.status === 401) {
                return json({ 
                    error: "Non autorisé. Vérifiez vos permissions." 
                }, { status: 401 });
            } else if (response.status === 403) {
                return json({ 
                    error: "Accès interdit. Vous n'avez pas les droits pour modifier ce produit." 
                }, { status: 403 });
            } else if (response.status === 422) {
                return json({ 
                    error: "Données invalides",
                    details: errorData.detail || {}
                }, { status: 422 });
            } else {
                return json({ 
                    error: `Erreur ${response.status}: ${errorData.message || "Erreur lors de la mise à jour du produit"}`
                }, { status: response.status });
            }
        }
        // ===============================

        // ===== TRAITEMENT DU SUCCÈS =====
        const updatedProduct = await response.json();
        console.log(`✅ Produit mis à jour avec succès par utilisateur (rôle: ${userRole}):`, updatedProduct.name);

        return json({ 
            success: true,
            message: "Produit mis à jour avec succès !",
            product: updatedProduct
        });
        // ================================

    } catch (error) {
        // ===== GESTION DES EXCEPTIONS =====
        console.error("Erreur lors de la mise à jour du produit:", error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return json({ 
                error: "Impossible de contacter le serveur. Veuillez réessayer plus tard." 
            }, { status: 503 });
        }

        return json({ 
            error: "Erreur technique lors de la mise à jour du produit." 
        }, { status: 500 });
        // =================================
    }
}
