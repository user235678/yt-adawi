import { useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";

type AppointmentStatusUpdaterProps = {
  appointmentId: string;
  currentStatus: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
};

export default function AppointmentStatusUpdater({
  appointmentId,
  currentStatus,
  onSuccess,
  onError,
}: AppointmentStatusUpdaterProps) {
  const fetcher = useFetcher();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = () => {
    if (selectedStatus === currentStatus && !notes.trim()) {
      onError?.("Aucune modification détectée");
      return;
    }

    setIsUpdating(true);
    
    const formData = new FormData();
    formData.append("intent", "updateStatus");
    formData.append("appointmentId", appointmentId);
    formData.append("status", selectedStatus);
    formData.append("notes", notes);
    
    // Spécifier explicitement l'URL de la route
    fetcher.submit(formData, { 
      method: "post",
      action: "/admin/appointments"
    });
  };

  // Gérer les changements d'état du fetcher
  useEffect(() => {
    console.log("Fetcher state:", fetcher.state, "Data:", fetcher.data);
    
    // Arrêter le loading dès que la requête n'est plus en cours
    if (fetcher.state === "idle" && isUpdating) {
      setIsUpdating(false);
      
      if (fetcher.data) {
        if (fetcher.data.success) {
          onSuccess?.(fetcher.data.message || "Mise à jour réussie");
          setNotes(""); // Reset notes after successful update
          // Mettre à jour le statut local pour refléter le changement
          // setSelectedStatus(selectedStatus); // Déjà à jour
        } else if (fetcher.data.error) {
          onError?.(fetcher.data.error);
          // Remettre le statut à sa valeur précédente en cas d'erreur
          setSelectedStatus(currentStatus);
        }
      }
    }
  }, [fetcher.state, fetcher.data, isUpdating, onSuccess, onError, currentStatus]);

  // Gérer les erreurs de réseau ou autres
  useEffect(() => {
    if (fetcher.state === "idle" && isUpdating && !fetcher.data) {
      // Si on est idle mais qu'on n'a pas de data, c'est probablement une erreur
      setIsUpdating(false);
      onError?.("Erreur de connexion. Veuillez réessayer.");
      setSelectedStatus(currentStatus);
    }
  }, [fetcher.state, fetcher.data, isUpdating, onError, currentStatus]);

  // Timeout de sécurité pour éviter que le spinner reste bloqué
  useEffect(() => {
    if (isUpdating) {
      const timeout = setTimeout(() => {
        if (isUpdating) {
          console.warn("Timeout: Arrêt forcé du spinner de mise à jour");
          setIsUpdating(false);
          onError?.("La mise à jour prend trop de temps. Veuillez réessayer.");
          setSelectedStatus(currentStatus);
        }
      }, 10000); // 10 secondes de timeout

      return () => clearTimeout(timeout);
    }
  }, [isUpdating, onError, currentStatus]);

  return (
    <div className="flex gap-1 items-center">
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        disabled={isUpdating || fetcher.state === "submitting"}
        className="border border-gray-300 rounded px-2 py-1 text-sm disabled:opacity-50 min-w-[100px]"
      >
        <option value="en cours">En cours</option>
        <option value="confirmé">Confirmé</option>
        <option value="annulé">Annulé</option>
        <option value="terminé">Terminé</option>
      </select>
      
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes admin"
        disabled={isUpdating || fetcher.state === "submitting"}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-32 disabled:opacity-50"
        maxLength={200}
      />
      
      <button
        onClick={handleSubmit}
        disabled={isUpdating || fetcher.state === "submitting"}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 text-sm min-w-[90px] flex items-center justify-center"
      >
        {(isUpdating || fetcher.state === "submitting") ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
            <span className="text-xs">Mise à jour...</span>
          </>
        ) : (
          "Mettre à jour"
        )}
      </button>
      
      {/* Indicateur de debug (à supprimer en production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 ml-2">
          State: {fetcher.state} | Updating: {isUpdating.toString()}
        </div>
      )}
    </div>
  );
}
