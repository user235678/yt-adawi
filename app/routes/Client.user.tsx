// routes/profile.tsx
import { LoaderFunction, json, redirect, ActionFunction } from "@remix-run/node";
import { useLoaderData, useNavigation, Form, useActionData } from "@remix-run/react";
import { readToken } from "~/utils/session.server";
import ClientLayout from "~/components/client/ClientLayout";
import { useState } from "react";

// Fonction utilitaire pour faire des requêtes avec timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const token = await readToken(request);

  if (!token) {
    console.log("Pas de token trouvé, redirection vers login");
    return redirect("/login");
  }

  try {
    console.log("Récupération du profil utilisateur...");

    const res = await fetchWithTimeout(
      "https://showroom-backend-2x3g.onrender.com/profile/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      },
      10000
    );

    if (!res.ok) {
      console.log(`Erreur API: ${res.status} ${res.statusText}`);

      if (res.status === 401 || res.status === 403) {
        console.log("Token expiré ou invalide, redirection vers login");
        return redirect("/login");
      }

      let errorMessage = "Erreur lors de la récupération des données utilisateur";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (e) {
        // Ignore les erreurs de parsing JSON
      }

      return json({ error: errorMessage, user: null }, { status: res.status });
    }

    const user = await res.json();
    console.log("Données utilisateur récupérées avec succès");

    return json({ user, error: null });

  } catch (error: any) {
    console.error("Erreur lors de la vérification du token:", error);

    if (error.name === 'AbortError') {
      console.log("Timeout de la requête, redirection vers login");
      return redirect("/login?error=timeout");
    }

    if (error.message?.includes('fetch')) {
      console.log("Erreur réseau, redirection vers login");
      return redirect("/login?error=network");
    }

    console.log("Erreur inconnue, redirection vers login");
    return redirect("/login?error=unknown");
  }
};

export const action: ActionFunction = async ({ request }) => {
  const token = await readToken(request);

  if (!token) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateProfile") {
    // Créer le FormData pour l'API avec les objets JSON
    const formDataToSend = new FormData();

    // Construire l'objet measurements
    const measurements: any = {};
    const measurementFields = [
      'height', 'weight', 'shoulder_width', 'chest', 'waist_length',
      'ventral_circumference', 'hips', 'corsage_length', 'belt',
      'skirt_length', 'dress_length', 'sleeve_length', 'sleeve_circumference',
      'pants_length', 'short_dress_length', 'thigh_circumference',
      'knee_length', 'knee_circumference', 'bottom', 'inseam'
    ];
    
    measurementFields.forEach(field => {
      const value = formData.get(field);
      measurements[field] = value ? parseFloat(value as string) : 0;
    });
    measurements.other_measurements = formData.get('other_measurements') || '';

    // Construire l'objet address
    const address = {
      street: formData.get('address_street') || '',
      city: formData.get('address_city') || '',
      postal_code: formData.get('address_postal_code') || '',
      country: formData.get('address_country') || '',
      phone: formData.get('address_phone') || ''
    };

    // Ajouter les données JSON stringifiées
    formDataToSend.append('measurements', JSON.stringify(measurements));
    formDataToSend.append('address', JSON.stringify(address));
    formDataToSend.append('size', formData.get('size') as string || '');

    // Gérer les photos
    const photos = formData.getAll('photos');
    photos.forEach(photo => {
      if (photo instanceof File && photo.size > 0) {
        formDataToSend.append('photos', photo);
      }
    });

    try {
      const res = await fetchWithTimeout(
        "https://showroom-backend-2x3g.onrender.com/profile/",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formDataToSend
        },
        10000
      );

      if (!res.ok) {
        const errorData = await res.json();
        return json({ success: false, error: errorData.detail || "Erreur lors de la mise à jour" });
      }

      return json({ success: true, message: "Profil mis à jour avec succès" });
    } catch (error) {
      return json({ success: false, error: "Erreur réseau lors de la mise à jour" });
    }
  }

  return json({ success: false, error: "Action non reconnue" });
};

export default function ProfilePage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);

  if (data.error && !data.user) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
              <p className="text-gray-600 mb-6">{data.error}</p>
              <div className="space-y-3">
                <a 
                  href="/login" 
                  className="block w-full bg-adawi-gold text-white py-2 px-4 rounded-lg hover:bg-adawi-gold/90 transition-colors"
                >
                  Se reconnecter
                </a>
                <a 
                  href="/" 
                  className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Retour à l'accueil
                </a>
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const user = data.user;

  if (navigation.state === "loading") {
    return (
      <ClientLayout userName={user?.full_name}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-adawi-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-adawi-brown font-medium">Chargement de votre profil...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout userName={user.full_name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-adawi-brown mb-2">
              Mon Profil
            </h1>
            <p className="text-gray-600">
              Consultez et gérez vos informations personnelles
            </p>
          </div>
          {!isEditing && user.measurements && Object.keys(user.measurements).length > 0 && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier mon profil
            </button>
          )}
        </div>

        {/* Messages de succès/erreur */}
        {actionData?.success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {actionData.message}
          </div>
        )}
        {actionData?.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {actionData.error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-adawi-brown via-adawi-brown-light to-adawi-gold p-8 text-white">
            <div className="flex items-center space-x-6">
              {/* Avatar ou Photo */}
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                {user.photo && user.photo.length > 0 ? (
                  <img src={user.photo[0]} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-3xl font-bold mb-2">{user.full_name}</h2>
                <p className="text-white/90 text-lg">
                  Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {!isEditing ? (
              <>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-adawi-brown mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Informations personnelles
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-adawi-gold/20 rounded-full flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-adawi-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Nom complet</p>
                          <p className="font-semibold text-adawi-brown">{user.full_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-adawi-gold/20 rounded-full flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-adawi-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Adresse email</p>
                          <p className="font-semibold text-adawi-brown">{user.email}</p>
                        </div>
                      </div>

                      {user.address && (
                        <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-adawi-gold/20 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-5 h-5 text-adawi-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Adresse</p>
                            <p className="font-semibold text-adawi-brown">{user.address.street || '-'}</p>
                            <p className="text-sm text-gray-700">{user.address.postal_code} {user.address.city}</p>
                            <p className="text-sm text-gray-700">{user.address.country}</p>
                            {user.address.phone && <p className="text-sm text-gray-700">Tél: {user.address.phone}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-adawi-brown mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Informations du compte
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-adawi-gold/20 rounded-full flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-adawi-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Rôle</p>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-adawi-gold text-white">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-adawi-gold/20 rounded-full flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-adawi-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Statut du compte</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ 
                            user.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? "Actif" : "Inactif"}
                          </span>
                        </div>
                      </div>

                      {user.size && (
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-adawi-gold/20 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-5 h-5 text-adawi-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Taille</p>
                            <p className="font-semibold text-adawi-brown">{user.size}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Measurements Section */}
                {user.measurements && Object.keys(user.measurements).length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-adawi-brown mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Mes Mensurations
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Object.entries(user.measurements).map(([key, value]) => {
                        if (key === "other_measurements" || !value) return null;
                        const label = key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                        return (
                          <div key={key} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">{label}</p>
                            <p className="font-semibold text-adawi-brown">{String(value)} cm</p>
                          </div>
                        );
                      })}
                    </div>

                    {user.measurements.other_measurements && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Notes supplémentaires</p>
                        <p className="text-adawi-brown">{user.measurements.other_measurements}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Message si pas de mensurations */}
                {(!user.measurements || Object.keys(user.measurements).length === 0) && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="bg-white border border-blue-200 rounded-lg p-6 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-adawi-gold mb-2">Mensurations non renseignées</h3>
                      <p className="text-adawi-gold mb-4">
                        Vos mensurations ne sont pas encore enregistrées. Contactez notre équipe pour les ajouter à votre profil.
                      </p>
                      <a 
                        href="tel:+22897732976" 
                        className="inline-flex items-center px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-brown transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Nous contacter
                      </a>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Form d'édition */
              <Form method="post" encType="multipart/form-data" onSubmit={() => setIsEditing(false)}>
                <input type="hidden" name="intent" value="updateProfile" />

                {/* Taille */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-adawi-brown mb-4">Taille</h3>
                  <select
                    name="size"
                    defaultValue={user.size || "M"}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-adawi-gold focus:border-adawi-gold"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                {/* Adresse */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-adawi-brown mb-4">Adresse</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rue</label>
                      <input
                        type="text"
                        name="address_street"
                        defaultValue={user.address?.street || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-adawi-gold focus:border-adawi-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <input
                        type="text"
                        name="address_city"
                        defaultValue={user.address?.city || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-adawi-gold focus:border-adawi-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                      <input
                        type="text"
                        name="address_postal_code"
                        defaultValue={user.address?.postal_code || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-adawi-gold focus:border-adawi-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                      <input
                        type="text"
                        name="address_country"
                        defaultValue={user.address?.country || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-adawi-gold focus:border-adawi-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        name="address_phone"
                        defaultValue={user.address?.phone || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-adawi-gold focus:border-adawi-gold"
                      />
                    </div>
                  </div>
                </div>

                {/* Mensurations - seulement si elles existent */}
                {user.measurements && Object.keys(user.measurements).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-adawi-brown mb-4">Mensurations (cm)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(user.measurements).map(([key, value]) => {
                        if (key === "other_measurements") return null;
                        const label = key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                        return (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {label}
                            </label>
                            <input
                              type="number"
                              name={key}
                              defaultValue={String(value || "")}
                              step="0.1"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-adawi-gold focus:border-adawi-gold"
                            />
                          </div>
                        );
                      })}
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Autres mesures
                        </label>
                        <textarea
                          name="other_measurements"
                          defaultValue={user.measurements.other_measurements || ""}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-adawi-gold focus:border-adawi-gold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Photos */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-adawi-brown mb-4">Photos de profil</h3>
                  <div className="space-y-4">
                    {user.photo && user.photo.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {user.photo.map((photo: string, idx: number) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                    <input
                      type="file"
                      name="photos"
                      multiple
                      accept="image/*"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-adawi-gold focus:border-adawi-gold file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-adawi-gold file:text-white hover:file:bg-adawi-gold/90"
                    />
                    <p className="text-sm text-gray-500">Vous pouvez sélectionner plusieurs images</p>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={navigation.state === "submitting"}
                    className="px-6 py-3 bg-adawi-gold text-white rounded-lg hover:bg-adawi-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {navigation.state === "submitting" ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M5 13l4 4L19 7" />
                        </svg>
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={navigation.state === "submitting"}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                </div>
              </Form>
            )}

            {/* Actions Section */}
            {!isEditing && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Form method="post" action="/logout">
                    <button 
                      type="submit" 
                      className="px-6 py-3 bg-gradient-to-r from-adawi-brown to-adawi-gold text-white rounded-lg hover:from-adawi-brown-light hover:to-adawi-gold-light transition-all duration-200 flex items-center justify-center shadow-md"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Se déconnecter
                    </button>
                  </Form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}