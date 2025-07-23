import { Link } from "@remix-run/react";
import { Facebook, Twitter, Github, Linkedin, Instagram } from "lucide-react";


const socialLinks = [
  { icon: Facebook, url: "https://facebook.com" },
  { icon: Twitter, url: "https://twitter.com" },
  { icon: Github, url: "https://github.com" },
  { icon: Instagram, url: "https://instagram.com" },
];
export default function Footer() {
  return (
    <footer className="bg-gray-400 text-black px-4 sm:px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Grille principale responsive : 2 colonnes sur mobile, 4 sur md */}
        <div className="grid grid-cols-2sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Logo + Coordonnées */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <img
                src="ADAWI_LOGO BLANC_PNG.png"
                className="w-32 sm:w-40 h-auto"
                alt="Logo ADAWI"
              />
            </div>
            <div className="space-y-1 text-sm">
              <p>Carrefour Bodiona</p>
              <p>Adawi10@gmail.com</p>
              <p>+228 90000000</p>
            </div>

            {/* Réseaux sociaux */}
            <div className="flex space-x-4 mt-6 text-white">
              {socialLinks.map(({ icon: Icon, url }, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center hover:bg-amber-500 transition-transform duration-300 ease-out hover:scale-110 hover:rotate-[360deg]"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Bloc Commander */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">Commander</h3>
            <ul className="space-y-2 text-sm text-black">
              <li><Link to="/homme" className="hover:text-white">Homme</Link></li>
              <li><Link to="/femme" className="hover:text-white">Femme</Link></li>
              <li><Link to="/enfants" className="hover:text-white">Enfants</Link></li>
              <li><Link to="/montres" className="hover:text-white">Montres</Link></li>
            </ul>
          </div>

          {/* Bloc Info */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">Informations</h3>
            <ul className="space-y-2 text-sm text-black">
              <li><Link to="/A-propos" className="hover:text-white">À propos</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link to="/services" className="hover:text-white">Services</Link></li>
              <li><Link to="/equipe" className="hover:text-white">Notre équipe</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Bloc Aide */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">Aide</h3>
            <ul className="space-y-2 text-sm text-black">
              <li><Link to="/" className="hover:text-white">FAQ</Link></li>
              <li><Link to="/livraison" className="hover:text-white">Livraison</Link></li>
              <li><Link to="/retour" className="hover:text-white">Retours</Link></li>
              <li><Link to="/guide-tailles" className="hover:text-white">Guide des tailles</Link></li>
              <li><Link to="/support" className="hover:text-white">Support</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
