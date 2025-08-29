import { useState } from "react";
import { Facebook, Twitter, Github, Instagram, Mail, Phone, MapPin, ArrowRight, Heart } from "lucide-react";

const socialLinks = [
  { icon: Facebook, url: "https://facebook.com", name: "Facebook", color: "hover:bg-blue-600" },
  { icon: Twitter, url: "https://twitter.com", name: "Twitter", color: "hover:bg-sky-500" },
  { icon: Github, url: "https://github.com", name: "Github", color: "hover:bg-gray-800" },
  { icon: Instagram, url: "https://instagram.com", name: "Instagram", color: "hover:bg-pink-600" },
];

export default function Footer() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const navLinks = {
    commander: [
      { name: "Homme", href: "/boutique" },
      { name: "Femme", href: "/boutique" },
      { name: "Enfants", href: "/boutique" },
      { name: "Montres", href: "/boutique" },
    ],
    informations: [
      { name: "À propos", href: "/A-propos" },
      { name: "Blog", href: "/blog" },
      { name: "Services", href: "/services" },
      { name: "Notre équipe", href: "/equipe" },
      { name: "Contact", href: "/contact" },
    ],
    aide: [
      { name: "FAQ", href: "/faq" },
      { name: "Livraison", href: "/livraison" },
      { name: "Retours", href: "/retour" },
      { name: "Guide des tailles", href: "/guide-tailles" },
      { name: "Support", href: "/support" },
    ]
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-gentle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes pulse-soft {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .animate-float-gentle {
            animation: float-gentle 3s ease-in-out infinite;
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out both;
          }
          
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient-shift 4s ease infinite;
          }
          
          .animate-pulse-soft {
            animation: pulse-soft 2s ease-in-out infinite;
          }
          
          .link-hover-effect {
            position: relative;
            transition: all 0.3s ease;
          }
          
          .link-hover-effect::before {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #f59e0b, #d97706);
            transition: width 0.3s ease;
          }
          
          .link-hover-effect:hover::before {
            width: 100%;
          }
          
          .social-icon {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .social-icon:hover {
            transform: translateY(-3px) scale(1.1);
          }
        `
      }} />
      
      <footer className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white overflow-hidden">
        {/* Éléments décoratifs d'arrière-plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float-gentle"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-2xl animate-float-gentle" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-full blur-xl animate-float-gentle" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto">
            
            {/* Section principale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
              
              {/* Logo + Coordonnées */}
              <div className="lg:col-span-1 animate-fade-in-up">
                <div className="mb-8">
                  {/* Logo avec effet de brillance */}
                  <div className="relative group mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative bg-white p-4 rounded-2xl shadow-xl transform group-hover:scale-105 transition-all duration-300">
                      <img src="/ADAWI _ LOGO FOND BLANC.png" alt="" />
                    </div>
                  </div>
                  
                  {/* Informations de contact avec icônes */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 group">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-300 group-hover:text-white transition-colors duration-300">Carrefour Bodiona</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 group">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <a href="mailto:Adawi10@gmail.com" className="text-gray-300 hover:text-white transition-colors duration-300">
                          Adawi10@gmail.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 group">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <a href="tel:+22890000000" className="text-gray-300 hover:text-white transition-colors duration-300">
                          +228 90 00 00 00
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Réseaux sociaux */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Suivez-nous</h4>
                  <div className="flex space-x-4">
                    {socialLinks.map(({ icon: Icon, url, name, color }, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`social-icon group relative w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl flex items-center justify-center ${color} transition-all duration-300 hover:shadow-xl`}
                        aria-label={name}
                      >
                        <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          {name}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section Commander */}
              <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <h3 className="text-xl font-bold text-white mb-6 relative">
                  <span className="relative z-10">Commander</span>
                  <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                </h3>
                <ul className="space-y-3">
                  {navLinks.commander.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.href}
                        className="link-hover-effect text-gray-300 hover:text-white hover:translate-x-2 inline-flex items-center group transition-all duration-300"
                        onMouseEnter={() => setHoveredLink(`commander-${idx}`)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        <ArrowRight className={`w-4 h-4 mr-2 transition-all duration-300 ${hoveredLink === `commander-${idx}` ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section Informations */}
              <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <h3 className="text-xl font-bold text-white mb-6 relative">
                  <span className="relative z-10">Informations</span>
                  <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-green-400 to-blue-500"></div>
                </h3>
                <ul className="space-y-3">
                  {navLinks.informations.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.href}
                        className="link-hover-effect text-gray-300 hover:text-white hover:translate-x-2 inline-flex items-center group transition-all duration-300"
                        onMouseEnter={() => setHoveredLink(`info-${idx}`)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        <ArrowRight className={`w-4 h-4 mr-2 transition-all duration-300 ${hoveredLink === `info-${idx}` ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section Aide */}
              <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <h3 className="text-xl font-bold text-white mb-6 relative">
                  <span className="relative z-10">Aide</span>
                  <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500"></div>
                </h3>
                <ul className="space-y-3">
                  {navLinks.aide.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.href}
                        className="link-hover-effect text-gray-300 hover:text-white hover:translate-x-2 inline-flex items-center group transition-all duration-300"
                        onMouseEnter={() => setHoveredLink(`aide-${idx}`)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        <ArrowRight className={`w-4 h-4 mr-2 transition-all duration-300 ${hoveredLink === `aide-${idx}` ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-700/50 pt-8 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2 text-gray-400">
                  <span>© 2024 ADAWI. Tous droits réservés.</span>
                  <span className="animate-pulse-soft">•</span>
                  <span className="flex items-center">
                    Fait avec <Heart className="w-4 h-4 text-red-500 mx-1 animate-pulse" /> au Togo
                  </span>
                </div>
                <div className="flex space-x-6 text-sm">
                  <a href="/privacy" className="text-gray-400 hover:text-white link-hover-effect transition-colors duration-300">
                    Politique de confidentialité
                  </a>
                  <a href="/terms" className="text-gray-400 hover:text-white link-hover-effect transition-colors duration-300">
                    Conditions d'utilisation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}