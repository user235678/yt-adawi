import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { useState } from "react";
import { Link } from "@remix-run/react";
import { redirect } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign Up - Adawi" },
    { name: "description", content: "Créez votre compte Adawi" },
  ];
};

export const loader = () => {
  return redirect("/auth");
};

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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
    console.log('Sign up attempt:', formData);
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      {/* Section d'inscription */}
      <section className="bg-gray-200 px-6 py-16">
        <div className="max-w-md mx-auto">
          {/* Titre */}
          <h1 className="text-3xl font-bold text-black text-center mb-4 tracking-wider">
            SIGN UP
          </h1>

          {/* Texte descriptif */}
          <p className="text-gray-600 text-center mb-8 text-sm">
            Creer votre compte pour commencer:
          </p>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Prénom */}
            <div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Nom"
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-gray-400 bg-white text-black placeholder-gray-500"
                required
              />
            </div>

            {/* Champ Nom */}
            <div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Prenom"
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-gray-400 bg-white text-black placeholder-gray-500"
                required
              />
            </div>

            {/* Champ Email */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E-mail"
                className="w-full px-4 py-3 border rounded-full border-gray-300 focus:outline-none focus:border-gray-400 bg-white text-black placeholder-gray-500"
                required
              />
            </div>

            {/* Champ Password */}
            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mot de passe"
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-gray-400 bg-white text-black placeholder-gray-500"
                required
              />
            </div>

            {/* Bouton Sign Up */}
            <button
              type="submit"
              className="w-full bg-black text-white font-medium py-3 px-4 rounded-full hover:bg-gray-800 transition-colors duration-300 tracking-wider"
            >
              S'inscrire
            </button>
          </form>

          {/* Lien de connexion */}
          <p className="text-center mt-6 text-sm text-gray-600">
            {`Déja membre? `}
            <Link
              to="/login"
              className="text-gray-800 hover:text-black transition-colors underline"
            >
              Se Connecter
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
