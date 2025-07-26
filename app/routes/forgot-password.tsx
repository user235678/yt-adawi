import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { useState } from "react";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Mot de passe oublié - Adawi" },
    { name: "description", content: "Réinitialisez votre mot de passe Adawi" },
  ];
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password reset request for:', email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <TopBanner />
        <Header />

        {/* Section de confirmation */}
        <section className="bg-gray-200 px-6 py-16">
          <div className="max-w-md mx-auto text-center">
            {/* Icône de confirmation */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Titre */}
            <h1 className="text-3xl font-bold text-black text-center mb-4 tracking-wider">
              EMAIL ENVOYÉ
            </h1>

            {/* Message de confirmation */}
            <p className="text-gray-600 text-center mb-8 text-sm leading-relaxed">
              Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
              <br />
              Vérifiez votre boîte de réception et suivez les instructions.
            </p>

            {/* Informations supplémentaires */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 text-xs">
                <strong>Vous ne recevez pas l'email ?</strong>
                <br />
                Vérifiez vos spams ou contactez notre support.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full bg-black text-white font-medium py-3 px-4 rounded-none hover:bg-gray-800 transition-colors duration-300 tracking-wider text-center"
              >
                RETOUR À LA CONNEXION
              </Link>

              <button
                onClick={() => setIsSubmitted(false)}
                className="block w-full bg-white text-black font-medium py-3 px-4 rounded-none border border-gray-300 hover:bg-gray-50 transition-colors duration-300 tracking-wider"
              >
                RENVOYER L'EMAIL
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      {/* Section de réinitialisation */}
      <section className="bg-gray-200 px-6 py-16">
        <div className="max-w-md mx-auto">
          {/* Titre */}
          <h1 className="text-3xl font-bold text-black text-center mb-4 tracking-wider">
            MOT DE PASSE OUBLIÉ
          </h1>

          {/* Texte descriptif */}
          <p className="text-gray-600 text-center mb-8 text-sm leading-relaxed">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Email */}
            <div>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                placeholder="Votre adresse e-mail"
                className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-400 bg-white text-black placeholder-gray-500"
                required
              />
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="w-full bg-black text-white font-medium py-3 px-4 rounded-none hover:bg-gray-800 transition-colors duration-300 tracking-wider"
            >
              ENVOYER LE LIEN
            </button>
          </form>

          {/* Informations de sécurité */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-xs">
              <strong>Note de sécurité :</strong> Si cette adresse email n'est pas associée à un compte, vous ne recevrez pas d'email.
            </p>
          </div>

          {/* Liens de navigation */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-gray-600">
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link
                to="/login"
                className="text-gray-800 hover:text-black transition-colors underline"
              >
                Se connecter
              </Link>
            </p>
            
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link
                to="/signup"
                className="text-gray-800 hover:text-black transition-colors underline"
              >
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Support */}
          <div className="text-center mt-8 pt-6 border-t border-gray-300">
            <p className="text-xs text-gray-500 mb-2">
              Besoin d'aide ?
            </p>
            <Link
              to="/contact"
              className="text-xs text-gray-600 hover:text-black transition-colors underline"
            >
              Contacter le support client
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
