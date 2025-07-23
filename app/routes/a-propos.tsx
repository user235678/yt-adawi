import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Services from "~/components/Services";
import Footer from "~/components/Footer";

export const meta: MetaFunction = () => {
  return [
    { title: "À propos - Adawi" },
    { name: "description", content: "Découvrez l'univers Adawi, bien plus qu'une simple boutique de vêtements." },
  ];
};

export default function APropos() {
  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      {/* Hero Section avec image de boutique */}
      <section className="relative h-[500px] overflow-hidden">
        <img
          src="/image.png"
          alt="Intérieur moderne de la boutique Adawi avec vêtements suspendus, éclairage design et comptoir central"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <h1 className="text-white text-4xl md:text-5xl font-light text-center">
            Bienvenue chez Adawi
          </h1>
        </div>
      </section>

      {/* Section descriptive */}
      <section className="bg-white px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-8 leading-tight">
            bien plus qu'une simple boutique de vêtements un univers où la mode, l'élégance et l'originalité se rencontrent
          </h2>
          
          <div className="space-y-6 text-black text-base leading-relaxed">
            <p>
              Fondée avec passion, Adawi est née du désir d'offrir des tenues qui mettent en valeur toutes les personnalités. Que vous soyez à la recherche d'un look chic, décontracté ou audacieux, notre sélection de vêtements a été pensée pour répondre à tous les styles et toutes les occasions.
            </p>
            
            <p>Nous mettons un point d'honneur à proposer :</p>
            
            <ul className="space-y-2 ml-6">
              <li className="flex items-start">
                <span className="text-adawi-gold mr-2">•</span>
                des collections tendances et soigneusement sélectionnées ;
              </li>
              <li className="flex items-start">
                <span className="text-adawi-gold mr-2">•</span>
                une qualité irréprochable à des prix accessibles ;
              </li>
              <li className="flex items-start">
                <span className="text-adawi-gold mr-2">•</span>
                un accompagnement personnalisé pour vous aider à trouver la tenue parfaite.
              </li>
            </ul>
            
            <p>
              Notre boutique, c'est aussi un espace chaleureux et accueillant où chaque client(e) est reçu(e) avec attention, car votre style est unique, et nous sommes là pour le sublimer.
            </p>
            
            <p>
              Merci de faire partie de l'aventure Adawi. ✨<br />
              Votre style commence ici.
            </p>
          </div>
        </div>
      </section>

      
      <Services />

      {/* Section image des vêtements */}
      <section className="bg-white">
        <div className="w-full h-[400px] md:h-[500px] overflow-hidden">
          <img
            src="/image1.png"
            alt="Collection de vêtements colorés suspendus sur cintres dans un dressing moderne"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
