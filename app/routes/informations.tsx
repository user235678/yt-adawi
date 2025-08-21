import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { readSessionData } from "~/utils/session.server";

// Vérifier que l'utilisateur est connecté et a un panier non vide
export const loader: LoaderFunction = async ({ request }) => {
    const sessionData = await readSessionData(request);
    if (!sessionData || !sessionData.session_id) {
        return redirect('/login');
    }

    // Vérifier le panier
    const apiUrl = `${process.env.API_BASE_URL || 'https://showroom-backend-2x3g.onrender.com'}/cart/?session-id=${sessionData.session_id}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${sessionData.access_token}`,
            },
        });

        if (!response.ok) {
            return redirect('/checkout');
        }

        const cartData = await response.json();
        if (!cartData.items || cartData.items.length === 0) {
            return redirect('/checkout');
        }

        return json({ ok: true });
    } catch (error) {
        return redirect('/checkout');
    }
};

interface Address {
    street: string;
    city: string;
    postal_code: string;
    country: string;
    phone: string;
}

interface FormData extends Address {
    payment_method: string;
}

interface ApiResponse {
    items: any[];
    address: Address;
    total: number;
    status: string;
    payment_status: string;
    status_history: any[];
    payment_method: string;
    delivery_method: string;
    delivery_status: string;
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export default function Informations() {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormData>({
        street: "",
        city: "",
        postal_code: "",
        country: "",
        phone: "",
        payment_method: "tmoney", // Valeur par défaut
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiSuccess, setApiSuccess] = useState<ApiResponse | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePaymentMethodChange = (method: string) => {
        setForm({ ...form, payment_method: method });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setApiError(null);
        setApiSuccess(null);

        try {
            const response = await fetch("/api/orders/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(
                    result?.detail?.[0]?.msg ||
                    result?.error ||
                    `Erreur ${response.status}: ${response.statusText}`
                );
            }

            const data: ApiResponse = result.data;
            setApiSuccess(data);

        } catch (error) {
            setApiError(
                error instanceof Error ? error.message : "Erreur lors de la commande"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const paymentMethods = [
        {
            id: "tmoney",
            name: "T-Money",
            description: "Paiement mobile via T-Money (Togocom)",
            icon: (
                <img src="/tmoney.png" alt="T-Money" className="w-7 h-7" />
            ),
            details: "Paiement sécurisé via PayDunya"
        },
        {
            id: "flooz",
            name: "Flooz",
            description: "Paiement mobile via Flooz (Moov Africa)",
            icon: (
                <img src="/moov.png" alt="Flooz" className="w-7 h-7" />
            ),
            details: "Paiement sécurisé via PayDunya"
        },
        {
            id: "card",
            name: "Carte bancaire",
            description: "Visa, Mastercard, etc.",
            icon: (
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="3" strokeWidth={2} />
                    <path strokeWidth={2} d="M2 10h20" />
                </svg>
            ),
            details: "Paiement en ligne sécurisé"
        },
        {
            id: "cash",
            name: "Espèces à la livraison",
            description: "Payez lors de la réception de votre commande",
            icon: (
                <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="10" rx="2" strokeWidth={2} />
                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                </svg>
            ),
            details: "Remettez le montant exact au livreur"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-adawi-beige via-white to-adawi-beige-dark">
            <TopBanner />
            <Header />

            <main className="max-w-lg mx-auto px-4 py-10">
                {/* Fil d'Ariane */}
                <div className="flex items-center justify-center space-x-4 mb-8 text-sm">
                    <span className="text-gray-500">Panier</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-adawi-gold font-medium">Informations</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-500">Paiement</span>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-center mb-8 text-adawi-brown">Informations de livraison</h1>

                    {apiSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <div className="flex items-center mb-4">
                                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <h2 className="text-lg font-semibold text-green-800">Commande créée avec succès !</h2>
                            </div>
                            <div className="space-y-2 text-sm text-green-700">
                                <p><strong>Numéro de commande :</strong> {apiSuccess.id}</p>
                                <p><strong>Total :</strong> {apiSuccess.total.toLocaleString()} FCFA</p>
                                <p><strong>Statut :</strong> {apiSuccess.status}</p>
                                <p><strong>Statut paiement :</strong> {apiSuccess.payment_status}</p>
                                <p><strong>Mode de paiement :</strong> {apiSuccess.payment_method}</p>
                                <p><strong>Articles :</strong> {apiSuccess.items.length} produit(s)</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Informations de livraison */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Adresse <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={form.street}
                                    onChange={handleChange}
                                    required
                                    disabled={!!apiSuccess}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent ${
                                        apiSuccess ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                    placeholder="Ex: 12 rue de la Paix"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ville <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        required
                                        disabled={!!apiSuccess}
                                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent ${
                                            apiSuccess ? 'bg-gray-100 cursor-not-allowed' : ''
                                        }`}
                                        placeholder="Ex: Lomé"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Code postal <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="postal_code"
                                        value={form.postal_code}
                                        onChange={handleChange}
                                        required
                                        disabled={!!apiSuccess}
                                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent ${
                                            apiSuccess ? 'bg-gray-100 cursor-not-allowed' : ''
                                        }`}
                                        placeholder="Ex: 10000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pays <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={form.country}
                                    onChange={handleChange}
                                    required
                                    disabled={!!apiSuccess}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent ${
                                        apiSuccess ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                    placeholder="Ex: Togo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Téléphone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                    disabled={!!apiSuccess}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent ${
                                        apiSuccess ? 'bg-gray-100 cursor-not-allowed' : ''
                                    }`}
                                    placeholder="Ex: +228 90000000"
                                />
                            </div>
                        </div>

                        {/* Section Mode de paiement */}
                        <div className="border-t border-gray-200 pt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mode de paiement</h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Choisissez votre mode de paiement préféré :
                            </p>
                            <div className="grid grid-cols-1 gap-4">
                                {paymentMethods.map((method) => (
                                    <label
                                        key={method.id}
                                        htmlFor={method.id}
                                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                            form.payment_method === method.id
                                                ? 'border-adawi-gold bg-adawi-gold/10'
                                                : 'border-gray-200 hover:border-adawi-gold'
                                        } ${apiSuccess ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            id={method.id}
                                            name="payment_method"
                                            value={method.id}
                                            checked={form.payment_method === method.id}
                                            onChange={() => handlePaymentMethodChange(method.id)}
                                            disabled={!!apiSuccess}
                                            className="sr-only"
                                        />
                                        <div className="mr-4">{method.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <span className="font-semibold text-gray-900">{method.name}</span>
                                                {form.payment_method === method.id && (
                                                    <svg className="w-5 h-5 text-adawi-gold ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{method.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">{method.details}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {apiError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                {apiError}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/checkout')}
                                className="text-gray-600 hover:text-gray-800 font-medium flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Retour au panier
                            </button>

                            {!apiSuccess && (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-8 py-3 rounded-full font-medium text-base transition-all duration-200 ${
                                        isSubmitting
                                            ? "bg-gray-400 text-white cursor-not-allowed"
                                            : "bg-black text-white hover:bg-gray-800"
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Traitement...
                                        </span>
                                    ) : (
                                        "COMMANDE"
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
