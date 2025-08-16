// routes/profile.tsx
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { readToken } from "~/utils/session.server";
import { Form } from "@remix-run/react";
import { useState, useEffect } from "react";
import TopBanner from "~/components/TopBanner";
import CompactHeader from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import SuccessNotification from "~/components/SuccessNotification";

export const loader: LoaderFunction = async ({ request }) => {
  const token = await readToken(request);
  if (!token) return redirect("/login");

  const res = await fetch("https://showroom-backend-2x3g.onrender.com/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return redirect("/login");

  const user = await res.json();
  return json(user);
};

export default function ProfilePage() {
  const user = useLoaderData<typeof loader>();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Vérifier si c'est la première visite de cette session
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcomeMessage');
    
    if (!hasShownWelcome) {
      setShowNotification(true);
      // Marquer que le message a été affiché pour cette session
      sessionStorage.setItem('hasShownWelcomeMessage', 'true');
    }
  }, []);

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  return (
    <div className="min-h-screen bg-adawi-beige">
      {/* Notification de connexion */}
      {showNotification && (
        <SuccessNotification
          message={`Vous êtes connecté en tant que ${user.full_name}`}
          duration={5000}
          onClose={handleNotificationClose}
        />
      )}

      <TopBanner />
      <CompactHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-adawi-brown via-adawi-brown-light to-adawi-gold p-8 text-white">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
                <p className="text-white/90 text-lg">{user.full_name}</p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-adawi-brown mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informations personnelles
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-adawi-beige rounded-lg">
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

                  <div className="flex items-center p-4 bg-adawi-beige rounded-lg">
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
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-adawi-brown mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Informations du compte
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-adawi-beige rounded-lg">
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

                  <div className="flex items-center p-4 bg-adawi-beige rounded-lg">
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
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-adawi-beige text-adawi-brown rounded-lg hover:bg-adawi-beige-dark transition-colors duration-200 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier le profil
                </button>

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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
