import { MetaFunction, ActionFunction } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TopBanner from "~/components/TopBanner";
import Footer from "~/components/Footer";
import CompactHeader from "~/components/CompactHeader";

export const meta: MetaFunction = () => [{ title: "The Providers - Login" }];

// Action fictive (à remplacer par vérif utilisateur plus tard)
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  console.log({ email, password }); // Pour test
  return null;
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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
        <div className="w-full max-w-sm h-auto p-6 rounded-[20px] bg-white font-sans font-bold text-black shadow-xl flex flex-col items-center justify-start">
          {/* Logo */}
          <div className="w-full h-[160px] flex justify-center items-center mb-2">
            <img
              src="/ADAWI _ LOGO FOND BLANC.jpg"
              alt="Logo"
              className="h-[140px] object-contain"
            />
          </div>

          {/* Title */}
          <div className="text-center text-[26px] text-adawi-brown tracking-[0.5px] mb-[25px]">
            CONNEXION
          </div>

          {/* Form */}
          <Form method="post" className="w-full space-y-4">
            <div className="border-b-2 border-gray-300 hover:border-adawi-gold transition duration-300">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full bg-transparent outline-none border-none text-[18px] text-[#555] py-5 px-2 tracking-wide"
              />
            </div>

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

          {/* Links */}
          <div className="text-center text-sm text-gray-400 mt-4">
            <a href="/forgot-password" className="hover:text-adawi-gold">
              Mot de passe oublié?
            </a><br />
            &nbsp;&nbsp;
            Nouveau membre? <a href="/signup" className="hover:text-adawi-gold">
             S'inscrire
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
