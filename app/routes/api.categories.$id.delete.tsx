import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request, params }) => {
    if (request.method !== "DELETE") {
        return json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
    }

    const token = await readToken(request);
    if (!token) {
        return json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
        return json({ success: false, error: "ID catégorie manquant" }, { status: 400 });
    }

    try {
        console.log(`🗑️ Suppression de la catégorie ${id}`);

        const response = await fetch(`https://showroom-backend-2x3g.onrender.com/products/categories/${id}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erreur API suppression catégorie:", response.status, errorText);
            
            let errorMessage = "Erreur lors de la suppression de la catégorie";
            
            try {
                const errorData = JSON.parse(errorText);
                if (errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        errorMessage = errorData.detail.map((err: any) => {
                            const field = err.loc ? err.loc[err.loc.length - 1] : 'Champ';
                            return `${field}: ${err.msg}`;
                        }).join(", ");
                    } else if (typeof errorData.detail === 'string') {
                        errorMessage = errorData.detail;
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                if (errorText) {
                    errorMessage = errorText;
                }
            }

            if (response.status === 404) {
                errorMessage = "Catégorie non trouvée";
            } else if (response.status === 403) {
                errorMessage = "Vous n'avez pas l'autorisation de supprimer cette catégorie (admin uniquement)";
            } else if (response.status === 401) {
                errorMessage = "Session expirée, veuillez vous reconnecter";
            } else if (response.status === 409) {
                errorMessage = "Impossible de supprimer cette catégorie car elle contient des sous-catégories ou des produits";
            }

            return json({ 
                success: false, 
                error: errorMessage 
            }, { status: response.status });
        }

        // Vérifier si la réponse contient du contenu
        let responseData = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            if (text) {
                responseData = JSON.parse(text);
            }
        } else {
            // Si c'est juste une string comme indiqué dans l'API
            responseData = await response.text();
        }

        console.log("✅ Catégorie supprimée avec succès:", responseData);

        return json({
            success: true,
            message: "Catégorie supprimée avec succès",
            categoryId: id
        });

    } catch (error) {
        console.error("❌ Erreur lors de la suppression de la catégorie:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};
