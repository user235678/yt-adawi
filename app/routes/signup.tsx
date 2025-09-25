// app/routes/signup.tsx
import { MetaFunction, ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useNavigation, useActionData, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import TopBanner from "~/components/TopBanner";
import Footer from "~/components/Footer";
import CompactHeader from "~/components/CompactHeader";

export const meta: MetaFunction = () => [{ title: "The Providers - Sign Up" }];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const full_name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  const payload = {
    email,
    full_name,
    role: "client",
    is_banned: false,
    is_active: true,
    is_deleted: false,
    password,
  };

  try {
    const res = await fetch(
      "https://showroom-backend-2x3g.onrender.com/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // On renvoie exactement le message du backend s'il existe
      return json(
        { error: data.message || "Une erreur est survenue lors de l'inscription" },
        { status: res.status }
      );
    }

    return json({ success: true });
  } catch (err: any) {
    return json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
};

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.error) {
      setErrorMessage(actionData.error);
      setButtonState('error');
    } else if (actionData?.success) {
      setButtonState('success');
      // Redirection après 5 secondes vers la page de login
      setTimeout(() => {
        navigate("/login?success=1");
      }, 2000);
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
      <CompactHeader />
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage:
            "url(https://img.freepik.com/premium-photo/background-image-elegant-clothing-boutique-interior-with-clothes-accessories-display-copy-space_236854-52930.jpg)",
        }}
      >
        <div className="w-full max-w-md p-[60px_35px_35px_35px] rounded-[20px] bg-white font-sans font-bold text-[#03a1fc] shadow-xl">
          {/* Logo */}
          <div className="w-full mb-4 flex justify-center items-center">
            <img
              src="/ADAWI _ LOGO FOND BLANC.jpg"
              alt="Logo"
              className="h-[140px] object-contain"
            />
          </div>

          <div className="text-center text-[28px] text-adawi-brown tracking-[0.5px] mb-[10px]">
            S'INSCRIRE
          </div>

          {errorMessage && buttonState === 'error' && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{errorMessage}</p>
            </div>
          )}

          <Form method="post" className="space-y-4">
            <div className="border-b-2 border-gray-300 hover:border-adawi-gold transition duration-300">
              <input
                type="text"
                name="name"
                placeholder="Nom"
                disabled={isDisabled}
                required
                className="w-full bg-transparent outline-none border-none text-[18px] text-[#555] py-5 px-2 tracking-wide"
              />
            </div>

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
                <span className="transition-opacity duration-200">S'inscrire</span>
              )}
            </button>
          </Form>

          <div className="text-center text-sm text-gray-400 mt-4">
            <h3>Déjà membre ?</h3>
            <a href="/login" className="text-adawi-gold hover:text-black underline">
              Connexion
            </a>
          </div>
          <div className="text-center text-sm text-gray-400 mt-4">
            <a href="/support" className="text-adawi-gold underline hover:text-black">
              Service Client
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}