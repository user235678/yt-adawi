import {
  MetaFunction,
  ActionFunction,
  LoaderFunction,
  json,
  redirect
} from "@remix-run/node";
import { Form, useNavigation, useActionData, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import TopBanner from "~/components/TopBanner";
import Footer from "~/components/Footer";
import { API_BASE } from "~/utils/auth.server";
import { commitToken, readToken } from "~/utils/session.server";
import { getUserProfile } from "~/utils/auth.server";
import Header from "~/components/CompactHeader";

export const meta: MetaFunction = () => [{ title: "The Providers - Login" }];

/** Si déjà connecté, on redirige vers /boutique */
export const loader: LoaderFunction = async ({ request }) => {
  const token = await readToken(request);
  if (!token) {
    return null; // pas connecté → rester sur la page
  }

  // Check if just logged in, don't redirect immediately to show animation
  const cookieHeader = request.headers.get("cookie") || "";
  if (cookieHeader.includes("just_logged_in=true")) {
    // Clear the flag by setting it to expire
    return new Response(null, {
      headers: {
        "Set-Cookie": "just_logged_in=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      },
    });
  }

  const user = await getUserProfile(request);
  if (!user) {
    return null; // token invalide → rester sur la page
  }

  // choisir la bonne route selon le rôle
  let target = "/boutique"; // par défaut pour les clients
  switch (user.role?.toLowerCase()) {
    case "admin":
      target = "/admin/dashboard";
      break;
    case "vendeur":
    case "seller":
      target = "/seller/dashboard";
      break;
    case "client":
    case "customer":
      target = "/boutique";
      break;
    default:
      target = "/boutique";
  }

  throw redirect(target);
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
      let message = "Identifiants incorrects.";
      try {
        const data = await res.json();
        message = data?.detail || data?.message || message;
      } catch { /* ignore */ }
      return json({ error: message }, { status: res.status });
    }

    const data = await res.json();
    const token = data?.access_token || data?.token || data?.jwt || "";
    const sessionId = data?.session_id || "";

    if (!token) {
      return json(
        { error: "Réponse de l'API inattendue: token manquant." },
        { status: 500 }
      );
    }

    // Commit token to session
    const sessionData = {
      access_token: token,
      session_id: sessionId,
      token_type: data?.token_type || "bearer"
    };

    const headers = await commitToken(JSON.stringify(sessionData));
    // Set a flag to prevent loader redirect immediately
    headers["Set-Cookie"] += "; just_logged_in=true; Path=/; HttpOnly; SameSite=Lax";

    return json({ success: true }, {
      headers,
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
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const navigate = useNavigate();

  // Récupérer les paramètres d'erreur de l'URL
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrlParams(new URLSearchParams(window.location.search));
    }
  }, []);

  // Messages d'erreur basés sur les paramètres URL
  const getUrlErrorMessage = () => {
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

  useEffect(() => {
    const urlError = getUrlErrorMessage();
    if (urlError) {
      setErrorMessage(urlError);
      setButtonState('error');
    }
  }, [urlParams]);

  useEffect(() => {
    if (actionData?.error) {
      setErrorMessage(actionData.error);
      setButtonState('error');
    } else if (actionData?.success) {
      setButtonState('success');
      // Redirection après 5 secondes (temps pour voir l'animation complète)
      setTimeout(() => {
        navigate("/boutique");
      }, 10000);
    }
  }, [actionData, navigate]);

  const isSubmitting = navigation.state === "submitting";
  const isDisabled = isSubmitting || buttonState === 'success' || buttonState === 'loading';

  useEffect(() => {
    if (isSubmitting && buttonState !== 'success') {
      setButtonState('loading');
      setErrorMessage("");
    }
  }, [isSubmitting, buttonState]);

  // Composant SVG pour l'animation de succès (style Stripe)
  const SuccessAnimation = () => (
    <div className="relative w-8 h-8">
      <svg
        className="w-8 h-8"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cercle de fond */}
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          fill="none"
        />
        {/* Cercle animé */}
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="87.96"
          strokeDashoffset={buttonState === 'success' ? 0 : 87.96}
          transform="rotate(-90 16 16)"
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
          }}
        />
        {/* Coche complète en une seule fois avec animation de dessin */}
        <g
          opacity={buttonState === 'success' ? 1 : 0}
          style={{
            transition: 'opacity 0.2s ease-out',
            transitionDelay: '1.5s',
          }}
        >
          <path
            d="M10 16.5l3.5 3.5L22 11"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="15"
            strokeDashoffset={buttonState === 'success' ? 0 : 15}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
              transitionDelay: '1.7s',
            }}
          />
        </g>
      </svg>
    </div>
  );

  // Spinner de chargement
  const LoadingSpinner = () => (
    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );

  return (
    <>
      <TopBanner />
      <Header />
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

          {errorMessage && buttonState === 'error' && (
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
                disabled={isDisabled}
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
                disabled={isDisabled}
                required
                className="w-full bg-transparent outline-none border-none text-[18px] text-[#555] py-5 px-2 pr-10 tracking-wide"
              />
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => !isDisabled && setShowPassword((prev) => !prev)}
                aria-label="Afficher/masquer le mot de passe"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            {/* Bouton avec animation Stripe */}
            <button
              type="submit"
              disabled={isDisabled}
              className={`
                w-full h-[60px] mt-6 rounded-full text-white text-[20px] font-bold 
                bg-gradient-to-r from-adawi-brown via-adawi-brown-light to-adawi-gold-light 
                shadow-md transition-all duration-300 
                flex items-center justify-center relative overflow-hidden
                ${isDisabled ? "cursor-not-allowed" : "hover:shadow-lg hover:scale-[1.02]"}
                ${buttonState === 'success' ? 'bg-green-500' : ''}
              `}
            >
              {buttonState === 'loading' ? (
                <LoadingSpinner />
              ) : buttonState === 'success' ? (
                <SuccessAnimation />
              ) : (
                <span className="transition-opacity duration-200">Se connecter</span>
              )}
            </button>
          </Form>

          {/* Liens */}
          <div className="text-center text-sm text-gray-400 mt-4">
            <a href="/forgot-password" className="text-adawi-gold underline hover:text-black">
              Mot de passe oublié?
            </a>
            <br />
            Nouveau membre?{" "}
            <a href="/signup" className="text-adawi-gold underline hover:text-black">
              S'inscrire
            </a>
          </div>
          <div className="text-center text-sm text-gray-400 mt-4">
            <a href="/support" className="text-adawi-gold underline hover:text-black">
              Contacter le Service Client
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}