import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, useFetcher, useActionData } from "@remix-run/react";
import { requireUser, API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import ClientLayout from "~/components/client/ClientLayout";
import { useState } from "react";

type Appointment = {
  _id: string;
  user_id: string;
  vendor_id: string;
  service_type: string;
  title: string;
  description: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  location: string;
  client_notes: string;
  vendor_notes: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  reminder_sent: boolean;
  reminder_sent_at: string;
  status_history: any[];
};

type LoaderData = {
  appointments: Appointment[];
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type ActionData = {
  success?: boolean;
  error?: string;
  message?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (!user) {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "";
  const start_date = url.searchParams.get("start_date") || "";
  const end_date = url.searchParams.get("end_date") || "";
  const limit = url.searchParams.get("limit") || "50";
  const skip = url.searchParams.get("skip") || "0";

  const token = await readToken(request);

  const queryParams = new URLSearchParams();
  if (status) queryParams.append("status", status);
  if (start_date) queryParams.append("start_date", start_date);
  if (end_date) queryParams.append("end_date", end_date);
  queryParams.append("limit", limit);
  queryParams.append("skip", skip);

  const res = await fetch(`${API_BASE}/appointments?${queryParams.toString()}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    throw new Response("Failed to load appointments", { status: res.status });
  }

  const appointments: Appointment[] = await res.json();

  return json<LoaderData>({
    appointments,
    user: {
      id: user.id || "",
      name: user.full_name || "",
      email: user.email || "",
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const token = await readToken(request);

  if (intent === "cancelAppointment") {
    const appointmentId = formData.get("appointmentId") as string;
    const cancelReason = formData.get("cancelReason") as string;

    try {
      const url = new URL(`${API_BASE}/appointments/${appointmentId}/cancel`);
      if (cancelReason) {
        url.searchParams.append("cancel_reason", cancelReason);
      }

      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return json<ActionData>({
          error: errorData.detail || `Erreur ${response.status}: Impossible d'annuler le rendez-vous`
        }, { status: response.status });
      }

      // Récupérer la réponse de l'API pour afficher le message
      const responseData = await response.json().catch(() => ({}));
      
      return json<ActionData>({
        success: true,
        message: responseData.message || responseData.detail || "Rendez-vous annulé avec succès"
      });

    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      return json<ActionData>({
        error: "Erreur de connexion. Veuillez réessayer."
      }, { status: 500 });
    }
  }

  return json<ActionData>({
    error: "Action non reconnue"
  }, { status: 400 });
};

export default function ClientAppointmentsList() {
  const { appointments, user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const fetcher = useFetcher();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en cours":
        return "bg-yellow-100 text-yellow-800";
      case "confirmé":
        return "bg-green-100 text-green-800";
      case "annulé":
        return "bg-red-100 text-red-800";
      case "terminé":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = () => {
    if (!selectedAppointment) return;

    const formData = new FormData();
    formData.append("intent", "cancelAppointment");
    formData.append("appointmentId", selectedAppointment._id);
    formData.append("cancelReason", cancelReason);

    fetcher.submit(formData, { method: "post" });
    setShowCancelModal(false);
    setSelectedAppointment(null);
    setCancelReason("");
  };

  return (
    <ClientLayout userName={user?.name}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Messages de notification */}
        {(actionData?.success || fetcher.data?.success) && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">{actionData?.message || fetcher.data?.message}</p>
            </div>
          </div>
        )}

        {(actionData?.error || fetcher.data?.error) && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">{actionData?.error || fetcher.data?.error}</p>
            </div>
          </div>
        )}

        {/* Header Section - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
          <Link
            to="/client/appointments"
            className="w-full sm:w-auto text-center bg-adawi-gold text-white px-4 py-2 rounded-lg hover:bg-adawi-gold/90 transition-colors font-medium"
          >
            <span className="sm:hidden">Nouveau rendez-vous</span>
            <span className="hidden sm:inline">Nouveau rendez-vous</span>
          </Link>
        </div>

        {appointments.length === 0 ? (
          /* Empty State - Responsive */
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Aucun rendez-vous</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
              Vous n'avez pas encore de rendez-vous programmés.
            </p>
            <Link
              to="/client/appointments"
              className="inline-block w-full sm:w-auto bg-adawi-gold text-white px-6 py-3 rounded-lg hover:bg-adawi-gold/90 transition-colors font-medium"
            >
              Créer votre premier rendez-vous
            </Link>
          </div>
        ) : (
          /* Appointments Grid - Fully Responsive */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {appointments.map((appt) => (
              <div key={appt._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Card Header */}
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 flex-1 min-w-0">
                      {appt.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0 ${getStatusColor(appt.status)}`}>
                      {appt.status}
                    </span>
                  </div>

                  {/* Appointment Details */}
                  <div className="space-y-3 text-sm text-gray-600">
                    {/* Date and Time */}
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="break-words">
                        {new Date(appt.appointment_date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{appt.duration_minutes} minutes</span>
                    </div>

                    {/* Service Type */}
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="break-words">{appt.service_type}</span>
                    </div>

                    {/* Location */}
                    {appt.location && (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="break-words">{appt.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {appt.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-700 line-clamp-3">{appt.description}</p>
                    </div>
                  )}

                  {/* Client Notes */}
                  {appt.client_notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs sm:text-sm text-gray-600">
                        <strong className="font-medium">Vos notes:</strong>
                        <p className="mt-1 line-clamp-2">{appt.client_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Vendor Notes */}
                  {appt.vendor_notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs sm:text-sm text-gray-600">
                        <strong className="font-medium">Notes du prestataire:</strong>
                        <p className="mt-1 line-clamp-2">{appt.vendor_notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="flex gap-2 text-xs">  
                    {(appt.status === 'confirmé' || appt.status === 'en cours') && (
                      <button 
                        onClick={() => handleCancelClick(appt)}
                        disabled={fetcher.state === "submitting"}
                        className="flex-1 px-3 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {fetcher.state === "submitting" && fetcher.formData?.get("appointmentId") === appt._id 
                          ? "Annulation..." 
                          : "Annuler"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'annulation */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Annuler le rendez-vous
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">Attention</p>
                      <p className="text-sm text-red-700 mt-1">
                        Cette action annulera définitivement votre rendez-vous.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Détails du rendez-vous</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Titre:</strong> {selectedAppointment.title}</p>
                    <p><strong>Date:</strong> {new Date(selectedAppointment.appointment_date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    <p><strong>Service:</strong> {selectedAppointment.service_type}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison de l'annulation (optionnel)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
                    placeholder="Expliquez pourquoi vous annulez ce rendez-vous..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{cancelReason.length}/500 caractères</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Garder le rendez-vous
                </button>
                <button
                  onClick={handleCancelSubmit}
                  disabled={fetcher.state === "submitting"}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetcher.state === "submitting" ? "Annulation..." : "Confirmer l'annulation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}