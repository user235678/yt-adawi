import React, { useEffect, useState } from 'react';
import { fetchRefunds, Refund } from '../services/refundService';

interface RefundListProps {
  token?: string; // Token d'authentification
}

const RefundList: React.FC<RefundListProps> = ({ token }) => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadRefunds = async () => {
      if (!token) {
        setError('Token d\'authentification manquant');
        setLoading(false);
        return;
      }

      console.log('🔄 Starting to load refunds...');
      try {
        setError(null);
        const data = await fetchRefunds(token);
        setRefunds(data);
        console.log('✅ Refunds loaded successfully:', data.length, 'items');
      } catch (err) {
        console.error('❌ Error loading refunds:', err);
        const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadRefunds();
  }, [token]);

  const retryLoad = () => {
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }

    setLoading(true);
    setError(null);
    
    const loadRefunds = async () => {
      try {
        const data = await fetchRefunds(token);
        setRefunds(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    loadRefunds();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div>Chargement des remboursements...</div>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('authentification') || error.includes('Token') || error.includes('401') || error.includes('403');
    
    return (
      <div className={`border rounded-lg p-6 ${isAuthError ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
        <div className={`font-semibold mb-2 ${isAuthError ? 'text-orange-800' : 'text-red-800'}`}>
          {isAuthError ? '🔑 Problème d\'authentification' : 'Erreur de chargement'}
        </div>
        
        <div className={`mb-4 ${isAuthError ? 'text-orange-600' : 'text-red-600'}`}>
          {error}
        </div>

        {isAuthError ? (
          <div className="text-sm text-orange-600 bg-orange-100 p-3 rounded mb-4">
            <strong>Solutions possibles :</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Vérifiez que vous êtes bien connecté</li>
              <li>Votre session a peut-être expiré</li>
              <li>Contactez l'administrateur si le problème persiste</li>
            </ul>
          </div>
        ) : (
          <div className="text-sm text-gray-600 mb-4">
            Le serveur était probablement en veille. Réessayez dans quelques secondes.
          </div>
        )}
        
        <button 
          onClick={retryLoad}
          disabled={!token}
          className={`px-4 py-2 rounded text-white font-medium transition-colors ${
            !token 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isAuthError 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {!token ? 'Token manquant' : 'Réessayer'}
        </button>
      </div>
    );
  }

  if (refunds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-lg mb-2">Aucun remboursement trouvé</div>
        <button 
          onClick={retryLoad}
          className="text-blue-600 hover:text-blue-800 underline"
          disabled={!token}
        >
          Actualiser
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Liste des Remboursements ({refunds.length})</h2>
        <button 
          onClick={retryLoad}
          className="text-blue-600 hover:text-blue-800 text-sm underline"
          disabled={!token}
        >
          Actualiser
        </button>
      </div>
      
      <div className="space-y-4">
        {refunds.map(refund => (
          <div key={refund.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">ID</span>
                <div className="text-sm text-gray-900 font-mono">{refund.id}</div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Order ID</span>
                <div className="text-sm text-gray-900 font-mono">{refund.order_id}</div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Status</span>
                <div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    refund.status === 'approved' ? 'bg-green-100 text-green-800' :
                    refund.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    refund.status === 'processed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {refund.status}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Montant</span>
                <div className="text-lg font-semibold text-gray-900">
                  {refund.amount.toLocaleString()} FCFA
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Raison</span>
                <div className="text-sm text-gray-900 capitalize">{refund.reason}</div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">Créé le</span>
                <div className="text-sm text-gray-900">
                  {new Date(refund.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              {refund.comment && (
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-500">Commentaire</span>
                  <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1">
                    {refund.comment}
                  </div>
                </div>
              )}
              
              {refund.admin_comment && (
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-500">Commentaire Admin</span>
                  <div className="text-sm text-gray-900 bg-blue-50 p-3 rounded mt-1">
                    {refund.admin_comment}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RefundList;