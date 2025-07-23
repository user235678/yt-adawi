import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import AuthForm from "~/components/AuthForm";
import { useState } from "react";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => {
  return [
    { title: "Authentification - Adawi" },
    { name: "description", content: "Connectez-vous ou créez votre compte Adawi" },
  ];
};

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      {/* Section d'authentification */}
      <section className="bg-gray-200 px-6 py-16 min-h-[calc(100vh-200px)] flex items-center">
        <div className="w-full shadow-sm">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'signup' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <AuthForm mode={mode} onModeChange={setMode} />
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
