import { MetaFunction, ActionFunction, json } from "@remix-run/node";
import { Form, useNavigation, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import TopBanner from "~/components/TopBanner";
import Footer from "~/components/Footer";
import CompactHeader from "~/components/CompactHeader";

export const meta: MetaFunction = () => [{ title: "Forgot Password - The Providers" }];

// Action côté serveur : envoie la requête à ton API
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  if (typeof email !== "string") {
    return json({ error: "Email invalide" }, { status: 400 });
  }

  try {
    const res = await fetch("https://showroom-backend-2x3g.onrender.com/auth/reset-password-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return json({ error: data.detail || "Erreur lors de la requête" }, { status: res.status });
    }

    const data = await res.json();
    return json({ success: true, message: data });
  } catch (err: any) {
    return json({ error: "Impossible de contacter le serveur" }, { status: 500 });
  }
};

export default function ForgotPassword() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData = useActionData<{ success?: boolean; error?: string }>();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      setSubmitted(true);
    }
  }, [actionData]);

  return (
    <>
      <TopBanner />
      <CompactHeader/>
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage:
            "url(https://img.freepik.com/premium-photo/background-image-elegant-clothing-boutique-interior-with-clothes-accessories-display-copy-space_236854-52930.jpg)",
        }}
      >
        <div className="w-full max-w-sm p-8 rounded-[20px] bg-white font-sans font-bold text-black shadow-xl flex flex-col items-center">
          {/* Logo */}
          <div className="mb-4">
            <img
              src="/ADAWI _ LOGO FOND BLANC.jpg"
              alt="Logo"
              className="h-[120px] object-contain"
            />
          </div>

          {/* Title */}
          <div className="text-center text-[24px] text-adawi-brown mb-6">
            Entrer votre adresse email.
          </div>

          {submitted ? (
            <div className="text-center text-green-600">
              Un lien a été envoyé à votre adresse email. Vérifiez votre boîte de réception et suivez les instructions.
            </div>
          ) : (
            <Form method="post" className="w-full space-y-4">
              <div className="border-b-2 border-gray-300 hover:border-adawi-gold transition duration-300">
                <input
                  type="email"
                  name="email"
                  placeholder="Votre mail"
                  required
                  className="w-full bg-transparent outline-none border-none text-[18px] text-[#555] py-5 px-2 tracking-wide"
                />
              </div>

              {actionData?.error && (
                <p className="text-red-500 text-sm text-center">{actionData.error}</p>
              )}

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
                  "Send Reset Link"
                )}
              </button>
            </Form>
          )}

          <div className="text-center text-sm text-gray-400 mt-4">
            <a href="/login" className="hover:text-adawi-gold">
              Retour a la connexion
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
