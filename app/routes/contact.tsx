import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { useState } from "react";

export const meta: MetaFunction = () => {
    return [
        { title: "Contact - Adawi" },
        { name: "description", content: "Contactez-nous pour toute question. Nous sommes situés à Carrefour Bodjona." },
    ];
};

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
            <section className="bg-adawi-beige px-6 py-12">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-start md:justify-center gap-8">
                    <div className="w-full md:w-[45%] space-y-6 flex flex-col items-center md:items-start">
                        <h1 className="text-2xl font-bold text-black mb-6 text-center md:text-left">Entrez en contact</h1>
                        <div className="space-y-3 text-black text-center md:text-left">
                            <p className="text-sm">Nous sommes situés à Carrefour Bodjona</p>
                            <p className="text-sm">Adawi10@gmail.com</p>
                            <p className="text-sm">+228 90000000</p>
                        </div>
                        <div className="flex space-x-3 pt-3 justify-center md:justify-start">
                            <a href="#" className="w-8 h-8 bg-black text-white rounded-sm flex items-center justify-center hover:bg-adawi-gold transition-colors duration-300" aria-label="TikTok">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 bg-black text-white rounded-sm flex items-center justify-center hover:bg-adawi-gold transition-colors duration-300" aria-label="Facebook">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 bg-black text-white rounded-sm flex items-center justify-center hover:bg-adawi-gold transition-colors duration-300" aria-label="Instagram">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 bg-black text-white rounded-sm flex items-center justify-center hover:bg-adawi-gold transition-colors duration-300" aria-label="LinkedIn">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="w-full md:w-[45%] space-y-4 flex flex-col items-center">
                        <h2 className="text-xl pl-16 font-bold mb-6 text-black text-center md:text-left w-full">Envoyez nous un message</h2>
                        <form onSubmit={handleSubmit} className="w-4/5 px-2 py-2 "
                        >
                            <div>
                                <label htmlFor="nom" className="block text-xs font-medium text-black mb-1">Nom</label>
                                <input
                                    type="text"
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleInputChange}
                                    className="w-4/5 px-2 py-2 border-2 border-adawi-gold rounded-md focus:outline-none focus:ring-1 focus:ring-adawi-gold focus:border-transparent bg-white text-black text-sm"
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
                                    className="w-4/5 px-2 py-2 border-2 border-adawi-gold rounded-md focus:outline-none focus:ring-1 focus:ring-adawi-gold focus:border-transparent bg-white text-black text-sm"
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
                                    rows={2}
                                    className="w-4/5 px-2 py-2 border-2 border-adawi-gold rounded-md focus:outline-none focus:ring-1 focus:ring-adawi-gold focus:border-transparent bg-white text-black text-sm"
                                    required
                                />
                            </div><br />
                            <div className="flex items-start space-x-2">
                                <input
                                    type="checkbox"
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleInputChange}
                                    className="mt-0.5 w-4 h-4 bg-white border-2 border-adawi-gold rounded text-adawi-gold focus:ring-2 focus:ring-adawi-gold focus:ring-offset-0 checked:bg-adawi-gold checked:border-adawi-gold"
                                    required
                                />
                                <label htmlFor="acceptTerms" className="text-xs text-black">J'accepte tous les termes <br /> et conditions</label>
                            </div>
                            <br />
                            <button
                                type="submit"
                                className="w-4/5 bg-adawi-gold hover:bg-adawi-gold/90 text-white font-medium py-2 px-4 rounded-full transition-colors duration-300 shadow-sm hover:shadow-md text-sm"
                            >
                                Envoyer
                            </button>
                        </form>
                    </div>
                </div>
            </section>
            <section className="bg-white">
                <div className="w-full h-[400px] relative">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3812.0768282401923!2d1.2077794748024113!3d6.125413693861329!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10215f618ff4057f%3A0x283893dcd5d0ac3b!2sInstitut%20africain%20d'informatique%20(IAI-%20Togo)!5e1!3m2!1sfr!2stg!4v1753272772713!5m2!1sfr!2stg" width="100%"
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
