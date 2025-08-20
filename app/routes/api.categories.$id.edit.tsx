import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request, params }) => {
    if (request.method !== "POST") {
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
        console.log(`📝 Modification de la catégorie ${id}`);

        // Récupérer les données du formulaire
        const formData = await request.formData();
        
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const parent_id = formData.get("parent_id") as string;

        // Validation des champs requis
        if (!name || !description) {
            return json({ 
                success: false, 
                error: "Le nom et la description sont requis" 
            }, { status: 400 });
        }

        // Préparer les données pour l'API
        const categoryData = {
            name: name.trim(),
            description: description.trim(),
            ...(parent_id && parent_id.trim() !== '' && { parent_id: parent_id.trim() })
        };

        console.log("📤 Envoi des modifications vers l'API backend:", categoryData);

        // Appel à l'API backend
        const response = await fetch(`https://showroom-backend-2x3g.onrender.com/products/categories/${id}`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erreur API modification catégorie:", response.status, errorText);
            
            let errorMessage = "Erreur lors de la modification de la catégorie";
            
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
                errorMessage = "Vous n'avez pas l'autorisation de modifier cette catégorie (admin uniquement)";
            } else if (response.status === 401) {
                errorMessage = "Session expirée, veuillez vous reconnecter";
            } else if (response.status === 409) {
                errorMessage = "Une catégorie avec ce nom existe déjà";
            }

            return json({ 
                success: false, 
                error: errorMessage 
            }, { status: response.status });
        }

        const updatedCategory = await response.json();
        console.log("✅ Catégorie modifiée avec succès:", updatedCategory.id);

        return json({
            success: true,
            message: "Catégorie modifiée avec succès",
            category: updatedCategory
        });

    } catch (error) {
        console.error("❌ Erreur lors de la modification de la catégorie:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};
