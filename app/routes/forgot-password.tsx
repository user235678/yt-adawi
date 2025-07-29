import { MetaFunction, ActionFunction } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import TopBanner from "~/components/TopBanner";
import Footer from "~/components/Footer";
import CompactHeader from "~/components/CompactHeader";

export const meta: MetaFunction = () => [{ title: "Forgot Password - The Providers" }];

// Action côté serveur : récupère l’email et affiche en console
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  console.log("Mot de passe oublié pour :", email);

  // Tu peux ici : générer un token, envoyer un mail, etc.
  return null;
};

export default function ForgotPassword() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [submitted, setSubmitted] = useState(false);

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
            <Form
              method="post"
              className="w-full space-y-4"
              onSubmit={() => setSubmitted(true)}
            >
              <div className="border-b-2 border-gray-300 hover:border-adawi-gold transition duration-300">
                <input
                  type="email"
                  name="email"
                  placeholder="Votre mail"
                  required
                  className="w-full bg-transparent outline-none border-none text-[18px] text-[#555] py-5 px-2 tracking-wide"
                />
              </div>

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
