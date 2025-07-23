import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { useState } from "react";
import { Link } from "@remix-run/react";
import { redirect } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Login - Adawi" },
    { name: "description", content: "Connectez-vous à votre compte Adawi" },
  ];
};

export const loader = () => {
  return redirect("/auth");
};

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      {/* Section de connexion */}
      <section className="bg-gray-200 px-6 py-16">
        <div className="max-w-md mx-auto">
          {/* Titre */}
          <h1 className="text-3xl font-bold text-black text-center mb-4 tracking-wider">
            LOGIN
          </h1>

          {/* Texte descriptif */}
          <p className="text-gray-600 text-center mb-8 text-sm">
            Veuillez entrer vos identifiants de connexion:
          </p>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Email */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E-mail"
                className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-400 bg-white text-black placeholder-gray-500"
                required
              />
            </div>

            {/* Champ Password avec lien "Forgot password" */}
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:border-gray-400 bg-white text-black placeholder-gray-500"
                required
              />
              <Link
                to="/forgot-password"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Mot de passe oublié?
              </Link>
            </div>

            {/* Bouton Login */}
            <button
              type="submit"
              className="w-full bg-black text-white font-medium py-3 px-4 rounded-none hover:bg-gray-800 transition-colors duration-300 tracking-wider"
            >
              CONNEXION
            </button>
          </form>

          {/* Lien d'inscription */}
          <p className="text-center mt-6 text-sm text-gray-600">
            {`Nouveau Membre? `}
            <Link
              to="/signup"
              className="text-gray-800 hover:text-black transition-colors underline"
            >
              Creer un compte
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
