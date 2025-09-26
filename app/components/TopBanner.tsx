import React from "react";
import { usePromotion } from "../hooks/usePromotion";

const TopBanner: React.FC = () => {
  const { promotion, loading, error } = usePromotion();

  if (loading) {
    return (
      <div className="bg-gray-200 text-red-500 text-center py-2 text-sm overflow-hidden">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  const getMessage = () => {
    if (promotion) {
      const endDate = new Date(promotion.end_date);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysLeft > 1) {
        return `${promotion.description} - Plus que ${daysLeft} jours ! -${promotion.discount_percentage}%`;
      } else if (daysLeft === 1) {
        return `${promotion.description} - Dernière chance ! -${promotion.discount_percentage}%`;
      } else {
        return `${promotion.description} -${promotion.discount_percentage}%`;
      }
    }
    // Fallback message
    return "Bénéficiez de 10% de réduction sur votre première commande";
  };

  const message = getMessage();

  return (
    <div className="bg-gray-200 text-red-500 py-2 text-sm overflow-hidden relative">
      <style >{`
        @keyframes scroll-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .scrolling-text {
animation: scroll-right 25s linear infinite;          white-space: nowrap;
          display: inline-block;
        }
        
        .banner-container {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
      `}</style>

      <div className="banner-container">
        <div className="scrolling-text">
          {message} ••• {message} 
          {/* ••• {message} */}
        </div>
      </div>
    </div>
  );
};

export default TopBanner;