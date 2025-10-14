import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
    const token = await readToken(request);
    if (!token) {
        return json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
        return json({ success: false, error: "ID catégorie manquant" }, { status: 400 });
    }

    try {
        console.log(`📂 Récupération de la catégorie ${id}`);

        // Utiliser le bon endpoint backend
        const response = await fetch(`https://showroom-backend-2x3g.onrender.com/products/categories/${id}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erreur API catégorie:", response.status, errorText);

            let errorMessage = "Erreur lors de la récupération de la catégorie";

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
            } else if (response.status === 401) {
                errorMessage = "Session expirée, veuillez vous reconnecter";
            } else if (response.status === 403) {
                errorMessage = "Vous n'avez pas l'autorisation d'accéder à cette catégorie";
            }

            return json({ 
                success: false, 
                error: errorMessage 
            }, { status: response.status });
        }

        const category = await response.json();
        console.log(`✅ Catégorie ${id} récupérée avec succès:`, category.name);

        return json({ 
            success: true,
            category: category
        });

    } catch (error) {
        console.error("❌ Erreur lors de la récupération de la catégorie:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};
