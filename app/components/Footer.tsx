import { Link } from "@remix-run/react";
import { Facebook, Twitter, Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-600 text-gray-300 px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Grille principale */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo + Coordonnées */}
          <div>
            <div className="flex items-center mb-4">
              <img src="ADAWI_LOGO BLANC_PNG.png"
              className="w-40 h-auto " 
              alt="Logo ADAWI" />
              
              {/* <span className="text-2xl font-bold text-white">Adawi</span> */}
            </div>
            <div className="space-y-1 text-sm">
              <p>Carrefour Bodiona</p>
              <p>Adawi10@gmail.com</p>
              <p>+228 90000000</p>
            </div>

            {/* Réseaux sociaux */}
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-amber-500 transition-transform duration-300 ease-out hover:scale-110 hover:rotate-[360deg]"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-amber-500 transition-transform duration-300 ease-out hover:scale-110 hover:rotate-[360deg]"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-amber-500 transition-transform duration-300 ease-out hover:scale-110 hover:rotate-[360deg]"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-amber-500 transition-transform duration-300 ease-out hover:scale-110 hover:rotate-[360deg]"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Bloc Commander */}
          <div className="mt-20">
            <h3 className="text-lg font-semibold text-black mb-4">Commander</h3>
            <ul className="space-y-2 text-sm text-black">
              <li><Link to="/homme" className="hover:text-white">Homme</Link></li>
              <li><Link to="/femme" className="hover:text-white">Femme</Link></li>
              <li><Link to="/enfants" className="hover:text-white">Enfants</Link></li>
              <li><Link to="/montres" className="hover:text-white">Montres</Link></li>
            </ul>
          </div>

          {/* Bloc Info */}
          <div className="mt-20">
            <h3 className="text-lg font-semibold text-black mb-4">Informations</h3>
            <ul className="space-y-2 text-sm text-black">
              <li><Link to="/index" className=" hover:text-white">À propos</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link to="/services" className="hover:text-white">Services</Link></li>
              <li><Link to="/equipe" className="hover:text-white">Notre équipe</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Bloc Aide */}
          <div className="mt-20">
            <h3 className="text-lg font-semibold text-black mb-4">Aide</h3>
            <ul className="space-y-2 text-sm text-black">
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link to="/livraison" className="hover:text-white">Livraison</Link></li>
              <li><Link to="/retours" className="hover:text-white">Retours</Link></li>
              <li><Link to="/guide-tailles" className="hover:text-white">Guide des tailles</Link></li>
              <li><Link to="/support" className="hover:text-white">Support</Link></li>
            </ul>
          </div>
        </div>

        
      </div>
    </footer>
  );
}
