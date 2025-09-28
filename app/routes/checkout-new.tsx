import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import { useSearchParams } from "react-router-dom";
import CompactHeader from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import TopBanner from "~/components/TopBanner";

export const meta: MetaFunction = () => [
  { title: "Checkout - Adawi" },
  { name: "description", content: "Finaliser votre commande" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
];

interface LoaderData {
  cartItems?: any[];
  cartTotal?: number;
}

export const loader: LoaderFunction = async ({ request }) => {
  // Optionnel : charger les données du panier si nécessaire
  return json<LoaderData>({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  const token = await readToken(request);
  if (!token) {
    return redirect("/login");
  }

  // Correction du parsing du token (même logique que dans le code availability)
  let authToken = "";
  if (typeof token === "string") {
    try {
      const parsed = JSON.parse(token);
      authToken = parsed?.access_token || token;
    } catch {
      authToken = token;
    }
  } else {
    authToken = token as string;
  }

  if (action === "checkout") {
    // Étape 1: Créer la commande avec les informations de livraison
    const street = formData.get("street") as string;
    const city = formData.get("city") as string;
    const postal_code = formData.get("postal_code") as string;
    const country = formData.get("country") as string;
    const phone = formData.get("phone") as string;
    const phone_number = formData.get("phone_number") as string;
    const network = formData.get("network") as string;

    // Server-side validation
    if (!street || !city || !postal_code || !country || !phone || !phone_number || !network) {
      return json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Validate phone number format (Togo format: 8 digits starting with specific prefixes)
    const phoneRegex = /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/;
    if (!phoneRegex.test(phone_number)) {
      return json(
        { error: "Format de numéro de téléphone pour le paiement invalide" },
        { status: 400 }
      );
    }

    try {
      console.log("Making checkout request to:", `${API_BASE}/orders/checkout`);
      console.log("Token:", authToken ? "Present" : "Missing");
      console.log("Payload:", {
        address: { street, city, postal_code, country, phone },
        phone_number,
        network
      });

      // Construire l'URL avec les paramètres de requête
      const url = new URL(`${API_BASE}/orders/checkout`);
      url.searchParams.append("phone_number", phone_number);
      url.searchParams.append("network", network);

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          street,
          city,
          postal_code,
          country,
          phone,
        }),
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      if (!res.ok) {
        // Gestion des erreurs (même logique que le premier fichier)
        const errorText = await res.text();
        console.error("API Error response:", errorText);

        let data;
        let errorMessage = "Une erreur est survenue lors du traitement de la commande";

        try {
          data = JSON.parse(errorText);
          if (res.status === 400) {
            errorMessage = data.detail || data.message || data.error || "Données invalides";
          } else if (res.status === 401) {
            errorMessage = "Session expirée, veuillez vous reconnecter";
            return redirect("/login");
          } else if (res.status === 422) {
            // Handle FastAPI validation errors
            if (data.detail && Array.isArray(data.detail)) {
              const fieldErrors = data.detail.map((err: any) =>
                `${err.loc ? err.loc.join('.') : 'Champ'}: ${err.msg}`
              ).join(', ');
              errorMessage = `Erreur de validation: ${fieldErrors}`;
            } else {
              errorMessage = "Données de validation incorrectes";
            }
          } else if (res.status >= 500) {
            errorMessage = "Erreur serveur, veuillez réessayer plus tard";
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          errorMessage = `Erreur ${res.status}: ${errorText}`;
        }

        return json({ error: errorMessage }, { status: res.status });
      }

      // Succès - Lire la réponse
      const responseText = await res.text();
      console.log("Response text:", responseText);

      // Essayer de parser en JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed JSON data:", data);

        // Si c'est un JSON avec payment_url, rediriger
        if (data.payment_url) {
          console.log("Redirecting to payment_url:", data.payment_url);
          console.log("Order created:", data.order);
          console.log("Payment identifier:", data.identifier);
          return redirect(data.payment_url);
        }

        // Si c'est un JSON mais sans payment_url
        if (data.order) {
          return json({
            success: true,
            order: data.order,
            message: "Commande créée avec succès",
            error: "URL de paiement manquante"
          });
        }

      } catch (parseError) {
        console.log("Not JSON, checking if it's a direct URL...");
      }

      // Vérifier si la réponse est directement une URL PayGateGlobal
      if (responseText.includes('paygateglobal.com')) {
        console.log("Direct PayGateGlobal URL detected:", responseText);
        return redirect(responseText.trim());
      }

      // Vérifier si c'est une redirection
      const location = res.headers.get('location');
      if (location) {
        console.log("Redirect location header:", location);
        return redirect(location);
      }

      // Si le texte ressemble à une URL
      const urlPattern = /^https?:\/\/.+/;
      if (urlPattern.test(responseText.trim())) {
        console.log("Assuming responseText is URL:", responseText.trim());
        return redirect(responseText.trim());
      }

      console.error("Unexpected response format:", responseText);
      return json(
        { error: `Format de réponse inattendu: ${responseText}` },
        { status: 500 }
      );

    } catch (error) {
      console.error("Fetch error:", error);

      // Différencier les erreurs de réseau
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return json(
          { error: "Erreur de connexion au serveur. Vérifiez votre connexion internet." },
          { status: 500 }
        );
      }

      return json(
        { error: `Erreur technique: ${error instanceof Error ? error.message : String(error)}` },
        { status: 500 }
      );
    }
  }

  return json({ error: "Action non reconnue" }, { status: 400 });
};

export default function CheckoutPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [network, setNetwork] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Nouvel état pour les informations de livraison
  const [deliveryInfo, setDeliveryInfo] = useState({
    street: "",
    city: "",
    postal_code: "",
    country: "Togo",
    phone: ""
  });

  const total = Number(searchParams.get("total")) || 0;
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) {
      setPhoneNumber(value);
    }
  };

  const handleDeliveryPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) {
      setDeliveryPhone(value);
      setDeliveryInfo(prev => ({
        ...prev,
        phone: value
      }));
    }
  };

  // Fonction pour gérer les changements dans les champs de livraison
  const handleDeliveryInfoChange = (field: string, value: string) => {
    setDeliveryInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate phone number format
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/;
    return phoneRegex.test(phone);
  };

  // Fonction pour vérifier si tous les champs de l'étape 1 sont valides
  const isStep1Valid = () => {
    return (
      deliveryInfo.street.trim() !== "" &&
      deliveryInfo.city.trim() !== "" &&
      deliveryInfo.postal_code.trim() !== "" &&
      deliveryInfo.country.trim() !== "" &&
      deliveryPhone.trim() !== "" &&
      isValidPhone(deliveryPhone)
    );
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-adawi-beige via-adawi-beige-dark to-white relative overflow-hidden">
      {/* Éléments décoratifs flottants - Responsives */}
      <div className="absolute top-4 sm:top-10 left-4 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 bg-adawi-gold/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-20 w-20 h-20 sm:w-40 sm:h-40 bg-adawi-brown/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-8 sm:left-1/4 w-12 h-12 sm:w-20 sm:h-20 bg-adawi-gold/5 rounded-full blur-xl animate-bounce" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/3 right-8 sm:right-1/3 w-8 h-8 sm:w-16 sm:h-16 bg-adawi-brown/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>

      <CompactHeader />
      <TopBanner />

      <div className="relative z-10">
        {/* Hero Section - Responsive */}
        <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-adawi-brown mb-4 sm:mb-6">
                Finaliser votre
                <span className="block text-adawi-gold relative">
                  commande
                  <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-16 sm:w-24 h-0.5 sm:h-1 bg-adawi-gold/50 rounded-full"></div>
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed px-4">
                Quelques étapes simples pour recevoir vos articles préférés à domicile
              </p>
            </div>

            {/* Progress Steps - Responsive */}
            <div className={`mt-8 sm:mt-12 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
              {/* Version mobile - Stack vertically on very small screens */}
              <div className="flex flex-col sm:hidden space-y-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center justify-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                      step <= currentStep
                        ? 'bg-adawi-gold text-black shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    <span className={`ml-3 text-sm font-medium transition-colors duration-300 ${
                      step <= currentStep ? 'text-adawi-brown' : 'text-gray-400'
                    }`}>
                      {step === 1 ? 'Livraison' : step === 2 ? 'Paiement' : 'Confirmation'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Version desktop - Horizontal layout */}
              <div className="hidden sm:flex justify-center items-center space-x-2 md:space-x-4 lg:space-x-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                      step <= currentStep
                        ? 'bg-adawi-gold text-black shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    <span className={`ml-2 md:ml-3 text-xs md:text-sm font-medium transition-colors duration-300 ${
                      step <= currentStep ? 'text-adawi-brown' : 'text-gray-400'
                    }`}>
                      {step === 1 ? 'Livraison' : step === 2 ? 'Paiement' : 'Confirmation'}
                    </span>
                    {step < 3 && (
                      <div className={`w-4 md:w-8 h-0.5 mx-2 md:mx-4 transition-colors duration-300 ${
                        step < currentStep ? 'bg-adawi-gold' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Order Summary Card - Responsive */}
        {total > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 mb-4 sm:mb-8">
            <div className={`max-w-2xl mx-auto transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '500ms' }}>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-adawi-gold/20 p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-adawi-brown mb-2">Récapitulatif de commande</h3>
                    <p className="text-sm sm:text-base text-gray-600">Vérifiez vos articles avant paiement</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold text-adawi-gold">
                      {total.toLocaleString()} F CFA
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">Total à payer</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Form Section - Responsive */}
        <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-16">
          <div className="max-w-4xl mx-auto">
            <div className={`bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-adawi-gold/10 overflow-hidden transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '700ms' }}>

              {/* Error/Success Messages - Responsive */}
              {actionData?.error && (
                <div className="m-4 sm:m-6 mb-0 bg-red-50 border-b border-red-200 p-4 sm:p-6 animate-slideDown">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-red-800">Erreur de paiement</h3>
                      <p className="text-sm text-red-700 mt-1 break-words">{actionData.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {actionData?.success && (
                <div className="m-4 sm:m-6 mb-0 bg-green-50 border-b border-green-200 p-4 sm:p-6 animate-slideDown">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-green-800">Commande créée avec succès !</p>
                      {actionData.order && (
                        <div className="mt-2 text-sm text-green-700 space-y-1">
                          <p className="break-words">ID: {actionData.order.id}</p>
                          <p>Total: {actionData.order.total} F CFA</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Form method="post" className="p-4 sm:p-6 lg:p-8">
                <input type="hidden" name="_action" value="checkout" />

                {/* Step 1: Delivery Information - Responsive */}
                <div className={`transition-all duration-500 ${currentStep === 1 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-adawi-brown mb-2 flex items-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-adawi-gold rounded-full flex items-center justify-center text-black font-bold text-xs sm:text-sm mr-2 sm:mr-3 flex-shrink-0">1</div>
                      <span className="min-w-0">Informations de livraison</span>
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 ml-8 sm:ml-11">Où souhaitez-vous recevoir votre commande ?</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="lg:col-span-2 group">
                      <label className="block text-sm font-semibold text-adawi-brown mb-2 group-focus-within:text-adawi-gold transition-colors duration-300">
                        Rue / Adresse complète
                      </label>
                      <div className="relative">
                        <input
                          name="street"
                          type="text"
                          value={deliveryInfo.street}
                          onChange={(e) => handleDeliveryInfoChange('street', e.target.value)}
                          placeholder="123 Rue de la République, Quartier Administratif"
                          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-adawi-gold/20 focus:border-adawi-gold transition-all duration-300 hover:border-adawi-brown/50 text-sm sm:text-base"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-adawi-gold transition-colors duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-adawi-brown mb-2 group-focus-within:text-adawi-gold transition-colors duration-300">
                        Ville
                      </label>
                      <input
                        name="city"
                        type="text"
                        value={deliveryInfo.city}
                        onChange={(e) => handleDeliveryInfoChange('city', e.target.value)}
                        placeholder="Lomé"
                        className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-adawi-gold/20 focus:border-adawi-gold transition-all duration-300 hover:border-adawi-brown/50 text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-adawi-brown mb-2 group-focus-within:text-adawi-gold transition-colors duration-300">
                        Code Postal
                      </label>
                      <input
                        name="postal_code"
                        type="text"
                        value={deliveryInfo.postal_code}
                        onChange={(e) => handleDeliveryInfoChange('postal_code', e.target.value)}
                        placeholder="BP 1234"
                        className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-adawi-gold/20 focus:border-adawi-gold transition-all duration-300 hover:border-adawi-brown/50 text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-adawi-brown mb-2 group-focus-within:text-adawi-gold transition-colors duration-300">
                        Pays
                      </label>
                      <input
                        name="country"
                        type="text"
                        value={deliveryInfo.country}
                        onChange={(e) => handleDeliveryInfoChange('country', e.target.value)}
                        className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-adawi-gold/20 focus:border-adawi-gold transition-all duration-300 hover:border-adawi-brown/50 text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-adawi-brown mb-2 group-focus-within:text-adawi-gold transition-colors duration-300">
                        Téléphone de contact
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-medium text-sm sm:text-base">+228</span>
                        </div>
                        <input
                          type="text"
                          name="phone"
                          value={deliveryPhone}
                          onChange={handleDeliveryPhoneChange}
                          placeholder="70123456"
                          required
                          className={`w-full pl-14 sm:pl-16 pr-10 sm:pr-12 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-adawi-gold/20 focus:border-adawi-gold transition-all duration-300 hover:border-adawi-brown/50 text-sm sm:text-base ${
                            deliveryPhone && !isValidPhone(deliveryPhone)
                              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                              : 'border-gray-200'
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-adawi-gold transition-colors duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </div>
                      {deliveryPhone && !isValidPhone(deliveryPhone) && (
                        <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-start animate-fadeIn">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Format invalide. Ex: 70123456, 91234567</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStep1Valid()}
                      className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group text-sm sm:text-base ${
                        isStep1Valid()
                          ? 'bg-adawi-gold hover:bg-adawi-gold/90 text-black transform hover:scale-105 hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Continuer vers le paiement
                      <svg className={`w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform duration-300 ${
                        isStep1Valid() ? 'transform group-hover:translate-x-1' : ''
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>

                  {/* Message d'aide si les champs ne sont pas valides */}
                  {!isStep1Valid() && (
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-500 flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Veuillez remplir tous les champs obligatoires
                      </p>
                    </div>
                  )}
                </div>

                {/* Step 2: Payment Information - Responsive */}
                <div className={`transition-all duration-500 ${currentStep === 2 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-adawi-brown mb-2 flex items-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-adawi-gold rounded-full flex items-center justify-center text-black font-bold text-xs sm:text-sm mr-2 sm:mr-3 flex-shrink-0">2</div>
                      <span className="min-w-0">Informations de paiement</span>
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 ml-8 sm:ml-11">Sécurisez votre paiement mobile</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-adawi-brown mb-2 group-focus-within:text-adawi-gold transition-colors duration-300">
                        Numéro de téléphone pour le paiement
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-medium text-sm sm:text-base">+228</span>
                        </div>
                        <input
                          type="text"
                          name="phone_number"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="70123456"
                          required
                          className={`w-full pl-14 sm:pl-16 pr-10 sm:pr-12 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-adawi-gold/20 focus:border-adawi-gold transition-all duration-300 hover:border-adawi-brown/50 text-sm sm:text-base ${
                            phoneNumber && !isValidPhone(phoneNumber)
                              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
                              : 'border-gray-200'
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-adawi-gold transition-colors duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      {phoneNumber && !isValidPhone(phoneNumber) && (
                        <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-start animate-fadeIn">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Format invalide. Ex: 70123456, 91234567</span>
                        </p>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-adawi-brown mb-2 group-focus-within:text-adawi-gold transition-colors duration-300">
                        Opérateur de paiement mobile
                      </label>
                      <div className="relative">
                        <select
                          name="network"
                          value={network}
                          onChange={(e) => setNetwork(e.target.value)}
                          className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-adawi-gold/20 focus:border-adawi-gold transition-all duration-300 hover:border-adawi-brown/50 appearance-none text-sm sm:text-base"
                          required
                        >
                          <option value="">-- Sélectionnez votre opérateur --</option>
                          <option value="TMONEY">🟡 T-money (Togocom)</option>
                          <option value="FLOOZ">🔵 Flooz (Moov)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions - Responsive */}
                  <div className="mt-6 sm:mt-8 bg-gradient-to-r from-adawi-beige to-adawi-beige-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-adawi-gold/20">
                    <h3 className="text-base sm:text-lg font-semibold text-adawi-brown mb-3 sm:mb-4 flex items-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-adawi-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Instructions de paiement</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-adawi-gold rounded-full flex items-center justify-center text-black font-bold text-xs flex-shrink-0 mt-0.5">1</div>
                        <p className="leading-relaxed">Assurez-vous que votre compte mobile money a suffisamment de solde</p>
                      </div>
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-adawi-gold rounded-full flex items-center justify-center text-black font-bold text-xs flex-shrink-0 mt-0.5">2</div>
                        <p className="leading-relaxed">Vous recevrez une notification de paiement sur votre téléphone</p>
                      </div>
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-adawi-gold rounded-full flex items-center justify-center text-black font-bold text-xs flex-shrink-0 mt-0.5">3</div>
                        <p className="leading-relaxed">Composez votre code PIN pour confirmer le paiement</p>
                      </div>
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-adawi-gold rounded-full flex items-center justify-center text-black font-bold text-xs flex-shrink-0 mt-0.5">4</div>
                        <p className="leading-relaxed">Une confirmation vous sera envoyée une fois le paiement validé</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center group text-sm sm:text-base order-2 sm:order-1"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !isValidPhone(phoneNumber) ||
                        !isValidPhone(deliveryPhone) ||
                        !network
                      }
                      className="w-full sm:w-auto bg-adawi-brown hover:bg-adawi-brown/90 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group text-sm sm:text-base order-1 sm:order-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="hidden sm:inline">Traitement en cours...</span>
                          <span className="sm:hidden">Traitement...</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Finaliser et payer la commande</span>
                          <span className="sm:hidden">Finaliser le paiement</span>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </section>
      </div>
      <Footer />

      {/* Custom CSS for animations and responsive improvements */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Enhanced focus states */
        .group:focus-within input,
        .group:focus-within select {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(218, 165, 32, 0.1);
        }

        /* Smooth transitions for all interactive elements */
        button, input, select {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Custom scrollbar for better UX */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(218, 165, 32, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(218, 165, 32, 0.5);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(218, 165, 32, 0.7);
        }

        /* Mobile-first responsive improvements */
        @media (max-width: 640px) {
          .animate-pulse {
            animation-duration: 3s;
          }
          
          .animate-bounce {
            animation-duration: 2s;
          }

          /* Ensure inputs don't zoom on iOS */
          input[type="text"],
          input[type="tel"],
          select,
          textarea {
            font-size: 16px;
          }
        }

        /* Touch targets for mobile */
        @media (max-width: 768px) {
          button,
          input,
          select {
            min-height: 44px;
          }
        }

        /* Prevent horizontal scroll on small screens */
        @media (max-width: 640px) {
          body {
            overflow-x: hidden;
          }
        }

        /* Improved spacing for very small screens */
        @media (max-width: 375px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .border-gray-200 {
            border-color: #000;
          }
          
          .text-gray-600 {
            color: #000;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .animate-bounce,
          .animate-spin {
            animation: none;
          }
          
          .transition-all,
          .transition-colors,
          .transition-transform {
            transition: none;
          }
        }

        /* Focus visible for keyboard navigation */
        button:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid rgba(218, 165, 32, 0.8);
          outline-offset: 2px;
        }

        /* Better loading state for slow connections */
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0f0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}