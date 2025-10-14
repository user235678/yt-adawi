import type { MetaFunction } from "@remix-run/node";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import {
    Phone,
  Truck,
  Clock,
  MapPin,
  Package,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Livraison - Adawi" },
    { name: "description", content: "Découvrez nos options de livraison : délais, tarifs et zones couvertes. Livraison rapide et sécurisée partout au Togo et à l'international." },
  ];
};

interface TrackingStep {
  status: string;
  label: string;
  reached: boolean;
  date: string | null;
}

interface TrackingHistory {
  status: string;
  changed_at: string;
  comment: string;
}

interface TrackingResponse {
  order_id: string;
  current_status: string;
  steps: TrackingStep[];
  history: TrackingHistory[];
}

interface ActionData {
  trackingData?: TrackingResponse;
  error?: string;
}

import { readToken } from "~/utils/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const orderId = formData.get("orderId") as string;

  if (!orderId || !orderId.trim()) {
    return json<ActionData>({
      error: "Veuillez saisir un ID de commande"
    }, { status: 400 });
  }

  try {
    // Récupérer le token pour l'action
    const token = await readToken(request);

    if (!token) {
      return json<ActionData>({
        error: "Non authentifié"
      }, { status: 401 });
    }

    const response = await fetch(
      `https://showroom-backend-2x3g.onrender.com/orders/${orderId.trim()}/tracking`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      return json<ActionData>({
        error: `Erreur ${response.status}: ${response.statusText}`
      }, { status: response.status });
    }

    const trackingData: TrackingResponse = await response.json();
    return json<ActionData>({ trackingData });

  } catch (error) {
    return json<ActionData>({
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    }, { status: 500 });
  }
}

function getStatusIcon(status: string, reached: boolean) {
  if (!reached) return <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;

  switch (status) {
    case 'en_cours':
      return <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />;
    case 'expediee':
      return <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />;
    case 'livree':
      return <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />;
    default:
      return <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'En attente';
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case 'en_cours':
      return 'bg-blue-100 text-blue-800';
    case 'en_preparation':
      return 'bg-blue-100 text-blue-800';
    case 'expediee':
      return 'bg-orange-100 text-orange-800';
    case 'livree':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function Livraison() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const deliveryZones = [
    {
      zone: "Lomé Centre",
      delay: "24h",
      price: "Gratuite",
      description: "Livraison express dans la journée",
      icon: "🏢",
      color: "bg-green-100 text-green-800"
    },
    {
      zone: "Grand Lomé",
      delay: "2-3 jours",
      price: "2 000 F CFA",
      description: "Banlieue de Lomé et environs",
      icon: "🏘️",
      color: "bg-blue-100 text-blue-800"
    },
    {
      zone: "Togo (Intérieur)",
      delay: "3-5 jours",
      price: "5 000 F CFA",
      description: "Toutes les régions du Togo",
      icon: "🗺️",
      color: "bg-adawi-gold/20 text-adawi-brown"
    },
    {
      zone: "International",
      delay: "7-15 jours",
      price: "Sur devis",
      description: "Afrique de l'Ouest et Europe",
      icon: "🌍",
      color: "bg-purple-100 text-purple-800"
    }
  ];

  const deliveryOptions = [
    {
      title: "Livraison Standard",
      description: "Notre option de livraison classique",
      features: [
        "Suivi de commande inclus",
        "Assurance colis",
        "Livraison en point relais ou à domicile",
        "Paiement à la livraison disponible"
      ],
      icon: "📦"
    },
    {
      title: "Livraison Express",
      description: "Pour recevoir vos articles rapidement",
      features: [
        "Livraison sous 24h à Lomé",
        "Suivi en temps réel",
        "Assurance premium",
        "Créneau de livraison au choix"
      ],
      icon: "⚡"
    },
    {
      title: "Retrait en Boutique",
      description: "Récupérez vos achats directement",
      features: [
        "Gratuit et immédiat",
        "Essayage sur place",
        "Conseil personnalisé",
        "Échange facile si besoin"
      ],
      icon: "🏪"
    }
  ];

  const faqItems = [
    {
      id: 'faq1',
      question: "Comment puis-je suivre ma commande ?",
      answer: "Dès l'expédition de votre commande, vous recevrez un email avec un numéro de suivi. Vous pouvez également suivre votre commande directement sur notre site dans la section 'Mon Compte' ou en utilisant notre page de suivi dédiée."
    },
    {
      id: 'faq2',
      question: "Que faire si je ne suis pas présent lors de la livraison ?",
      answer: "Notre livreur tentera une nouvelle livraison le lendemain. Après 3 tentatives, votre colis sera disponible en point relais pendant 15 jours. Vous recevrez un SMS avec toutes les informations nécessaires."
    },
    {
      id: 'faq3',
      question: "Puis-je modifier l'adresse de livraison après commande ?",
      answer: "Vous pouvez modifier l'adresse de livraison dans les 2 heures suivant votre commande en nous contactant. Passé ce délai, la modification ne sera plus possible si le colis est déjà en préparation."
    },
    {
      id: 'faq4',
      question: "Livrez-vous le weekend ?",
      answer: "Oui, nous livrons le samedi à Lomé pour les commandes express. Les livraisons standard se font du lundi au vendredi. Aucune livraison n'est effectuée le dimanche et les jours fériés."
    },
    {
      id: 'faq5',
      question: "Comment fonctionne le paiement à la livraison ?",
      answer: "Le paiement à la livraison est disponible pour les commandes au Togo. Vous payez en espèces ou par mobile money directement au livreur. Des frais supplémentaires de 1 000 F CFA s'appliquent pour ce service."
    },
    {
      id: 'faq6',
      question: "Que faire si mon colis est endommagé ?",
      answer: "Vérifiez votre colis en présence du livreur. En cas de dommage, refusez la livraison et contactez-nous immédiatement. Nous organiserons un remplacement ou un remboursement dans les plus brefs délais."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className="bg-gradient-to-br from-adawi-beige via-white to-adawi-beige-dark">
        {/* Hero Section */}
        <section className="bg-adawi-beige py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-adawi-gold rounded-full mb-6">
              <Truck className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-adawi-brown mb-4 tracking-tight">
              Livraison
            </h1>
            <p className="text-xl text-black max-w-2xl mx-auto leading-relaxed">
              Découvrez nos options de livraison rapide et sécurisée. Nous livrons partout au Togo et à l'international avec un service de qualité.
            </p>
          </div>
        </section>

        {/* Zones de Livraison */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Zones de Livraison
              </h2>
              <p className="text-xl text-black">
                Délais et tarifs selon votre localisation
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {deliveryZones.map((zone, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-adawi-gold/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
                  <div className="text-3xl mb-4">{zone.icon}</div>
                  <h3 className="text-lg font-semibold text-adawi-brown mb-2">
                    {zone.zone}
                  </h3>
                  <p className="text-sm text-black mb-4">
                    {zone.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 text-adawi-gold mr-2" />
                      <span className="text-sm font-medium text-black">{zone.delay}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-adawi-gold mr-2" />
                      <span className="text-sm font-medium text-black">{zone.price}</span>
                    </div>
                  </div>
                  
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${zone.color}`}>
                    Disponible
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Options de Livraison */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Options de Livraison
              </h2>
              <p className="text-xl text-black">
                Choisissez l'option qui vous convient le mieux
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {deliveryOptions.map((option, index) => (
                <div key={index} className="bg-adawi-beige/30 rounded-2xl p-8 hover:bg-adawi-beige/50 transition-all duration-300">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">{option.icon}</div>
                    <h3 className="text-xl font-semibold text-adawi-brown mb-2">{option.title}</h3>
                    <p className="text-black">{option.description}</p>
                  </div>
                  
                  <ul className="space-y-3">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-adawi-gold mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-black">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Processus de Livraison */}
        <section className="py-16 px-4 sm:px-6 bg-adawi-beige/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-xl text-black">
                Le processus de livraison en 4 étapes simples
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold rounded-full mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">Commande</h3>
                <p className="text-sm text-black">Passez votre commande en ligne et choisissez votre mode de livraison</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold rounded-full mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">Préparation</h3>
                <p className="text-sm text-black">Nous préparons soigneusement votre commande dans nos entrepôts</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold rounded-full mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">Expédition</h3>
                <p className="text-sm text-black">Votre colis est expédié avec un numéro de suivi</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-adawi-gold rounded-full mb-4">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <h3 className="text-lg font-semibold text-adawi-brown mb-2">Réception</h3>
                <p className="text-sm text-black">Recevez votre commande à l'adresse indiquée</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Questions Fréquentes
              </h2>
              <p className="text-xl text-black">
                Tout ce que vous devez savoir sur nos livraisons
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item) => (
                <div key={item.id} className="bg-adawi-beige/20 rounded-2xl shadow-lg border border-adawi-gold/20 overflow-hidden">
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-adawi-beige/30 transition-colors duration-200"
                  >
                    <h3 className="text-lg font-semibold text-adawi-brown pr-4">
                      {item.question}
                    </h3>
                    <svg 
                      className={`w-5 h-5 text-adawi-brown transition-transform duration-200 flex-shrink-0 ${
                        activeSection === item.id ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {activeSection === item.id && (
                    <div className="px-8 pb-6 border-t border-adawi-gold/10">
                      <p className="text-black mt-4 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Suivi de Commande CTA */}
        <section className="py-16 px-4 sm:px-6 bg-adawi-beige/30">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-adawi-gold/20">
              <Package className="w-16 h-16 text-adawi-gold mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-adawi-brown mb-4">
                Suivez votre Commande
              </h2>
              <p className="text-xl text-black mb-8 max-w-2xl mx-auto">
                Entrez votre numéro de commande pour connaître le statut de votre livraison en temps réel
              </p>

              {/* Erreur de l'action */}
              {actionData?.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-red-700 text-sm">{actionData.error}</span>
                </div>
              )}

              <Form method="post" className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <div className="flex-1">
                    <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                      ID de Commande
                    </label>
                    <input
                      type="text"
                      id="orderId"
                      name="orderId"
                      placeholder="Ex: CMD-123456"
                      className="w-full px-4 py-3 border-2 border-adawi-gold/30 rounded-full focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent bg-white text-adawi-brown placeholder-black/25"
                      required
                    />
                  </div>
                  <div className="sm:pt-7">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 bg-adawi-gold text-white rounded-full font-semibold hover:bg-adawi-brown disabled:bg-adawi-brown-light disabled:cursor-not-allowed transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Recherche...
                        </>
                      ) : (
                        'Suivre'
                      )}
                    </button>
                  </div>
                </div>
              </Form>

              {/* Résultats du tracking */}
              {actionData?.trackingData && (
                <div className="space-y-6">

                  {/* En-tête de commande */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-adawi-gold/20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-adawi-brown truncate">
                          Commande #{actionData.trackingData?.order_id}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Statut mis à jour en temps réel
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(actionData.trackingData?.current_status || '')}`}>
                          <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></div>
                          {actionData.trackingData?.current_status === 'en_cours' ? 'En cours' :
                            actionData.trackingData?.current_status === 'expediee' ? 'Expédiée' :
                              actionData.trackingData?.current_status === 'livree' ? 'Livrée' : actionData.trackingData?.current_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Étapes de suivi */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-adawi-gold/20">
                    <h4 className="text-lg font-semibold text-adawi-brown mb-6 flex items-center">
                      <Package className="w-5 h-5 mr-2 text-adawi-gold" />
                      Progression de la commande
                    </h4>

                    <div className="space-y-4">
                      {actionData.trackingData?.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(step.status, step.reached)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <h5 className={`font-medium text-sm sm:text-base ${step.reached ? 'text-gray-900' : 'text-gray-500'}`}>
                                {step.label}
                              </h5>
                              <span className={`text-xs sm:text-sm flex-shrink-0 ${step.reached ? 'text-gray-600' : 'text-gray-400'}`}>
                                {formatDate(step.date)}
                              </span>
                            </div>
                            {index < (actionData.trackingData?.steps.length || 0) - 1 && (
                              <div className={`w-px h-4 mt-2 ml-2.5 ${step.reached ? 'bg-gray-300' : 'bg-gray-200'}`} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historique */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-adawi-gold/20">
                    <h4 className="text-lg font-semibold text-adawi-brown mb-6 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-adawi-gold" />
                      Historique détaillé
                    </h4>

                    <div className="space-y-3">
                      {actionData.trackingData?.history && actionData.trackingData.history.length > 0 ? (
                        actionData.trackingData.history.map((entry, index) => (
                          <div key={index} className="border-l-4 border-adawi-gold/30 pl-4 py-3 bg-white/50 rounded-r-lg">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                  {entry.comment}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                  Statut: {entry.status === 'en_cours' ? 'En cours' :
                                    entry.status === 'expediee' ? 'Expédiée' :
                                      entry.status === 'livree' ? 'Livrée' : entry.status}
                                </p>
                              </div>
                              <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                                {formatDate(entry.changed_at)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">Aucun historique disponible pour le moment</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="bg-gradient-to-r from-adawi-beige to-adawi-beige-dark rounded-xl p-6 border border-adawi-gold/20">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-adawi-gold rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-adawi-brown text-base mb-2">
                          Besoin d'aide ?
                        </h4>
                        <p className="text-sm text-gray-700 mb-4">
                          Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <a
                            href="/support"
                            className="px-4 py-2 bg-adawi-gold text-white text-center rounded-lg text-sm font-medium hover:bg-adawi-brown transition-colors"
                          >
                            Contacter le support
                          </a>
                          <a
                            href="/livraison"
                            className="px-4 py-2 bg-adawi-gold text-white text-center rounded-lg text-sm font-medium hover:bg-adawi-brown transition-colors"
                          >
                            FAQ Livraison
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact et Support */}
        <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-adawi-gold to-adawi-brown">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Besoin d'Aide avec votre Livraison ?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Notre équipe support est disponible pour répondre à toutes vos questions sur la livraison
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <Phone className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Téléphone</h3>
                <p className="text-white/90">+228 90 00 00 00</p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <MapPin className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Adresse</h3>
                <p className="text-white/90">Carrefour Bodiona, Lomé</p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <Shield className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Sécurisé</h3>
                <p className="text-white/90">Livraison assurée</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/support"
                className="bg-white text-adawi-brown px-8 py-4 rounded-full font-semibold hover:bg-adawi-beige transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Contacter le Support
              </a>
              
             
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
