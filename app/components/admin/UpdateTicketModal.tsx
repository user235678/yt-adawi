import { useState } from "react";
import { X } from "lucide-react";
import type { Ticket } from "~/routes/admin.support";

interface UpdateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onUpdateTicket: (ticketId: number, updates: Partial<Ticket>) => void;
}

export default function UpdateTicketModal({ isOpen, onClose, ticket, onUpdateTicket }: UpdateTicketModalProps) {
  const [formData, setFormData] = useState({
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    note: ""
  });
  
  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<Ticket> = {
      status: formData.status,
      priority: formData.priority,
      category: formData.category
    };
    
    // Si une note est ajoutée, l'ajouter comme réponse
    if (formData.note.trim()) {
      const newResponse = {
        id: Math.max(0, ...ticket.responses.map(r => r.id)) + 1,
        message: `[Note interne] ${formData.note}`,
        date: new Date().toISOString().split('T')[0],
        isAdmin: true,
        author: "Support Adawi",
        authorAvatar: "https://placehold.co/40x40/DAA520/FFFFFF?text=SA"
      };
      
      updates.responses = [...ticket.responses, newResponse];
    }
    
    onUpdateTicket(ticket.id, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Mettre à jour le ticket #{ticket.ticketNumber}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              >
                <option value="Ouvert">Ouvert</option>
                <option value="En cours">En cours</option>
                <option value="Résolu">Résolu</option>
                <option value="Fermé">Fermé</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              >
                <option value="Basse">Basse</option>
                <option value="Normale">Normale</option>
                <option value="Élevée">Élevée</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none"
              >
                <option value="Livraison">Livraison</option>
                <option value="Remboursement">Remboursement</option>
                <option value="Produit">Produit</option>
                <option value="Technique">Technique</option>
                <option value="Paiement">Paiement</option>
              </select>
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                Note interne (optionnelle)
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                value={formData.note}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent outline-none resize-none"
                placeholder="Ajouter une note interne (visible uniquement par l'équipe)"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-adawi-gold text-white rounded-lg hover:bg-adawi-brown transition-colors"
              >
                Mettre à jour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
