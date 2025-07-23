import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { useState } from "react";
import { Facebook, Instagram, Linkedin, Github } from "lucide-react"; 


export const meta: MetaFunction = () => {
    return [
        { title: "Contact - Adawi" },
        { name: "description", content: "Contactez-nous pour toute question. Nous sommes situés à Carrefour Bodjona." },
    ];
};
const socialIcons = [
  { label: "TikTok", href: "#", icon: <Github className="w-4 h-4" /> },
  { label: "Facebook", href: "#", icon: <Facebook className="w-4 h-4" /> },
  { label: "Instagram", href: "#", icon: <Instagram className="w-4 h-4" /> },
  { label: "LinkedIn", href: "#", icon: <Linkedin className="w-4 h-4" /> },
];
export default function Contact() {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        message: '',
        acceptTerms: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Formulaire soumis:', formData);
    };

    return (
        <div className="min-h-screen bg-white">
            <TopBanner />
            <Header />
            <section className="bg-adawi-beige px-4 sm:px-6 py-8 sm:py-12">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center gap-8">
                    {/* Infos de contact */}
                    <div className="w-full md:w-[45%] space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                        <h1 className="text-2xl font-bold text-black mb-6">Entrez en contact</h1>
                        <div className="space-y-3 text-black">
                            <p className="text-sm">Nous sommes situés à Carrefour Bodjona</p>
                            <p className="text-sm">Adawi10@gmail.com</p>
                            <p className="text-sm">+228 90000000</p>
                        </div>
                        <div className="flex space-x-3 pt-3 justify-center md:justify-start">
  {socialIcons.map((item, idx) => (
    <a
      key={idx}
      href={item.href}
      className="w-8 h-8 bg-black text-white rounded-sm flex items-center justify-center hover:bg-adawi-gold transition-colors duration-300"
      aria-label={item.label}
    >
      {item.icon}
    </a>
  ))}
</div>
                    </div>

                    {/* Formulaire */}
                    <div className="w-full md:w-[45%] max-w-md space-y-4 flex flex-col items-center md:items-start mx-auto">
                        <h2 className="text-xl font-bold mb-6 text-black text-center md:text-left w-full">Envoyez-nous un message</h2>
                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            <div>
                                <label htmlFor="nom" className="block text-xs font-medium text-black mb-1">Nom</label>
                                <input
                                    type="text"
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleInputChange}
                                    className="w-full px-2 py-2 border-2 border-adawi-gold rounded-md focus:outline-none focus:ring-1 focus:ring-adawi-gold bg-white text-black text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-xs font-medium text-black mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-2 py-2 border-2 border-adawi-gold rounded-md focus:outline-none focus:ring-1 focus:ring-adawi-gold bg-white text-black text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-xs font-medium text-black mb-1">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-2 py-2 border-2 border-adawi-gold rounded-md focus:outline-none focus:ring-1 focus:ring-adawi-gold bg-white text-black text-sm"
                                    required
                                />
                            </div>
                            <div className="flex items-start space-x-2">
                                <input
                                    type="checkbox"
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleInputChange}
                                    className="mt-0.5 w-4 h-4 bg-white border-2 border-adawi-gold rounded text-adawi-gold focus:ring-2 focus:ring-adawi-gold checked:bg-adawi-gold"
                                    required
                                />
                                <label htmlFor="acceptTerms" className="text-xs text-black">
                                    J'accepte tous les termes <br /> et conditions
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-adawi-gold hover:bg-adawi-gold/90 text-white font-medium py-2 px-4 rounded-full transition-colors duration-300 shadow-sm hover:shadow-md text-sm"
                            >
                                Envoyer
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Carte */}
            <section className="bg-white">
                <div className="w-full h-[300px] sm:h-[400px] relative rounded-lg shadow-md overflow-hidden">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3812.0768282401923!2d1.2077794748024113!3d6.125413693861329!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10215f618ff4057f%3A0x283893dcd5d0ac3b!2sInstitut%20africain%20d'informatique%20(IAI-%20Togo)!5e1!3m2!1sfr!2stg!4v1753272772713!5m2!1sfr!2stg"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Localisation Adawi - Carrefour Bodjona, Lomé, Togo"
                        className="w-full h-full"
                    />
                </div>
            </section>

            <Footer />
        </div>
    );
}
