import { useEffect, useState } from "react";

interface Promotion {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  status: string;
}

export function usePromotion() {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await fetch('/api/promotions/active', {
          credentials: 'include' // Include cookies for session-based auth
        });

        if (response.ok) {
          const promotionData = await response.json();
          if (promotionData.is_active) {
            setPromotion(promotionData);
          } else {
            setPromotion(null);
          }
        } else if (response.status === 401) {
          // Not authenticated or no active promotion
          setPromotion(null);
        } else {
          setError('Erreur lors de la récupération de la promotion');
        }
      } catch (err) {
        setError('Erreur réseau');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, []);

  return { promotion, loading, error };
}
