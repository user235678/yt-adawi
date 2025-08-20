import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { getSession } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");

    if (!userId) {
      return json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les items du panier depuis votre base de données
    // Remplacez par votre logique de base de données
    const cartItems = []; // await getCartItems(userId);

    return json({ 
      success: true, 
      items: cartItems,
      total: 0 // Calculer le total
    });
  } catch (error) {
    console.error("Erreur lors du chargement du panier:", error);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");

    if (!userId) {
      return json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await request.formData();
    const action = formData.get("action");

    switch (action) {
      case "add":
        // Logique d'ajout au panier
        return json({ success: true, message: "Produit ajouté au panier" });
        
      case "remove":
        // Logique de suppression du panier
        return json({ success: true, message: "Produit supprimé du panier" });
        
      case "update":
        // Logique de mise à jour de quantité
        return json({ success: true, message: "Quantité mise à jour" });
        
      default:
        return json({ error: "Action non reconnue" }, { status: 400 });
    }
  } catch (error) {
    console.error("Erreur dans l'action du panier:", error);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
}
