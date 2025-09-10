import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { Package, Clock, Truck, CheckCircle, AlertCircle } from "lucide-react";
import ClientLayout from "~/components/client/ClientLayout";
import { readToken } from "~/utils/session.server";

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
  if (!reached) return <Clock className="w-6 h-6 text-gray-400" />;
  
  switch (status) {
    case 'en_cours':
      return <Package className="w-6 h-6 text-blue-500" />;
    case 'expediee':
      return <Truck className="w-6 h-6 text-orange-500" />;
    case 'livree':
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    default:
      return <Package className="w-6 h-6 text-gray-400" />;
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
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Suivi de Commande
            </h1>
            
            {/* Erreur du loader */}
            {loaderError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{loaderError}</span>
              </div>
            )}
            
            {/* Formulaire */}
            <Form method="post" className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Commande
                  </label>
                  <input
                    type="text"
                    id="orderId"
                    name="orderId"
                    placeholder="Saisissez votre ID de commande"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="sm:pt-7">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2 bg-adawi-gold text-white font-medium rounded-md hover:bg-adawi-brown disabled:bg-adawi-brown-light disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Recherche...' : 'Suivre'}
                  </button>
                </div>
              </div>
            </Form>

            {/* Erreur de l'action */}
            {actionData?.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{actionData.error}</span>
              </div>
            )}
          </div>

          {/* Résultats du tracking */}
          {actionData?.trackingData && (
            <div className="space-y-6">
              {/* En-tête */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Commande #{actionData.trackingData.order_id}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(actionData.trackingData.current_status)}`}>
                    {actionData.trackingData.current_status === 'en_cours' ? 'En cours' : 
                     actionData.trackingData.current_status === 'expediee' ? 'Expédiée' : 
                     actionData.trackingData.current_status === 'livree' ? 'Livrée' : actionData.trackingData.current_status}
                  </span>
                </div>
              </div>

              {/* Étapes de suivi */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Progression</h3>
                <div className="space-y-6">
                  {actionData.trackingData.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.status, step.reached)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${step.reached ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.label}
                          </h4>
                          <span className={`text-sm ${step.reached ? 'text-gray-600' : 'text-gray-400'}`}>
                            {formatDate(step.date)}
                          </span>
                        </div>
                        {index < actionData.trackingData.steps.length - 1 && (
                          <div className={`w-px h-6 ml-3 mt-2 ${step.reached ? 'bg-gray-300' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historique */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Historique</h3>
                <div className="space-y-4">
                  {actionData.trackingData.history.map((entry, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{entry.comment}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Status: {entry.status === 'en_cours' ? 'En cours' : 
                                   entry.status === 'expediee' ? 'Expédiée' : 
                                   entry.status === 'livree' ? 'Livrée' : entry.status}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(entry.changed_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}