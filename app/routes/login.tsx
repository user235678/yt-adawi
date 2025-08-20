import {
  MetaFunction,
  ActionFunction,
  LoaderFunction,
  json,
  redirect
} from "@remix-run/node";
import { Form, useNavigation, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import TopBanner from "~/components/TopBanner";
import Footer from "~/components/Footer";
import CompactHeader from "~/components/CompactHeader";
import { API_BASE } from "~/utils/auth.server";
import { commitToken, readToken } from "~/utils/session.server";

export const meta: MetaFunction = () => [{ title: "The Providers - Login" }];

/** Si déjà connecté, on redirige vers /boutique */
export const loader: LoaderFunction = async ({ request }) => {
  const token = await readToken(request);
  if (token) return redirect("/user");
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return json({ error: "Veuillez remplir tous les champs." }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      // Essaye d'extraire un message propre depuis l'API
      let message = "Identifiants incorrects.";
      try {
        const data = await res.json();
        message = data?.detail || data?.message || message;
      } catch { /* ignore */ }
      return json({ error: message }, { status: res.status });
    }

    const data = await res.json();
    console.log("📦 Réponse de connexion:", data);

    // Récupérer le token et le session_id
    const token: string = data?.access_token || data?.token || data?.jwt || "";
    const sessionId: string = data?.session_id || "";

    if (!token) {
      return json(
        { error: "Réponse de l'API inattendue: token manquant." },
        { status: 500 }
      );
    }

    console.log("✅ Token reçu:", !!token);
    console.log("✅ Session ID reçu:", !!sessionId);

    // Créer un objet avec les informations de session
    const sessionData = {
      access_token: token,
      session_id: sessionId,
      token_type: data?.token_type || "bearer"
    };

    // Écrit les données de session dans un cookie HttpOnly et redirige vers boutique
    return redirect("/boutique", {
      headers: await commitToken(JSON.stringify(sessionData)),
    });
  } catch (e: any) {
    return json(
      { error: e?.message || "Erreur serveur (login)." },
      { status: 500 }
    );
  }
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData = useActionData<{ error?: string }>();

  // Récupérer les paramètres d'erreur de l'URL
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    setUrlParams(new URLSearchParams(window.location.search));
  }, []);

  // Messages d'erreur basés sur les paramètres URL
  const getErrorMessage = () => {
    if (actionData?.error) return actionData.error;

    if (urlParams) {
      const errorType = urlParams.get("error");
      switch (errorType) {
        case "timeout":
          return "Votre session a expiré. Veuillez vous reconnecter.";
        case "network":
          return "Problème de connexion réseau. Veuillez réessayer.";
        case "unknown":
          return "Une erreur est survenue. Veuillez vous reconnecter.";
        default:
          return null;
      }
    }

    return null;
  };

  const errorMessage = getErrorMessage();

  // Marquer qu'une connexion vient d'avoir lieu côté client
  useEffect(() => {
    if (navigation.state === "loading" && navigation.formAction === "/login") {
      // Marquer qu'une connexion réussie vient d'avoir lieu
      sessionStorage.setItem("justLoggedIn", "true");
    }
  }, [navigation.state, navigation.formAction]);

  return (
    <>
      <TopBanner />
      <CompactHeader />
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage:
            "url(https://img.freepik.com/premium-photo/background-image-elegant-clothing-boutique-interior-with-clothes-accessories-display-copy-space_236854-52930.jpg)",
        }}
      >
        <div className="w-full max-w-sm h-auto p-6 rounded-[20px] bg-white font-sans font-bold text-black shadow-xl flex flex-col items-center justify-start">
          {/* Logo */}
          <div className="w-full h-[160px] flex justify-center items-center mb-2">
            <img
              src="/ADAWI _ LOGO FOND BLANC.jpg"
              alt="Logo"
              className="h-[140px] object-contain"
            />
          </div>

          <div className="text-center text-[26px] text-adawi-brown tracking-[0.5px] mb-[25px]">
            CONNEXION
          </div>

          {errorMessage && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{errorMessage}</p>
            </div>
          )}

          <Form method="post" className="w-full space-y-4">
            {/* Email */}
            <div className="border-b-2 border-gray-300 hover:border-adawi-gold transition duration-300">
              <input
                type="email"
                name="email"
                placeholder="Email"
                disabled={isSubmitting}
                required
                className="w-full bg-transparent outline-none border-none text-[18px] text-[#555] py-5 px-2 tracking-wide"
              />
            </div>

            {/* Mot de passe */}
            <div className="relative border-b-2 border-gray-300 hover:border-adawi-gold transition duration-300">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mot de passe"
                required
                className="w-full bg-transparent outline-none border-none text-[18px] text-[#555] py-5 px-2 pr-10 tracking-wide"
              />
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Afficher/masquer le mot de passe"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-[60px] mt-6 rounded-full text-white text-[20px] font-bold bg-gradient-to-r from-adawi-brown via-adawi-brown-light to-adawi-gold-light shadow-md transition duration-500 hover:bg-right flex items-center justify-center ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Connexion"
              )}
            </button>
          </Form>

          {/* Liens */}
          <div className="text-center text-sm text-gray-400 mt-4">
            <a href="/forgot-password" className="hover:text-adawi-gold">
              Mot de passe oublié?
            </a>
            <br />
            Nouveau membre?{" "}
            <a href="/signup" className="hover:text-adawi-gold">
              S'inscrire
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
