import React from "react";

interface HeroProps {
  mainImage?: string;
  secondaryImage?: string;
  title?: string;
  features?: string[];
  buttonText?: string;
}

const Hero: React.FC<HeroProps> = ({ 
  mainImage = "/template/5.png", 
  secondaryImage = "/template/6.png",
  title = ["L'élégance est",<br />, "une attitude.",<br />," Trouvez la",<br />," vôtre ici"],
  features = ["Matériaux durables", "Fabriqué en France", "Livraison rapide"],
  buttonText = "Voir la collection"
}) => {
  return (
    <section className="bg-adawi-beige-dark px-6 py-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between pl-24">
        {/* Left Content */}
        <div className="flex-1 max-w-lg pl-35">
          <h1 className="text-4xl md:text-5xl font-bold  text-black mb-8 leading-tight">
            "{title}"
          </h1>
          
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li key={index} className=" flex items-center text-black">
                <svg className="w-5 h-5 text-black mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <button className="bg-adawi-gold  hover:bg-adawi-gold/300 text-black px-8 py-3 rounded-full font-medium transition-colors">
            {buttonText}
          </button>
        </div>

        {/* Right Images - Redimensionnées */}
        <div className="flex-1 flex justify-end pr-30 pr-36">
          <div className="relative">
            <img 
              src={mainImage}  
              alt="Homme élégant en costume" 
              className="rounded-lg shadow-lg max-w-[280px] w-full h-auto object-cover"
            />
            <img 
              src={secondaryImage}   
              alt="Collection mode" 
              className="absolute -bottom-8 -right-8 rounded-lg shadow-lg max-w-[180px] w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
