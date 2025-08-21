import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { readSessionData } from "~/utils/session.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Panier - Adawi" },
        { name: "description", content: "Votre panier d'achats - Finalisez votre commande" },
    ];
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  images: string[];
  stock: number;
  product_id: string;
}

interface LoaderData {
  cartItems: CartItem[];
  total: number;
  isLoggedIn: boolean;
  error?: string;
  debugInfo?: any;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    console.log("🔍 Début du loader checkout");

    // Récupérer les données de session
    const sessionData = await readSessionData(request);
    console.log("📋 Session data:", sessionData);

    if (!sessionData || !sessionData.session_id) {
      console.log("❌ Pas de session_id trouvé");
      return json<LoaderData>({
        cartItems: [],
        total: 0,
        isLoggedIn: false,
        error: "Vous devez être connecté pour voir votre panier",
        debugInfo: { sessionData }
      });
    }

    console.log("🔑 Session ID trouvé:", sessionData.session_id);

    // Appel à l'API pour récupérer le panier
    const apiUrl = `${process.env.API_BASE_URL || 'https://showroom-backend-2x3g.onrender.com'}/cart/?session-id=${sessionData.session_id}`;
    console.log("📡 Appel API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.access_token}`,
      },
    });

    console.log("📥 Réponse API:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      if (response.status === 401) {
        return json<LoaderData>({
          cartItems: [],
          total: 0,
          isLoggedIn: false,
          error: "Votre session a expiré. Veuillez vous reconnecter.",
          debugInfo: { 
            sessionData, 
            apiResponse: { status: response.status, statusText: response.statusText }
          }
        });
      }

      const errorText = await response.text();
      console.log("❌ Erreur API:", errorText);
      
      throw new Error(`Erreur API: ${response.status} - ${errorText}`);
    }

    const cartData = await response.json();
    console.log("✅ Données du panier reçues:", cartData);

    // Transformer les données de l'API vers notre format
    const cartItems: CartItem[] = cartData.items?.map((item: any) => ({
      id: item.id || item.product_id,
      name: item.name || item.product_name || 'Produit sans nom',
      price: item.price || 0,
      quantity: item.quantity || 1,
      size: item.size,
      color: item.color,
      images: item.images || ['/placeholder-product.png'],
      stock: item.stock || 0,
      product_id: item.product_id
    })) || [];

    const total = cartData.total || cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    console.log("✅ Panier transformé:", { itemsCount: cartItems.length, total });

    return json<LoaderData>({
      cartItems,
      total,
      isLoggedIn: true,
      debugInfo: {
        sessionData: { session_id: sessionData.session_id, hasToken: !!sessionData.access_token },
        apiResponse: { status: response.status, itemsCount: cartItems.length }
      }
    });

  } catch (error) {
    console.error("❌ Erreur dans le loader:", error);
    return json<LoaderData>({
      cartItems: [],
      total: 0,
      isLoggedIn: false,
      error: `Erreur lors du chargement du panier: ${error.message}`,
      debugInfo: { error: error.message }
    }, { status: 500 });
  }
}

export default function Checkout() {
    const { cartItems, total, isLoggedIn, error, debugInfo } = useLoaderData<LoaderData>();
    const navigate = useNavigate();
    const [orderNote, setOrderNote] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isClearing, setIsClearing] = useState(false);

    // Gestion des erreurs
    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <TopBanner />
                <Header />
                <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                    <h1 className="text-3xl font-bold text-black mb-8">CART</h1>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-12">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur de chargement</h2>
                        <p className="text-red-600 mb-6">{error}</p>
                        <div className="space-x-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Réessayer
                            </button>
                            <Link 
                                to="/login" 
                                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Se connecter
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Si pas connecté
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-white">
                <TopBanner />
                <Header />
                <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                    <h1 className="text-3xl font-bold text-black mb-8">CART</h1>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12">
                        <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-yellow-800 mb-2">Connexion requise</h2>
                        <p className="text-yellow-700 mb-6">Vous devez être connecté pour voir votre panier</p>
                        <Link 
                            to="/login" 
                            className="inline-block bg-adawi-gold hover:bg-adawi-gold/90 text-white font-medium py-3 px-8 rounded-full transition-colors duration-300"
                        >
                            Se connecter
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(itemId);
            return;
        }
        
        setIsUpdating(itemId);
        
        try {
            console.log('🔄 Mise à jour quantité:', { itemId, newQuantity });
            
            const response = await fetch('/api/cart/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    product_id: itemId,
                    quantity: newQuantity
                }),
            });

            const result = await response.json();
            console.log('📥 Réponse update:', result);

            if (result.success) {
                // Recharger la page pour voir les changements
                window.location.reload();
            } else {
                console.error('❌ Erreur lors de la mise à jour:', result.error);
                alert(`Erreur: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setIsUpdating(null);
        }
    };

    const removeItem = async (itemId: string) => {
        setIsUpdating(itemId);
        
        try {
            console.log('🗑️ Suppression produit:', { itemId });
            
            const response = await fetch('/api/cart/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    product_id: itemId
                }),
            });

            const result = await response.json();
            console.log('📥 Réponse remove:', result);

            if (result.success) {
                // Recharger la page pour voir les changements
                window.location.reload();
            } else {
                console.error('❌ Erreur lors de la suppression:', result.error);
                alert(`Erreur: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setIsUpdating(null);
        }
    };

    const clearCart = async () => {
        if (!confirm('Êtes-vous sûr de vouloir vider votre panier ? Cette action est irréversible.')) {
            return;
        }

        setIsClearing(true);
        
        try {
            console.log('🗑️ Vidage du panier');
            
            const response = await fetch('/api/cart/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const result = await response.json();
            console.log('📥 Réponse clear:', result);

            if (result.success) {
                // Recharger la page pour voir les changements
                window.location.reload();
            } else {
                console.error('❌ Erreur lors du vidage:', result.error);
                alert(`Erreur: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
        } finally {
            setIsClearing(false);
        }
    };

    const handleCheckout = () => {
    // Vérifier si le panier n'est pas vide
    if (!cartItems || cartItems.length === 0) {
        alert("Votre panier est vide");
        return;
    }

    // Rediriger vers la page informations
    navigate('/informations');
};

    // Vérifications de sécurité pour l'état du panier
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <TopBanner />
                <Header />
                <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                    <h1 className="text-3xl font-bold text-black mb-8">CART</h1>
                    <div className="bg-gray-50 rounded-lg p-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Votre panier est vide</h2>
                        <p className="text-gray-600 mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
                        <Link 
                            to="/boutique" 
                            className="inline-block bg-adawi-gold hover:bg-adawi-gold/90 text-white font-medium py-3 px-8 rounded-full transition-colors duration-300"
                        >
                            Continuer les achats
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <TopBanner />
            <Header />

            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Titre avec compteur d'articles et bouton vider */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-black mb-2 tracking-wider">CART</h1>
                    {/* <p className="text-gray-600 mb-4">
                        {cartItems.length} article{cartItems.length > 1 ? 's' : ''} dans votre panier
                    </p> */}
                    <p className="text-gray-600 mb-4">
                        Frais de livraison payé à la réception de la marchandise
                    </p>
                    
                    {/* Bouton vider le panier */}
                    {cartItems.length > 0 && (
                        <button
                            onClick={clearCart}
                            disabled={isClearing || isUpdating !== null}
                            className={`text-sm text-red-600 hover:text-red-800 underline transition-colors ${
                                isClearing || isUpdating !== null ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                        >
                            {isClearing ? (
                                <span className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Vidage en cours...
                                </span>
                            ) : (
                                'Vider le panier'
                            )}
                        </button>
                    )}
                </div>

                {/* En-têtes du tableau */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 pb-4 border-b border-gray-200 mb-8">
                    <div className="col-span-6">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">PRODUCT</h3>
                    </div>
                    <div className="col-span-3 text-center">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">QUANTITY</h3>
                    </div>
                    <div className="col-span-3 text-right">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">TOTAL</h3>
                    </div>
                </div>

                {/* Articles du panier */}
                <div className="space-y-8 mb-12">
                    {cartItems.map((item) => {
                        const itemPrice = item.price || 0;
                        const quantity = item.quantity || 1;
                        const itemTotal = itemPrice * quantity;
                        const itemId = item.product_id || item.id;

                        return (
                            <div key={itemId} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b border-gray-100">
                                {/* Produit */}
                                <div className="md:col-span-6 flex items-center space-x-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.images?.[0] || '/placeholder-product.png'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-product.png';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Produit
                                        </p>
                                        <h3 className="text-base font-medium text-black mb-1 truncate">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {itemPrice.toLocaleString()} fcfa
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(item.size || 'M').toUpperCase()} / {(item.color || 'NOIR').toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                {/* Quantité */}
                                <div className="md:col-span-3 flex items-center justify-center space-x-3">
                                    <button
                                        onClick={() => updateQuantity(itemId, quantity - 1)}
                                        disabled={isUpdating === itemId || quantity <= 1 || isClearing}
                                        className={`w-8 h-8 border flex items-center justify-center text-lg font-medium transition-colors ${
                                            quantity <= 1 || isUpdating === itemId || isClearing
                                                ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {isUpdating === itemId ? (
                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            '−'
                                        )}
                                    </button>
                                    <span className="text-base font-medium text-black min-w-[2rem] text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(itemId, quantity + 1)}
                                        disabled={isUpdating === itemId || isClearing}
                                        className={`w-8 h-8 border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium ${
                                            isUpdating === itemId || isClearing ? 'cursor-not-allowed opacity-50' : ''
                                        }`}
                                    >
                                        {isUpdating === itemId ? (
                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            '+'
                                        )}
                                    </button>
                                </div>

                                {/* Total et Remove */}
                                <div className="md:col-span-3 text-right space-y-2">
                                    <p className="text-lg font-medium text-black">
                                        {itemTotal.toLocaleString()} fcfa
                                    </p>
                                    <button
                                        onClick={() => removeItem(itemId)}
                                        disabled={isUpdating === itemId || isClearing}
                                        className={`text-sm text-gray-500 hover:text-red-600 underline transition-colors ${
                                            isUpdating === itemId || isClearing ? 'cursor-not-allowed opacity-50' : ''
                                        }`}
                                    >
                                        {isUpdating === itemId ? 'Suppression...' : 'Supprimer'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Section inférieure */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Note de commande */}
                    <div>
                        <h3 className="text-base font-medium text-black mb-4">Note de commande</h3>
                        <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder="Comment pouvons-nous vous aider?"
                            disabled={isClearing}
                            className={`w-full h-32 p-4 border border-black bg-white text-black rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent text-sm ${
                                isClearing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        />
                    </div>

                    {/* Résumé et checkout */}
                    <div className="space-y-6">
                        {/* Calculs */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-base">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium text-black">{total.toLocaleString()} fcfa</span>
                            </div>
                            <div className="flex justify-between text-base">
                                <span className="text-gray-600">Taxes:</span>
                                <span className="font-medium text-black">0 fcfa</span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-black">Total:</span>
                                    <span className="text-black">{total.toLocaleString()} fcfa</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500">
                            Taxes et <span className="underline">shipping</span> calculated at checkout
                        </p>

                        {/* Bouton checkout */}
                        <button
                            onClick={handleCheckout}
                            disabled={isClearing}
                            className={`w-full bg-black text-white font-medium py-4 px-6 text-base rounded-full hover:bg-gray-800 transition-colors duration-200 tracking-wider ${
                                isClearing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {/*  ({total.toLocaleString()} fcfa) */}POURSUIVRE
                        </button>

                        {/* Lien continuer les achats */}
                        <div className="text-center">
                            <Link 
                                to="/boutique" 
                                className="text-sm text-gray-600 hover:text-adawi-gold underline transition-colors"
                            >
                                Continuer les achats
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}