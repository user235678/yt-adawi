import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUser, API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import ClientLayout from "~/components/client/ClientLayout";

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

export default function ClientAppointmentsList() {
  const { appointments, user } = useLoaderData<LoaderData>();

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

  return (
    <ClientLayout userName={user?.name}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mes Rendez-vous</h1>
          <Link
            to="/client/appointments"
            className="bg-adawi-gold text-white px-4 py-2 rounded-lg hover:bg-adawi-gold/90 transition-colors"
          >
            Nouveau rendez-vous
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous</h3>
            <p className="text-gray-500 mb-4">Vous n'avez pas encore de rendez-vous programmés.</p>
            <Link
              to="/client/appointments"
              className="bg-adawi-gold text-white px-6 py-3 rounded-lg hover:bg-adawi-gold/90 transition-colors"
            >
              Créer votre premier rendez-vous
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appt) => (
              <div key={appt._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{appt.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appt.status)}`}>
                    {appt.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(appt.appointment_date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {appt.duration_minutes} minutes
                  </div>

                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {appt.service_type}
                  </div>

                  {appt.location && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {appt.location}
                    </div>
                  )}
                </div>

                {appt.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700">{appt.description}</p>
                  </div>
                )}

                {appt.client_notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Vos notes:</strong> {appt.client_notes}
                    </p>
                  </div>
                )}

                {appt.vendor_notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Notes du prestataire:</strong> {appt.vendor_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
