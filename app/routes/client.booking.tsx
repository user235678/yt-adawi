import { useState, useEffect, useMemo } from "react";
import type { MetaFunction, LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import {
    Calendar, Clock, User, CheckCircle, XCircle, Search,
    ChevronLeft, ChevronRight, AlertCircle
} from "lucide-react";
import { readToken } from "~/utils/session.server";
import CompactHeader from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { useBooking } from "~/hooks/useBooking";
import ClientLayout from "~/components/client/ClientLayout";

export const meta: MetaFunction = () => [
    { title: "Réserver un créneau - Adawi" },
    { name: "description", content: "Réservez votre créneau de rendez-vous" },
];

interface TimeSlot {
    date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    is_available: boolean;
    vendor_id: string;
    vendor_name: string;
}

interface LoaderData {
    slots: TimeSlot[];
    token: string;
    error?: string;
    user?: any;
}

// Fonctions de formatage locales
function formatDisplayDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatDisplayTime(timeStr: string): string {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const tokenData = await readToken(request);
        if (!tokenData) {
            return redirect("/login");
        }

        // Correction du parsing du token
        let token = "";
        if (typeof tokenData === "string") {
            try {
                const parsed = JSON.parse(tokenData);
                token = parsed?.access_token || tokenData;
            } catch {
                token = tokenData;
            }
        } else {
            token = tokenData as string;
        }

        // Récupérer les créneaux pour les 30 prochains jours par défaut
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);

        const url = new URL(request.url);
        const startParam = url.searchParams.get("start_date") || startDate.toISOString();
        const endParam = url.searchParams.get("end_date") || endDate.toISOString();

        const slotsUrl = `https://showroom-backend-2x3g.onrender.com/availability/slots?start_date=${encodeURIComponent(startParam)}&end_date=${encodeURIComponent(endParam)}`;

        const res = await fetch(slotsUrl, {
            headers: { Authorization: `Bearer ${token}` },
        });

        let slots: TimeSlot[] = [];
        if (res.ok) {
            slots = await res.json();
        }

        return json<LoaderData>({ slots, token });
    } catch (err: any) {
        console.error("Erreur loader booking:", err);
        return json<LoaderData>({
            slots: [],
            token: "",
            error: err.message || "Erreur serveur"
        });
    }
};

export const action: ActionFunction = async ({ request }) => {
    try {
        const tokenData = await readToken(request);
        if (!tokenData) {
            return json({ error: "Non authentifié", success: false }, { status: 401 });
        }

        let token = "";
        if (typeof tokenData === "string") {
            try {
                const parsed = JSON.parse(tokenData);
                token = parsed?.access_token || tokenData;
            } catch {
                token = tokenData;
            }
        } else {
            token = tokenData as string;
        }

        const formData = await request.formData();
        const action = formData.get("_action");

        if (action === "check_availability") {
            const date = formData.get("date") as string;
            const duration = parseInt(formData.get("duration_minutes") as string || "60");

            const checkUrl = `https://showroom-backend-2x3g.onrender.com/availability/check?date=${encodeURIComponent(date)}&duration_minutes=${duration}`;

            const res = await fetch(checkUrl, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Erreur lors de la vérification: ${JSON.stringify(errorData)}`);
            }

            const result = await res.json();
            return json({ success: true, available: result, message: "Vérification effectuée" });
        }

        if (action === "book_slot") {
            const date = formData.get("date") as string;
            const startTime = formData.get("start_time") as string;
            const endTime = formData.get("end_time") as string;
            const vendorId = formData.get("vendor_id") as string;
            const notes = formData.get("notes") as string;

            // Créer le rendez-vous
            const appointmentData = {
                appointment_date: `${date}T${startTime}:00`,
                end_time: `${date}T${endTime}:00`,
                vendor_id: vendorId,
                notes: notes || "",
                status: "pending"
            };

            const res = await fetch("https://showroom-backend-2x3g.onrender.com/appointments/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(appointmentData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Erreur lors de la réservation: ${JSON.stringify(errorData)}`);
            }

            const appointment = await res.json();
            return json({
                success: true,
                appointment,
                message: "Rendez-vous réservé avec succès!"
            });
        }

        return json({ error: "Action non reconnue", success: false }, { status: 400 });
    } catch (err: any) {
        console.error("Erreur action booking:", err);
        return json({ error: err.message || "Erreur serveur", success: false }, { status: 500 });
    }
};

export default function ClientBooking() {
    const { slots: initialSlots, error } = useLoaderData<LoaderData>();

    // Debug: Afficher les données reçues
    console.log("Loader data - slots:", initialSlots);
    console.log("Loader data - error:", error);

    const {
        selectedSlot,
        isBookingModalOpen,
        searchTerm,
        vendorFilter,
        checkingSlot,
        slotsByDate,
        vendors,
        filteredSlots,
        weekDates,
        handleSlotClick,
        handleCheckAvailability,
        handleBookSlot,
        closeBookingModal,
        goToPreviousWeek,
        goToNextWeek,
        setSearchTerm,
        setVendorFilter,
        isLoading
    } = useBooking(initialSlots);

    // Debug: Afficher les données traitées
    console.log("Hook data - slotsByDate:", slotsByDate);
    console.log("Hook data - vendors:", vendors);
    console.log("Hook data - filteredSlots:", filteredSlots);
    console.log("Hook data - weekDates:", weekDates);

    return (
        <ClientLayout>
            <div className="min-h-screen bg-gradient-to-br from-adawi-beige via-white to-adawi-beige-dark">
                <div className="container mx-auto px-4 py-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <span className="text-red-700">{error}</span>
                        </div>
                    )}

                    {/* Debug Info - À supprimer en production */}
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-bold text-blue-800 mb-2">Debug Info:</h3>
                        <p className="text-blue-700 text-sm">Total slots: {initialSlots?.length || 0}</p>
                        <p className="text-blue-700 text-sm">Filtered slots: {filteredSlots?.length || 0}</p>
                        <p className="text-blue-700 text-sm">Vendors: {vendors?.length || 0}</p>
                        <p className="text-blue-700 text-sm">Week dates: {weekDates?.length || 0}</p>
                        {initialSlots?.length > 0 && (
                            <details className="mt-2">
                                <summary className="text-blue-700 text-sm cursor-pointer">Voir les créneaux bruts</summary>
                                <pre className="text-xs bg-blue-100 p-2 mt-2 rounded overflow-auto max-h-40">
                                    {JSON.stringify(initialSlots.slice(0, 3), null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                            Réserver un créneau
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Choisissez le créneau qui vous convient le mieux pour votre rendez-vous
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par vendeur..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                                />
                            </div>

                            <select
                                value={vendorFilter}
                                onChange={e => setVendorFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                            >
                                <option value="all">Tous les vendeurs</option>
                                {vendors.map(vendor => (
                                    <option key={vendor} value={vendor}>{vendor}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Week Navigation */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={goToPreviousWeek}
                                className="flex items-center px-4 py-2 text-adawi-brown hover:bg-adawi-beige rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 mr-1" />
                                Semaine précédente
                            </button>

                            <h2 className="text-lg font-semibold text-adawi-brown">
                                Semaine du {weekDates[0] ? formatDisplayDate(weekDates[0]) : "Chargement..."}
                            </h2>

                            <button
                                onClick={goToNextWeek}
                                className="flex items-center px-4 py-2 text-adawi-brown hover:bg-adawi-beige rounded-lg transition-colors"
                            >
                                Semaine suivante
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            {weekDates.map(date => {
                                const daySlots = slotsByDate[date] || [];
                                const availableSlots = daySlots.filter(slot => 
                                    slot.is_available && 
                                    (vendorFilter === "all" || slot.vendor_name === vendorFilter) && 
                                    slot.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
                                );

                                return (
                                    <div key={date} className="border border-gray-200 rounded-lg p-4 min-h-[200px]">
                                        <div className="text-center mb-3">
                                            <div className="font-semibold text-adawi-brown">
                                                {formatDisplayDate(date)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {availableSlots.length} créneaux disponibles
                                            </div>
                                            {/* Debug pour chaque jour */}
                                            <div className="text-xs text-red-500">
                                                Total: {daySlots.length}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {availableSlots.slice(0, 3).map((slot, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleSlotClick(slot)}
                                                    className="bg-adawi-beige hover:bg-adawi-gold/20 rounded-lg p-2 cursor-pointer transition-colors text-center text-sm"
                                                >
                                                    <div className="font-medium text-adawi-brown">
                                                        {formatDisplayTime(slot.start_time)} - {formatDisplayTime(slot.end_time)}
                                                    </div>
                                                    <div className="text-xs text-gray-600 truncate">
                                                        {slot.vendor_name}
                                                    </div>
                                                </div>
                                            ))}

                                            {availableSlots.length > 3 && (
                                                <div className="text-center text-xs text-gray-500 pt-1">
                                                    +{availableSlots.length - 3} autres créneaux
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Available Slots List */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-adawi-brown mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            Tous les créneaux disponibles ({filteredSlots.length})
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredSlots.map((slot, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="font-semibold text-adawi-brown">
                                                {formatDisplayDate(slot.date)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {formatDisplayTime(slot.start_time)} - {formatDisplayTime(slot.end_time)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {slot.duration_minutes} minutes
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {slot.is_available ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <User className="w-4 h-4 mr-1" />
                                            {slot.vendor_name}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleCheckAvailability(slot)}
                                            disabled={checkingSlot === `${slot.date}-${slot.start_time}` || isLoading}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                                        >
                                            {checkingSlot === `${slot.date}-${slot.start_time}` ? "Vérification..." : "Vérifier"}
                                        </button>
                                        <button
                                            onClick={() => handleSlotClick(slot)}
                                            className="flex-1 bg-adawi-gold hover:bg-adawi-gold/90 text-black px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Réserver
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredSlots.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Aucun créneau disponible pour les critères sélectionnés</p>
                                {initialSlots.length > 0 && (
                                    <p className="text-sm mt-2">
                                        ({initialSlots.length} créneaux au total dans les données)
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking Modal */}
                {isBookingModalOpen && selectedSlot && (
                    <BookingModal
                        slot={selectedSlot}
                        isOpen={isBookingModalOpen}
                        onClose={closeBookingModal}
                        onSubmit={handleBookSlot}
                        formatTime={formatDisplayTime}
                        formatDate={formatDisplayDate}
                    />
                )}

            </div>
        </ClientLayout>
    );
}

// Modal Component
function BookingModal({
    slot,
    isOpen,
    onClose,
    onSubmit,
    formatTime,
    formatDate
}: {
    slot: TimeSlot;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
    formatTime: (time: string) => string;
    formatDate: (date: string) => string;
}) {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("date", slot.date);
        formData.append("start_time", slot.start_time);
        formData.append("end_time", slot.end_time);
        formData.append("vendor_id", slot.vendor_id);
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-adawi-brown mb-4">
                    Confirmer la réservation
                </h2>

                <div className="bg-adawi-beige rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-adawi-brown mr-2" />
                        <span className="font-semibold">{formatDate(slot.date)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <Clock className="w-5 h-5 text-adawi-brown mr-2" />
                        <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                    </div>
                    <div className="flex items-center">
                        <User className="w-5 h-5 text-adawi-brown mr-2" />
                        <span>{slot.vendor_name}</span>
                    </div>
                </div>

                <Form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (optionnel)
                        </label>
                        <textarea
                            name="notes"
                            rows={3}
                            placeholder="Ajoutez des notes pour votre rendez-vous..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-adawi-gold hover:bg-adawi-gold/90 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Confirmer
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    );
}
