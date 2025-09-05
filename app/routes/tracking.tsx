import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { readSessionData } from "~/utils/session.server";

export const meta: MetaFunction = ({ params }) => {
    return [
        { title: `Suivi Commande ${params.order_id} - Adawi` },
        { name: "description", content: "Suivez l'état de votre commande en temps réel" },
    ];
};

interface TrackingStep {
    status: "en_cours" | "expedie" | "livre" | "annule";
    label: string;
    reached: boolean;
    date?: string;
}

interface HistoryItem {
    status: "en_cours" | "expedie" | "livre" | "annule";
    changed_at: string;
    comment?: string;
}

interface TrackingData {
    order_id: string;
    current_status: "en_cours" | "expedie" | "livre" | "annule";
    steps: TrackingStep[];
    history: HistoryItem[];
}

interface LoaderData {
    tracking?: TrackingData;
    error?: string;
    isLoggedIn: boolean;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
    try {
        const { order_id } = params;
        
        if (!order_id) {
            return json<LoaderData>({
                error: "ID de commande manquant",
                isLoggedIn: false,
            });
        }

        // Récupérer les données de session
        const sessionData = await readSessionData(request);
        
        if (!sessionData || !sessionData.access_token) {
            return json<LoaderData>({
                error: "Vous devez être connecté pour voir le suivi de votre commande",
                isLoggedIn: false,
            });
        }

        // Appel à l'API pour récupérer le tracking
        const apiUrl = `${process.env.API_BASE_URL || 'https://showroom-backend-2x3g.onrender.com'}/orders/${order_id}/tracking`;
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionData.access_token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                return json<LoaderData>({
                    error: "Votre session a expiré. Veuillez vous reconnecter.",
                    isLoggedIn: false,
                });
            }
            
            if (response.status === 404) {
                return json<LoaderData>({
                    error: "Commande introuvable. Vérifiez le numéro de commande.",
                    isLoggedIn: true,
                });
            }

            const errorText = await response.text();
            throw new Error(`Erreur API: ${response.status} - ${errorText}`);
        }

        const trackingData: TrackingData = await response.json();

        return json<LoaderData>({
            tracking: trackingData,
            isLoggedIn: true,
        });

    } catch (error) {
        console.error("Erreur lors du chargement du tracking:", error);
        return json<LoaderData>({
            error: `Erreur lors du chargement: ${error.message}`,
            isLoggedIn: false,
        }, { status: 500 });
    }
}

const statusConfig = {
    "en_cours": {
        label: "En cours",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: "⏳"
    },
    "expedie": {
        label: "Expédiée",
        color: "text-orange-600", 
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        icon: "📦"
    },
    "livre": {
        label: "Livrée",
        color: "text-green-600",
        bgColor: "bg-green-50", 
        borderColor: "border-green-200",
        icon: "✅"
    },
    "annule": {
        label: "Annulée",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200", 
        icon: "❌"
    }
};

export default function OrderTracking() {
    const { tracking, error, isLoggedIn } = useLoaderData<LoaderData>();
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Gestion des erreurs
    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <TopBanner />
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-center">
                    <div className={`transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-8">SUIVI DE COMMANDE</h1>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-8 shadow-lg">
                            <div className="text-4xl mb-4">😕</div>
                            <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur</h2>
                            <p className="text-red-600 mb-6">{error}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => window.history.back()}
                                    className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300"
                                >
                                    Retour
                                </button>
                                {!isLoggedIn && (
                                    <Link 
                                        to="/login" 
                                        className="inline-block bg-adawi-gold text-white px-6 py-3 rounded-xl hover:bg-adawi-gold/90 transition-all duration-300"
                                    >
                                        Se connecter
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!tracking) {
        return (
            <div className="min-h-screen bg-white">
                <TopBanner />
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-adawi-gold border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement du suivi...</p>
                </div>
                <Footer />
            </div>
        );
    }

    const currentStatusConfig = statusConfig[tracking.current_status];

    return (
        <div className="min-h-screen bg-white">
            <TopBanner />
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* En-tête */}
                <div className={`text-center mb-8 sm:mb-12 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">SUIVI DE COMMANDE</h1>
                    <p className="text-lg text-gray-600 mb-2">Commande #{tracking.order_id}</p>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${currentStatusConfig.bgColor} ${currentStatusConfig.borderColor} border`}>
                        <span className="text-2xl mr-2">{currentStatusConfig.icon}</span>
                        <span className={`font-medium ${currentStatusConfig.color}`}>
                            {currentStatusConfig.label}
                        </span>
                    </div>
                </div>

                {/* Timeline des étapes */}
                <div className={`mb-12 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                    <h2 className="text-xl font-semibold text-black mb-6 text-center">Progression de votre commande</h2>
                    
                    <div className="relative">
                        {/* Ligne de progression */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        
                        {tracking.steps.map((step, index) => {
                            const stepConfig = statusConfig[step.status];
                            return (
                                <div key={index} className="relative flex items-start mb-8 last:mb-0">
                                    {/* Cercle de l'étape */}
                                    <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                                        step.reached 
                                            ? `${stepConfig.bgColor} ${stepConfig.borderColor} border-2` 
                                            : 'bg-white border-gray-300'
                                    }`}>
                                        {step.reached ? (
                                            <span className="text-xs">{stepConfig.icon}</span>
                                        ) : (
                                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                        )}
                                    </div>
                                    
                                    {/* Contenu de l'étape */}
                                    <div className="ml-4 flex-1">
                                        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                                            <h3 className={`font-medium mb-1 ${step.reached ? stepConfig.color : 'text-gray-500'}`}>
                                                {step.label}
                                            </h3>
                                            {step.date && (
                                                <p className="text-sm text-gray-500">
                                                    {new Date(step.date).toLocaleString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Historique */}
                {tracking.history && tracking.history.length > 0 && (
                    <div className={`mb-12 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                        <h2 className="text-xl font-semibold text-black mb-6 text-center">Historique détaillé</h2>
                        
                        <div className="bg-gray-50 rounded-xl p-6">
                            <div className="space-y-4">
                                {tracking.history.map((item, index) => {
                                    const historyConfig = statusConfig[item.status];
                                    return (
                                        <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                                            <span className="text-lg">{historyConfig.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`font-medium ${historyConfig.color}`}>
                                                        {historyConfig.label}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(item.changed_at).toLocaleString('fr-FR')}
                                                    </span>
                                                </div>
                                                {item.comment && (
                                                    <p className="text-sm text-gray-600">{item.comment}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className={`text-center space-y-4 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/mes-commandes"
                            className="bg-adawi-gold text-white px-6 py-3 rounded-xl hover:bg-adawi-gold/90 transition-all duration-300 transform hover:scale-105"
                        >
                            Voir mes commandes
                        </Link>
                        <Link
                            to="/boutique"
                            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                        >
                            Continuer les achats
                        </Link>
                    </div>
                    
                    {/* Informations de contact */}
                    <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2">Besoin d'aide ?</h3>
                        <p className="text-sm text-blue-700 mb-3">
                            Notre équipe est là pour vous aider avec votre commande
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                            <a href="tel:+22890123456" className="text-blue-600 hover:text-blue-800">
                                📞 +228 90 12 34 56
                            </a>
                            <a href="mailto:support@adawi.com" className="text-blue-600 hover:text-blue-800">
                                ✉️ support@adawi.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Informations supplémentaires */}
                <div className={`mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
                    <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🚚</span>
                        </div>
                        <h4 className="font-medium text-black mb-2">Livraison gratuite</h4>
                        <p className="text-sm text-gray-600">Pour toute commande de plus de 50 000 FCFA</p>
                    </div>

                    <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🔄</span>
                        </div>
                        <h4 className="font-medium text-black mb-2">Retours faciles</h4>
                        <p className="text-sm text-gray-600">30 jours pour changer d'avis</p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}