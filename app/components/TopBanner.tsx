import React from "react";
import { usePromotion } from "~/hooks/usePromotion";

const TopBanner: React.FC = () => {
  const { promotion, loading } = usePromotion();

  // Debug complet
  console.log("TopBanner - Hook state:", { promotion, loading });

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-center py-2 text-sm overflow-hidden">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  const getMessage = () => {
    console.log("getMessage - promotion:", promotion);
    
    if (promotion) {
      const endDate = new Date(promotion.end_date);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      console.log("Date calculation:", {
        endDate: promotion.end_date,
        endDateParsed: endDate,
        now,
        diffTime,
        daysLeft
      });

      if (daysLeft > 1) {
        return `${promotion.description} - Plus que ${daysLeft} jours ! -${promotion.discount_percentage}%`;
      } else if (daysLeft === 1) {
        return `${promotion.description} - Dernière chance ! -${promotion.discount_percentage}%`;
      } else if (daysLeft === 0) {
        return `${promotion.description} - Dernières heures ! -${promotion.discount_percentage}%`;
      } else {
        // Promotion expirée mais on l'affiche quand même avec indication
        return `${promotion.description} -${promotion.discount_percentage}% (Offre expirée)`;
      }
    }
    
    // Fallback message
    console.log("Using fallback message");
    return "Soyez les bienvenus sur notre boutique ! Nous espérons que vous trouverez votre bonheur parmi notre large gamme de produits.";
  };

  const message = getMessage();

  return (
    <div className="bg-gradient-to-r from-white to-white text-red-600 py-3 text-sm overflow-hidden relative shadow-lg">
      <style>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .scrolling-text {
          animation: scroll-right 85s linear infinite;
          white-space: nowrap;
          display: inline-block;
          padding-left: 100%;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        
        .banner-container {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .banner-container:hover .scrolling-text {
          animation-play-state: paused;
        }
      `}</style>

      <div className="banner-container">
        <div className="scrolling-text">
          {message} ••• {message} ••• {message}
        </div>
      </div>
    </div>
  );
};

export default TopBanner;