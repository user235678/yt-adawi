// app/routes/login.tsx
import { MetaFunction, ActionFunction, json, redirect } from "@remix-run/node";
import { Form, useNavigation, useActionData } from "@remix-run/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TopBanner from "~/components/TopBanner";
import Footer from "~/components/Footer";
import CompactHeader from "~/components/CompactHeader";

export const meta: MetaFunction = () => [{ title: "The Providers - Login" }];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  const payload = { email, password };

  try {
    // URL réelle du backend (pas celle de la doc Swagger)
    const res = await fetch("https://showroom-backend-2x3g.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMsg = "Connexion échouée";

      try {
        const errorData = await res.json();
        // On tente de récupérer un message clair
        errorMsg =
          errorData?.detail ||
          errorData?.message ||
          errorData?.error ||
          errorData?.errors?.[0]?.msg ||
          errorMsg;
      } catch {
        // Si la réponse n’est pas un JSON lisible
        errorMsg = `Erreur ${res.status}`;
      }

      return json({ error: errorMsg }, { status: res.status });
    }

    const data = await res.json();
    console.log("Token reçu:", data.access_token);

    // TODO: Stockage du token en cookie/session si besoin
    return redirect("/boutique");
  } catch (err: any) {
    return json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData = useActionData<{ error?: string }>();

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

          {actionData?.error && (
            <p className="text-red-500 text-center mb-4">{actionData.error}</p>
          )}

          <Form method="post" className="w-full space-y-4">
            {/* Email */}
            <div className="border-b-2 border-gray-300 hover:border-adawi-gold transition duration-300">
              <input
                type="email"
                name="email"
                placeholder="Email"
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
