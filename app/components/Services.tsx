import { Headphones, CreditCard, Truck, PackageSearch } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: <Headphones className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: "Assistance client",
      subtitle: "24h/24 et 7j/7",
      description: "Notre équipe dédiée vous accompagne à tout moment",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      shadowColor: "shadow-blue-200",
      bgGradient: "from-blue-50 to-blue-100"
    },
    {
      icon: <CreditCard className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: "Paiement sécurisé",
      subtitle: "Transactions cryptées",
      description: "Vos données bancaires sont protégées par SSL",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      shadowColor: "shadow-green-200",
      bgGradient: "from-green-50 to-green-100"
    },
    {
      icon: <Truck className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: "Livraison rapide",
      subtitle: "et gratuite",
      description: "Frais de livraison payé à la réception de la commande",
      color: "from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700",
      shadowColor: "shadow-orange-200",
      bgGradient: "from-orange-50 to-orange-100"
    },
    {
      icon: <PackageSearch className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: "Suivi en temps réel",
      subtitle: "des commandes",
      description: "Suivez votre colis étape par étape",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      shadowColor: "shadow-purple-200",
      bgGradient: "from-purple-50 to-purple-100"
    }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(-5px) rotate(-1deg); }
          }
          
          @keyframes fade-in-scale {
            from {
              opacity: 0;
              transform: scale(0.8) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          
          @keyframes pulse-glow {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
              transform: scale(1);
            }
            50% { 
              box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
              transform: scale(1.05);
            }
          }
          
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-fade-in-scale {
            animation: fade-in-scale 0.6s ease-out both;
          }
          
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          
          .animate-slide-up {
            animation: slide-up 0.5s ease-out both;
          }
          
          .service-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .service-card:hover {
            transform: translateY(-12px) scale(1.03);
          }
          
          .icon-container {
            transition: all 0.3s ease;
          }
          
          
        `
      }} />
      
      <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Éléments décoratifs d'arrière-plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-30 animate-float"></div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-green-100 rounded-full opacity-40 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-orange-100 rounded-full opacity-35 animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute bottom-40 right-1/3 w-16 h-16 bg-purple-100 rounded-full opacity-40 animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* En-tête de section */}
          {/* <div className="text-center mb-16 animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 animate-pulse-glow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
           
          </div> */}

          {/* Grille des services */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="service-card group relative bg-white rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl border border-gray-100 animate-fade-in-scale"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Gradient d'arrière-plan au hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  {/* Container d'icône avec animation */}
                  <div className={`icon-container inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${service.color} ${service.hoverColor} rounded-2xl shadow-lg ${service.shadowColor} mb-6 group-hover:shadow-xl`}>
                    <div className="text-white transform group-hover:scale-110 transition-transform duration-300">
                      {service.icon}
                    </div>
                  </div>

                  {/* Contenu textuel */}
                  <div className="space-y-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                      {service.title}
                    </h3>
                    
                    <p className="text-base font-semibold text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      {service.subtitle}
                    </p>
                    
                    <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Indicateur de hover */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className={`w-3 h-3 bg-gradient-to-r ${service.color} rounded-full animate-pulse`}></div>
                  </div>
                </div>

                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-in-out"></div>
              </div>
            ))}
          </div>

          
        </div>
      </section>
    </>
  );
}