import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { readToken } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
    }

    const token = await readToken(request);
    if (!token) {
        return json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    try {
        console.log("📦 Création d'un nouveau produit");

        // Récupérer les données du formulaire
        const formData = await request.formData();

        // Validation des champs requis
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = formData.get("price") as string;
        const category_id = formData.get("category_id") as string;
        const stock = formData.get("stock") as string;

        if (!name || !description || !price || !category_id || !stock) {
            return json({ 
                success: false, 
                error: "Champs requis manquants" 
            }, { status: 400 });
        }

        // Préparer les données pour l'API
        const apiFormData = new FormData();

        // Champs requis
        apiFormData.append("name", name);
        apiFormData.append("description", description);
        apiFormData.append("price", price);
        apiFormData.append("category_id", category_id);
        apiFormData.append("stock", stock);

        // Champs optionnels
        const cost_price = formData.get("cost_price") as string;
        if (cost_price) {
            apiFormData.append("cost_price", cost_price);
        }

        const low_stock_threshold = formData.get("low_stock_threshold") as string;
        if (low_stock_threshold) {
            apiFormData.append("low_stock_threshold", low_stock_threshold);
        }

        const is_active = formData.get("is_active") as string;
        if (is_active) {
            apiFormData.append("is_active", is_active);
        }

        // Arrays (sizes, colors, tags)
        const sizes = formData.get("sizes") as string;
        if (sizes) {
            apiFormData.append("sizes", sizes);
        }

        const colors = formData.get("colors") as string;
        if (colors) {
            apiFormData.append("colors", colors);
        }

        const tags = formData.get("tags") as string;
        if (tags) {
            apiFormData.append("tags", tags);
        }

        // Images principales
        const images = formData.getAll("images") as File[];
        if (images.length === 0) {
            return json({ 
                success: false, 
                error: "Au moins une image est requise" 
            }, { status: 400 });
        }

        images.forEach((image) => {
            if (image instanceof File && image.size > 0) {
                apiFormData.append("images", image);
            }
        });

        // Images de survol (optionnelles)
        const hoverImages = formData.getAll("hover_images") as File[];
        hoverImages.forEach((image) => {
            if (image instanceof File && image.size > 0) {
                apiFormData.append("hover_images", image);
            }
        });

        console.log("📤 Envoi des données vers l'API backend");

        // Appel à l'API backend
        const response = await fetch("https://showroom-backend-2x3g.onrender.com/products/", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                // Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
            },
            body: apiFormData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erreur API création:", response.status, errorText);

            let errorMessage = "Erreur lors de la création du produit";

            try {
                const errorData = JSON.parse(errorText);
                if (errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        // Erreurs de validation
                        errorMessage = errorData.detail.map((err: any) => err.msg).join(", ");
                    } else if (typeof errorData.detail === 'string') {
                        errorMessage = errorData.detail;
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                // Si ce n'est pas du JSON, utiliser le texte brut
                if (errorText) {
                    errorMessage = errorText;
                }
            }

            if (response.status === 403) {
                errorMessage = "Vous n'avez pas l'autorisation de créer des produits";
            } else if (response.status === 401) {
                errorMessage = "Session expirée, veuillez vous reconnecter";
            }

            return json({ 
                success: false, 
                error: errorMessage 
            }, { status: response.status });
        }

        const productData = await response.json();
        console.log("✅ Produit créé avec succès:", productData.id);

        return json({ 
            success: true, 
            message: "Produit créé avec succès", 
            product: productData 
        });

    } catch (error) {
        console.error("❌ Erreur lors de la création du produit:", error);
        return json({ 
            success: false, 
            error: "Erreur de connexion au serveur" 
        }, { status: 500 });
    }
};
