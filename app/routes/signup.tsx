import { MetaFunction, ActionFunction } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TopBanner from "~/components/TopBanner";
import Footer from "~/components/Footer";
import CompactHeader from "~/components/CompactHeader";

export const meta: MetaFunction = () => [{ title: "The Providers - Sign Up" }];

// Fonction appelée à la soumission du formulaire
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  console.log({ username, email, password }); // Pour test

  // Tu peux ensuite connecter MongoDB ici si tu veux

  return null;
};

export default function Signup() {
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
        <div className="w-full max-w-md p-[60px_35px_35px_35px] rounded-[20px] bg-white font-sans font-bold text-[#03a1fc] shadow-xl">
          {/* Logo */}
          <div className="w-full mb-4 flex justify-center items-center">
            <img
              src="/ADAWI _ LOGO FOND BLANC.jpg"
              alt="Logo"
              className="h-[140px] object-contain"
            />
          </div>

          <div className="text-center text-[28px] text-[#555] tracking-[0.5px] mb-[10px]">
            SIGN UP
          </div>

          <Form method="post" className="space-y-4">
            <div className="border-b-2 border-gray-300 hover:border-adawi-gold transition duration-300">
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                className="w-full bg-transparent outline-none border-none text-[18px] text-[#555] py-5 px-2 tracking-wide"
              />
            </div>

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
                placeholder="Password"
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
                "Sign Up"
              )}
            </button>
          </Form>

          <div className="text-center text-sm text-gray-400 mt-4">
            <h3>Already have an account?</h3>
            <a href="/login" className="hover:text-adawi-gold">
               Login
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
