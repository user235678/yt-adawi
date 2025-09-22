import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { readSessionData } from "~/utils/session.server";
import SellerLayout from "~/components/seller/SellerLayout";

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
    sessionData?: {
        session_id: string;
        access_token: string;
    };
}

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        console.log("🔍 Début du loader panier");

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
            sessionData: {
                session_id: sessionData.session_id,
                access_token: sessionData.access_token
            },
            debugInfo: {
                sessionData: { session_id: sessionData.session_id, hasToken: !!sessionData.access_token },
                apiResponse: { status: response.status, itemsCount: cartItems.length }
            }
        });

    } catch (error) {
        console.error("❌ Erreur dans le loader:", error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        return json<LoaderData>({
            cartItems: [],
            total: 0,
            isLoggedIn: false,
            error: `Erreur lors du chargement du panier: ${errorMessage}`,
            debugInfo: { error: errorMessage }
        }, { status: 500 });
    }
}

export default function panier() {
    const { cartItems, total, isLoggedIn, error, debugInfo, sessionData } = useLoaderData<LoaderData>();
    const navigate = useNavigate();
    const [orderNote, setOrderNote] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isClearing, setIsClearing] = useState(false);
    const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    // Animation de chargement initial
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(itemId);
            return;
        }

        setIsUpdating(itemId);
        setAnimatingItems(prev => new Set(prev).add(itemId));

        try {
            console.log('🔄 Mise à jour quantité:', { itemId, newQuantity });

            const apiBaseUrl = 'https://showroom-backend-2x3g.onrender.com';
            // ✅ Utiliser PUT au lieu de POST pour la mise à jour
            const apiUrl = `${apiBaseUrl}/cart/update`;
            console.log('📡 Appel API update:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'PUT', // ✅ Changé de POST à PUT
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionData?.access_token || ''}`,
                },
                body: JSON.stringify({
                    session_id: sessionData?.session_id,
                    product_id: itemId,
                    quantity: newQuantity
                }),
            });

            console.log('📥 Réponse update:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                let errorMessage = `Erreur ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('✅ Résultat update:', result);

            if (result.success) {
                setTimeout(() => {
                    window.location.reload();
                }, 300);
            } else {
                console.error('❌ Erreur lors de la mise à jour:', result.error);
                alert(`Erreur: ${result.error || 'Erreur lors de la mise à jour'}`);
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                alert("Votre session a expiré. Veuillez vous reconnecter.");
                navigate('/login');
            } else {
                alert(`Erreur de connexion: ${errorMessage}. Veuillez réessayer.`);
            }
        } finally {
            setTimeout(() => {
                setIsUpdating(null);
                setAnimatingItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(itemId);
                    return newSet;
                });
            }, 500);
        }
    };

    const removeItem = async (itemId: string) => {
        setIsUpdating(itemId);
        setAnimatingItems(prev => new Set(prev).add(itemId));

        try {
            console.log('🗑️ Suppression produit:', { itemId });

            const apiBaseUrl = 'https://showroom-backend-2x3g.onrender.com';
            // ✅ Utiliser le bon endpoint : /cart/remove/{product_id}
            const apiUrl = `${apiBaseUrl}/cart/remove/${itemId}`;
            console.log('📡 Appel API remove:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionData?.access_token || ''}`,
                    // ✅ Envoyer session-id dans les headers au lieu du body
                    'session-id': sessionData?.session_id || '',
                },
                // ✅ Pas de body nécessaire selon la documentation
            });

            console.log('📥 Réponse remove:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                let errorMessage = `Erreur ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('✅ Résultat remove:', result);

            // ✅ L'API retourne directement le panier mis à jour
            setTimeout(() => {
                window.location.reload();
            }, 300);

        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                alert("Votre session a expiré. Veuillez vous reconnecter.");
                navigate('/login');
            } else {
                alert(`Erreur de connexion: ${errorMessage}. Veuillez réessayer.`);
            }
        } finally {
            setTimeout(() => {
                setIsUpdating(null);
                setAnimatingItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(itemId);
                    return newSet;
                });
            }, 500);
        }
    };

    const clearCart = async () => {
        if (!confirm('Êtes-vous sûr de vouloir vider votre panier ? Cette action est irréversible.')) {
            return;
        }

        setIsClearing(true);

        try {
            console.log('🗑️ Vidage du panier');

            const apiBaseUrl = 'https://showroom-backend-2x3g.onrender.com';
            // ✅ Utiliser le bon endpoint : /cart/clear
            const apiUrl = `${apiBaseUrl}/cart/clear`;
            console.log('📡 Appel API clear:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionData?.access_token || ''}`,
                    // ✅ Envoyer session-id dans les headers au lieu du body
                    'session-id': sessionData?.session_id || '',
                },
                // ✅ Pas de body nécessaire selon la documentation
            });

            console.log('📥 Réponse clear:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                let errorMessage = `Erreur ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('✅ Résultat clear:', result);

            // ✅ L'API retourne directement le panier vide
            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                alert("Votre session a expiré. Veuillez vous reconnecter.");
                navigate('/login');
            } else {
                alert(`Erreur de connexion: ${errorMessage}. Veuillez réessayer.`);
            }
        } finally {
            setIsClearing(false);
        }
    };

    const handlePhysicalSale = async () => {
        if (!cartItems || cartItems.length === 0) {
            alert("Votre panier est vide");
            return;
        }

        try {
            const response = await fetch('https://showroom-backend-2x3g.onrender.com/orders/physical-sale', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionData?.access_token}`,
                },
            });

            if (response.ok) {
                const result = await response.json();
                alert(`✅ Vente créée! Commande: ${result.identifier}`);
                navigate('/seller/orders');
            } else {
                const errorText = await response.text();
                alert(`Erreur ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Erreur:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            alert(`Erreur: ${errorMessage}`);
        }
    };

    return (
        <SellerLayout userName="VENDEUR">
            {/* Gestion des erreurs */}
            {error && (
                <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
                    <div className={`transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-8">PANIER</h1>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-12 shadow-lg">
                            <div className="animate-bounce">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-lg sm:text-xl font-semibold text-red-800 mb-2">Erreur de chargement</h2>
                            <p className="text-red-600 mb-6 text-sm sm:text-base">{error}</p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    Réessayer
                                </button>
                                <Link
                                    to="/login"
                                    className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                                >
                                    Se connecter
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Si pas connecté */}
            {!isLoggedIn && !error && (
                <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
                    <div className={`transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-8">PANIER</h1>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 sm:p-12 shadow-lg">
                            <div className="animate-pulse">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-lg sm:text-xl font-semibold text-yellow-800 mb-2">Connexion requise</h2>
                            <p className="text-yellow-700 mb-6 text-sm sm:text-base">Vous devez être connecté pour voir votre panier</p>
                            <Link
                                to="/login"
                                className="inline-block bg-adawi-gold hover:bg-adawi-gold/90 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Se connecter
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Vérifications de sécurité pour l'état du panier */}
            {(!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) && isLoggedIn && !error && (
                <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
                    <div className={`transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6 sm:mb-8">PANIER</h1>
                        <div className="bg-gray-50 rounded-xl p-6 sm:p-12 shadow-lg">
                            <div className="animate-pulse">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                </svg>
                            </div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Votre panier est vide</h2>
                            <p className="text-gray-600 mb-6 text-sm sm:text-base">Découvrez nos produits et ajoutez-les à votre panier</p>
                            <Link
                                to="/boutique"
                                className="inline-block bg-adawi-gold hover:bg-adawi-gold/90 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Découvrir nos produits
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenu principal du panier - affiché uniquement s'il y a des articles */}
            {cartItems && Array.isArray(cartItems) && cartItems.length > 0 && isLoggedIn && !error && (
                <div className="py-6 sm:py-12">
                    {/* Titre avec compteur d'articles et bouton vider */}
                    <div className={`text-center mb-8 sm:mb-12 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2 tracking-wider">PANIER</h1>
                        <p className="text-gray-600 mb-4 text-sm sm:text-base">
                            Frais de livraison payé à la réception de la marchandise
                        </p>

                        {/* Bouton vider le panier */}
                        {cartItems.length > 0 && (
                            <button
                                onClick={clearCart}
                                disabled={isClearing || isUpdating !== null}
                                className={`text-sm text-red-600 hover:text-red-800 underline transition-all duration-300 transform hover:scale-105 ${isClearing || isUpdating !== null ? 'cursor-not-allowed opacity-50' : ''}`}
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

                    {/* En-têtes du tableau - seulement sur desktop */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 pb-4 border-b border-gray-200 mb-8">
                        <div className="col-span-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">PRODUIT</h3>
                        </div>
                        <div className="col-span-3 text-center">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">QUANTITÉ</h3>
                        </div>
                        <div className="col-span-3 text-right">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">TOTAL</h3>
                        </div>
                    </div>

                    {/* Articles du panier */}
                    <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                        {cartItems.map((item, index) => {
                            const itemPrice = item.price || 0;
                            const quantity = item.quantity || 1;
                            const itemTotal = itemPrice * quantity;
                            const itemId = item.product_id || item.id;
                            const isAnimating = animatingItems.has(itemId);

                            return (
                                <div
                                    key={itemId}
                                    className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${isAnimating ? 'scale-105 shadow-lg' : 'hover:scale-[1.02]'}`}
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        transitionDelay: isLoaded ? `${index * 100}ms` : '0ms'
                                    }}
                                >
                                    {/* Version Mobile */}
                                    <div className="lg:hidden p-4 sm:p-6">
                                        <div className="flex space-x-4">
                                            {/* Image */}
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.images?.[0] || '/placeholder-product.png'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/placeholder-product.png';
                                                    }}
                                                />
                                            </div>

                                            {/* Informations produit */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base sm:text-lg font-medium text-black mb-1 truncate">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {itemPrice.toLocaleString()} F CFA
                                                </p>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    {(item.size || 'M').toUpperCase()} / {(item.color || 'NOIR').toUpperCase()}
                                                </p>

                                                {/* Contrôles quantité mobile */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => updateQuantity(itemId, quantity - 1)}
                                                            disabled={isUpdating === itemId || quantity <= 1 || isClearing}
                                                            className={`w-8 h-8 border rounded-full flex items-center justify-center text-lg font-medium transition-all duration-200 ${quantity <= 1 || isUpdating === itemId || isClearing
                                                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50 active:scale-95'
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
                                                            className={`w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all duration-200 text-lg font-medium active:scale-95 ${isUpdating === itemId || isClearing ? 'cursor-not-allowed opacity-50' : ''}`}
                                                        >
                                                            {isUpdating === itemId ? (
                                                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                '+'
                                                            )}
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-lg font-medium text-black mb-1">
                                                            {itemTotal.toLocaleString()} F CFA
                                                        </p>
                                                        <button
                                                            onClick={() => removeItem(itemId)}
                                                            disabled={isUpdating === itemId || isClearing}
                                                            className={`text-sm text-gray-500 hover:text-red-600 underline transition-colors ${isUpdating === itemId || isClearing ? 'cursor-not-allowed opacity-50' : ''}`}
                                                        >
                                                            {isUpdating === itemId ? 'Suppression...' : 'Supprimer'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Version Desktop */}
                                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center p-6">
                                        {/* Produit */}
                                        <div className="col-span-6 flex items-center space-x-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.images?.[0] || '/placeholder-product.png'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/placeholder-product.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-medium text-black mb-1 truncate">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {itemPrice.toLocaleString()} F CFA
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(item.size || 'M').toUpperCase()} / {(item.color || 'NOIR').toUpperCase()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quantité */}
                                        <div className="col-span-3 flex items-center justify-center space-x-3">
                                            <button
                                                onClick={() => updateQuantity(itemId, quantity - 1)}
                                                disabled={isUpdating === itemId || quantity <= 1 || isClearing}
                                                className={`w-8 h-8 border rounded-full flex items-center justify-center text-lg font-medium transition-all duration-200 ${quantity <= 1 || isUpdating === itemId || isClearing
                                                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'border-gray-300 text-gray-600 hover:bg-gray-50 active:scale-95'
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
                                                className={`w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all duration-200 text-lg font-medium active:scale-95 ${isUpdating === itemId || isClearing ? 'cursor-not-allowed opacity-50' : ''}`}
                                            >
                                                {isUpdating === itemId ? (
                                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    '+'
                                                )}
                                            </button>
                                        </div>

                                        {/* Total et Remove */}
                                        <div className="col-span-3 text-right space-y-2">
                                            <p className="text-lg font-medium text-black">
                                                {itemTotal.toLocaleString()} F CFA
                                            </p>
                                            <button
                                                onClick={() => removeItem(itemId)}
                                                disabled={isUpdating === itemId || isClearing}
                                                className={`text-sm text-gray-500 hover:text-red-600 underline transition-colors ${isUpdating === itemId || isClearing ? 'cursor-not-allowed opacity-50' : ''}`}
                                            >
                                                {isUpdating === itemId ? 'Suppression...' : 'Supprimer'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Section inférieure */}
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: `${cartItems.length * 100 + 200}ms` }}>

                        {/* Note de commande */}
                        <div className="order-2 lg:order-1">
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                                <h3 className="text-base font-medium text-black mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Note de commande
                                </h3>
                                <textarea
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                    placeholder="Comment pouvons-nous vous aider? (instructions de livraison, demandes spéciales...)"
                                    disabled={isClearing}
                                    className={`w-full h-28 sm:h-32 p-4 border border-gray-200 bg-white text-black rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent text-sm transition-all duration-300 ${isClearing ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}`}
                                    maxLength={500}
                                />
                                <div className="text-right text-xs text-gray-400 mt-2">
                                    {orderNote.length}/500 caractères
                                </div>
                            </div>
                        </div>

                        {/* Résumé et checkout */}
                        <div className="order-1 lg:order-2">
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-300 sticky top-6">
                                <h3 className="text-lg font-medium text-black mb-6 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Résumé de commande
                                </h3>

                                {/* Calculs */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-base py-2">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium text-black">{total.toLocaleString()} F CFA</span>
                                    </div>
                                    <div className="flex justify-between text-base py-2">
                                        <span className="text-gray-600">Taxes:</span>
                                        <span className="font-medium text-black">0 F CFA</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between text-xl font-bold">
                                            <span className="text-black">Total:</span>
                                            <span className="text-adawi-gold">{total.toLocaleString()} F CFA</span>
                                        </div>
                                    </div>

                                    {/* Nombre d'articles */}
                                    <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-2">
                                        {cartItems.length} article{cartItems.length > 1 ? 's' : ''} dans votre panier
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                                        Taxes et frais de livraison calculés à la commande.
                                        <br />
                                        Frais de livraison payé à la réception de la marchandise
                                    </p>

                                    {/* Bouton checkout avec animation de pulse */}
                                    <button
                                        onClick={handlePhysicalSale}
                                        disabled={isClearing}
                                        className={`w-full bg-gradient-to-r from-adawi-gold to-adawi-gold text-white font-medium py-4 px-6 text-base rounded-full hover:bg-adawi-gold transition-all duration-300 tracking-wider transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${isClearing ? 'opacity-50 cursor-not-allowed' : 'animate-pulse hover:animate-none'}`}
                                    >
                                        <span className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            VENDRE
                                        </span>
                                    </button>

                                    {/* Méthodes de paiement acceptées */}
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 mb-2">Méthodes de paiement acceptées:</p>
                                        <div className="flex justify-center space-x-2">
                                            <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded text-white text-[8px] flex items-center justify-center font-bold">FLOOZ</div>
                                            <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded text-white text-[8px] flex items-center justify-center font-bold">MIX</div>
                                            <div className="w-8 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded text-white text-[8px] flex items-center justify-center font-bold">$</div>
                                        </div>
                                    </div>

                                    {/* Lien continuer les achats */}
                                    <div className="text-center pt-2">
                                        <Link
                                            to="/boutique"
                                            className="text-sm text-gray-600 hover:text-adawi-gold underline transition-all duration-300 hover:no-underline flex items-center justify-center group"
                                        >
                                            <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Continuer les achats
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section informations supplémentaires */}
                    <div className={`mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: `${cartItems.length * 100 + 400}ms` }}>

                        {/* Livraison */}
                        <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                            <div className="w-12 h-12 bg-adawi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h4 className="font-medium text-black mb-2">Livraison rapide</h4>
                            <p className="text-sm text-gray-600">Livraison sous 24-48h dans toute la région</p>
                        </div>

                        {/* Support */}
                        <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                            <div className="w-12 h-12 bg-adawi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="font-medium text-black mb-2">Support 24/7</h4>
                            <p className="text-sm text-gray-600">Une question? Notre équipe est là pour vous aider</p>
                        </div>

                        {/* Garantie */}
                        <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
                            <div className="w-12 h-12 bg-adawi-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-adawi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="font-medium text-black mb-2">Garantie qualité</h4>
                            <p className="text-sm text-gray-600">Satisfaction garantie ou remboursé</p>
                        </div>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
}