import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { Package, Clock, Truck, CheckCircle, AlertCircle } from "lucide-react";
import ClientLayout from "~/components/client/ClientLayout";
import { readToken } from "~/utils/session.server";
import { Link } from "@remix-run/react";

interface TrackingStep {
  status: string;
  label: string;
  reached: boolean;
  date: string | null;
}

interface TrackingHistory {
  status: string;
  changed_at: string;
  comment: string;
}

interface TrackingResponse {
  order_id: string;
  current_status: string;
  steps: TrackingStep[];
  history: TrackingHistory[];
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface LoaderData {
  user: User | null;
  token: string;
  error?: string;
}

interface ActionData {
  trackingData?: TrackingResponse;
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const tokenData = await readToken(request);
    if (!tokenData) throw redirect("/login");

    const token =
      typeof tokenData === "string"
        ? (() => {
          try {
            return JSON.parse(tokenData)?.access_token || tokenData;
          } catch {
            return tokenData;
          }
        })()
        : tokenData;

    if (!token) throw redirect("/login");

    const userRes = await fetch("https://showroom-backend-2x3g.onrender.com/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = userRes.ok ? await userRes.json() : null;

    return json<LoaderData>({ user, token });
  } catch (err: any) {
    console.error("Erreur loader tracking:", err);
    return json<LoaderData>({
      user: null,
      token: "",
      error: err.message || "Erreur serveur",
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const orderId = formData.get("orderId") as string;

  if (!orderId || !orderId.trim()) {
    return json<ActionData>({
      error: "Veuillez saisir un ID de commande"
    }, { status: 400 });
  }

  try {
    // Récupérer le token pour l'action
    const tokenData = await readToken(request);
    const token =
      typeof tokenData === "string"
        ? (() => {
          try {
            return JSON.parse(tokenData)?.access_token || tokenData;
          } catch {
            return tokenData;
          }
        })()
        : tokenData;

    if (!token) {
      return json<ActionData>({
        error: "Non authentifié"
      }, { status: 401 });
    }

    const response = await fetch(
      `https://showroom-backend-2x3g.onrender.com/orders/${orderId.trim()}/tracking`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      return json<ActionData>({
        error: `Erreur ${response.status}: ${response.statusText}`
      }, { status: response.status });
    }

    const trackingData: TrackingResponse = await response.json();
    return json<ActionData>({ trackingData });

  } catch (error) {
    return json<ActionData>({
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    }, { status: 500 });
  }
}

function getStatusIcon(status: string, reached: boolean) {
  if (!reached) return <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;

  switch (status) {
    case 'en_cours':
      return <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />;
    case 'expediee':
      return <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />;
    case 'livree':
      return <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />;
    default:
      return <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'En attente';
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case 'en_cours':
      return 'bg-blue-100 text-blue-800';
    case 'en_preparation':
      return 'bg-blue-100 text-blue-800';
    case 'expediee':
      return 'bg-orange-100 text-orange-800';
    case 'livree':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function TrackingPage() {
  const { user, error: loaderError } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <ClientLayout userName={user?.full_name}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="max-w-4xl mx-auto">

            {/* Header Card - Responsive */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                  Suivi de Commande
                </h1>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                  Suivez l'état de votre commande en temps réel
                </p>
              </div>

              {/* Erreur du loader - Responsive */}
              {loaderError && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-red-700 text-sm sm:text-base break-words">{loaderError}</span>
                </div>
              )}

              {/* Formulaire - Responsive */}
              <Form method="post" className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1">
                    <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                      ID de Commande
                    </label>
                    <input
                      type="text"
                      id="orderId"
                      name="orderId"
                      placeholder="Ex: CMD-123456"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-adawi-gold focus:border-adawi-gold transition-all duration-200 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="sm:pt-7">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-adawi-gold text-white font-medium rounded-lg sm:rounded-xl hover:bg-adawi-brown disabled:bg-adawi-brown-light disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="hidden sm:inline">Recherche...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        'Suivre ma commande'
                      )}
                    </button>
                  </div>
                </div>
              </Form>

              {/* Erreur de l'action - Responsive */}
              {actionData?.error && (
                <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-red-700 text-sm sm:text-base break-words">{actionData.error}</span>
                </div>
              )}
            </div>

            {/* Résultats du tracking - Responsive */}
            {actionData?.trackingData && (
              <div className="space-y-4 sm:space-y-6">

                {/* En-tête de commande - Responsive */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                        Commande #{actionData.trackingData.order_id}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Statut mis à jour en temps réel
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(actionData.trackingData.current_status)}`}>
                        <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></div>
                        {actionData.trackingData.current_status === 'en_cours' ? 'En cours' :
                          actionData.trackingData.current_status === 'expediee' ? 'Expédiée' :
                            actionData.trackingData.current_status === 'livree' ? 'Livrée' : actionData.trackingData.current_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Étapes de suivi - Responsive */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-adawi-gold" />
                    Progression de la commande
                  </h3>

                  <div className="space-y-4 sm:space-y-6">
                    {actionData.trackingData.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(step.status, step.reached)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                            <h4 className={`font-medium text-sm sm:text-base ${step.reached ? 'text-gray-900' : 'text-gray-500'}`}>
                              {step.label}
                            </h4>
                            <span className={`text-xs sm:text-sm flex-shrink-0 ${step.reached ? 'text-gray-600' : 'text-gray-400'}`}>
                              {formatDate(step.date)}
                            </span>
                          </div>
                          {index < actionData.trackingData.steps.length - 1 && (
                            <div className={`w-px h-4 sm:h-6 ml-2.5 sm:ml-3 mt-2 ${step.reached ? 'bg-gray-300' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historique - Responsive */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-adawi-gold" />
                    Historique détaillé
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    {actionData.trackingData.history.length > 0 ? (
                      actionData.trackingData.history.map((entry, index) => (
                        <div key={index} className="border-l-4 border-adawi-gold/30 pl-3 sm:pl-4 py-2 sm:py-3 bg-gray-50/50 rounded-r-lg">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                {entry.comment}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                Statut: {entry.status === 'en_cours' ? 'En cours' :
                                  entry.status === 'expediee' ? 'Expédiée' :
                                    entry.status === 'livree' ? 'Livrée' : entry.status}
                              </p>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                              {formatDate(entry.changed_at)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <Clock className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">Aucun historique disponible pour le moment</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations supplémentaires - Responsive */}
                <div className="bg-gradient-to-r from-adawi-beige to-adawi-beige-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-adawi-gold/20">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-adawi-gold rounded-full flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-adawi-brown text-sm sm:text-base mb-2">
                        Besoin d'aide ?
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                        Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        
                        <Link
                          to="/support"
                          className="px-3 sm:px-4 py-2 bg-adawi-gold text-white text-center rounded-lg text-xs sm:text-sm font-medium hover:bg-adawi-brown transition-colors"
                        >
                          Contacter le support
                        </Link>
                        <Link
                          to="/livraison"
                          className="px-3 sm:px-4 py-2 bg-adawi-gold text-white text-center rounded-lg text-xs sm:text-sm font-medium hover:bg-adawi-brown transition-colors"
                        >
                          FAQ Livraison
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}