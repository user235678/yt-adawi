import { useState } from "react";

export default function Newsletter() {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string[]}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer les erreurs quand l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
    
    // Effacer le message de statut
    if (status) {
      setStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    const newErrors: {[key: string]: string[]} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = ["Le nom est requis"];
    }
    
    if (!formData.email.trim()) {
      newErrors.email = ["L'email est requis"];
    } else {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = ["Format d'email invalide"];
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setStatus("Abonnement en cours...");
    setErrors({});

    try {
      const response = await fetch("https://showroom-backend-2x3g.onrender.com/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStatus("✅ " + (data.message || "Abonnement réussi ! Merci de vous être abonné à notre newsletter."));
        setFormData({ name: "", email: "" });
      } else if (response.status === 422) {
        const errorData = await response.json();
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const fieldErrors: {[key: string]: string[]} = {};
          errorData.detail.forEach((error: any) => {
            if (error.loc && error.loc.length > 1) {
              const field = error.loc[1];
              if (!fieldErrors[field]) fieldErrors[field] = [];
              fieldErrors[field].push(error.msg);
            }
          });
          setErrors(fieldErrors);
          setStatus("❌ Veuillez corriger les erreurs ci-dessous.");
        } else {
          setStatus("❌ Données invalides. Veuillez vérifier vos informations.");
        }
      } else if (response.status === 409) {
        setStatus("❌ Cette adresse email est déjà abonnée à notre newsletter.");
      } else {
        setStatus("❌ Erreur lors de l'abonnement. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur abonnement newsletter:", error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setStatus("❌ Impossible de contacter le serveur. Vérifiez votre connexion internet.");
      } else {
        setStatus("❌ Erreur technique. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-gray-100 px-6 py-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="flex items-center mb-6">
            <svg className="w-8 h-8 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-bold text-black">Abonnez-vous à la newsletter</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
              <div className="md:w-1/3">
                <label htmlFor="newsletter-name" className="block text-sm font-medium text-black mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  id="newsletter-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full border-adawi-gold bg-slate-50 text-black px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold ${
                    errors.name?.length ? 'border-red-500 focus:ring-red-500' : ''
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Votre nom"
                />
                {errors.name?.length > 0 && (
                  <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
                )}
              </div>

              <div className="md:w-1/2">
                <label htmlFor="newsletter-email" className="block text-sm font-medium text-black mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="newsletter-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full bg-slate-50 text-black px-4 py-2 border border-adawi-gold rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold ${
                    errors.email?.length ? 'border-red-500 focus:ring-red-500' : ''
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="votre@email.com"
                />
                {errors.email?.length > 0 && (
                  <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
                )}
              </div>

              <div className="md:w-auto flex-shrink-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-adawi-gold hover:bg-adawi-gold/90 text-white rounded-full font-medium transition-colors flex items-center justify-center h-[42px] w-[42px] shadow-md hover:shadow-lg ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="S'abonner à la newsletter"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-6 h-6 transform rotate-[30deg]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Message de statut */}
            {status && (
              <div className={`text-sm text-center p-3 rounded-lg ${
                status.startsWith('✅') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {status}
              </div>
            )}
          </form>
        </div>

        <div className="w-45 h-45">
          <img
            src="/10.png"
            alt="Vêtements suspendus dans un dressing"
            className="w-3/4 h-1/4 object-cover"
          />
        </div>
      </div>
    </section>
  );
}
