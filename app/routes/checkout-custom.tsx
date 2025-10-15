import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import CompactHeader from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import TopBanner from "~/components/TopBanner";
import { ArrowLeft, Calendar, Ruler, Package, CreditCard, Camera, MapPin } from "lucide-react";

export const meta: MetaFunction = () => [
  { title: "Commande sur mesure - Adawi" },
  { name: "description", content: "Commandez un vêtement sur mesure" },
];

export const loader: LoaderFunction = async ({ request }) => {
  const token = await readToken(request);
  if (!token) {
    return redirect("/login");
  }

  let authToken = "";
  if (typeof token === "string") {
    try {
      const parsed = JSON.parse(token);
      authToken = parsed?.access_token || token;
    } catch {
      authToken = token;
    }
  } else {
    authToken = token as string;
  }

  try {
    const res = await fetch(`${API_BASE}/profile/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      return json({ profile: null });
    }

    const profile = await res.json();
    return json({ profile });
  } catch (error) {
    return json({ profile: null });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const token = await readToken(request);
  if (!token) {
    return redirect("/login");
  }

  let authToken = "";
  if (typeof token === "string") {
    try {
      const parsed = JSON.parse(token);
      authToken = parsed?.access_token || token;
    } catch {
      authToken = token;
    }
  } else {
    authToken = token as string;
  }

  const formData = await request.formData();

  const phone_number = formData.get("phone_number") as string;
  const network = formData.get("network") as string;
  const description = formData.get("description") as string;
  const current_size = formData.get("current_size") as string;
  const delivery_type = formData.get("delivery_type") as string;
  const delivery_date = formData.get("delivery_date") as string;

  const measurements = {
    height: parseFloat(formData.get("height") as string) || 0,
    weight: parseFloat(formData.get("weight") as string) || 0,
    shoulder_width: parseFloat(formData.get("shoulder_width") as string) || 0,
    chest: parseFloat(formData.get("chest") as string) || 0,
    waist_length: parseFloat(formData.get("waist_length") as string) || 0,
    ventral_circumference: parseFloat(formData.get("ventral_circumference") as string) || 0,
    hips: parseFloat(formData.get("hips") as string) || 0,
    corsage_length: parseFloat(formData.get("corsage_length") as string) || 0,
    belt: parseFloat(formData.get("belt") as string) || 0,
    skirt_length: parseFloat(formData.get("skirt_length") as string) || 0,
    dress_length: parseFloat(formData.get("dress_length") as string) || 0,
    sleeve_length: parseFloat(formData.get("sleeve_length") as string) || 0,
    sleeve_circumference: parseFloat(formData.get("sleeve_circumference") as string) || 0,
    pants_length: parseFloat(formData.get("pants_length") as string) || 0,
    short_dress_length: parseFloat(formData.get("short_dress_length") as string) || 0,
    thigh_circumference: parseFloat(formData.get("thigh_circumference") as string) || 0,
    knee_length: parseFloat(formData.get("knee_length") as string) || 0,
    knee_circumference: parseFloat(formData.get("knee_circumference") as string) || 0,
    bottom: parseFloat(formData.get("bottom") as string) || 0,
    inseam: parseFloat(formData.get("inseam") as string) || 0,
    other_measurements: formData.get("other_measurements") as string || "",
  };

  let address: any = null;
  if (delivery_type === "delivery") {
    address = {
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      postal_code: formData.get("postal_code") as string,
      country: formData.get("country") as string,
      phone: formData.get("phone") as string,
    };
  }

  if (!phone_number || !network || !description || !current_size || !delivery_type || !delivery_date) {
    return json({ error: "Tous les champs requis doivent être remplis" }, { status: 400 });
  }

  const phoneRegex = /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/;
  if (!phoneRegex.test(phone_number)) {
    return json({ error: "Format de numéro de téléphone invalide" }, { status: 400 });
  }

  if (delivery_type === "delivery" && (!address.street || !address.city || !address.postal_code || !address.country || !address.phone)) {
    return json({ error: "Adresse complète requise pour la livraison" }, { status: 400 });
  }

  try {
    const submitData = new FormData();
    submitData.append("description", description);
    submitData.append("measurements", JSON.stringify(measurements));
    submitData.append("current_size", current_size);
    submitData.append("delivery_type", delivery_type);
    submitData.append("delivery_date", delivery_date);

    if (address) {
      submitData.append("address", JSON.stringify(address));
    }

    const photos = formData.getAll("photos") as File[];
    photos.forEach((photo) => {
      if (photo.size > 0) {
        submitData.append("photos", photo);
      }
    });

    const url = new URL(`${API_BASE}/orders/checkout-custom`);
    url.searchParams.append("phone_number", phone_number);
    url.searchParams.append("network", network);

    const res = await fetch(url.toString(), {
      method: "POST",
      body: submitData,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = "Erreur lors de la création de la commande";

      try {
        const data = JSON.parse(errorText);
        if (data.detail && Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => err.msg).join(', ');
        } else {
          errorMessage = data.detail || data.message || errorText;
        }
      } catch {
        errorMessage = errorText;
      }

      return json({ error: errorMessage }, { status: res.status });
    }

    const data = await res.json();

    if (data.payment_url) {
      return redirect(data.payment_url);
    }

    return json({ success: true, order: data.order });

  } catch (error: any) {
    return json({ error: `Erreur: ${error.message}` }, { status: 500 });
  }
};

export default function CheckoutCustomPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { profile } = useLoaderData<typeof loader>();

  const [deliveryType, setDeliveryType] = useState("pickup");
  const [phoneNumber, setPhoneNumber] = useState(profile?.address?.phone || "");
  const [deliveryPhone, setDeliveryPhone] = useState(profile?.address?.phone || "");
  const [photos, setPhotos] = useState<File[]>([]);

  const measurementLabels: Record<string, string> = {
    height: "Taille", weight: "Poids", shoulder_width: "Largeur d'épaules",
    chest: "Tour de poitrine", waist_length: "Longueur de taille",
    ventral_circumference: "Tour de ventre", hips: "Tour de hanches",
    corsage_length: "Longueur de corsage", belt: "Tour de ceinture",
    skirt_length: "Longueur de jupe", dress_length: "Longueur de robe",
    sleeve_length: "Longueur de manche", sleeve_circumference: "Tour de manche",
    pants_length: "Longueur de pantalon", short_dress_length: "Longueur de robe courte",
    thigh_circumference: "Tour de cuisse", knee_length: "Longueur de genou",
    knee_circumference: "Tour de genou", bottom: "Bas", inseam: "Entrejambe",
    other_measurements: "Autres mesures",
  };

  const [measurements, setMeasurements] = useState({
    height: profile?.measurements?.height,
    weight: profile?.measurements?.weight,
    shoulder_width: profile?.measurements?.shoulder_width,
    chest: profile?.measurements?.chest,
    waist_length: profile?.measurements?.waist_length,
    ventral_circumference: profile?.measurements?.ventral_circumference,
    hips: profile?.measurements?.hips,
    corsage_length: profile?.measurements?.corsage_length,
    belt: profile?.measurements?.belt,
    skirt_length: profile?.measurements?.skirt_length,
    dress_length: profile?.measurements?.dress_length,
    sleeve_length: profile?.measurements?.sleeve_length,
    sleeve_circumference: profile?.measurements?.sleeve_circumference,
    pants_length: profile?.measurements?.pants_length,
    short_dress_length: profile?.measurements?.short_dress_length,
    thigh_circumference: profile?.measurements?.thigh_circumference,
    knee_length: profile?.measurements?.knee_length,
    knee_circumference: profile?.measurements?.knee_circumference,
    bottom: profile?.measurements?.bottom,
    inseam: profile?.measurements?.inseam,
    other_measurements: profile?.measurements?.other_measurements || "",
  });

  const [description, setDescription] = useState("");
  const [currentSize, setCurrentSize] = useState(profile?.size || "");
  const [address, setAddress] = useState({
    street: profile?.address?.street || "",
    city: profile?.address?.city || "",
    postal_code: profile?.address?.postal_code || "",
    country: profile?.address?.country || "Togo",
    phone: profile?.address?.phone || "",
  });

  const isSubmitting = navigation.state === "submitting";

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) setPhoneNumber(value);
  };

  const handleDeliveryPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) {
      setDeliveryPhone(value);
      setAddress((prev) => ({ ...prev, phone: value }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);
  };

  const isValidPhone = (phone: string) => /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/.test(phone);

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeasurements((prev) => ({
      ...prev,
      [name]: name === "other_measurements" ? value : parseFloat(value) || 0,
    }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleCurrentSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentSize(e.target.value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliveryTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeliveryType(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TopBanner />
      <CompactHeader />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec boutons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Link
            to="/boutique"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-adawi-brown transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour à la boutique</span>
          </Link>
          
          <Link
            to="/client/appointments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-adawi-brown text-adawi-brown rounded-xl hover:bg-adawi-brown hover:text-white transition-all shadow-sm hover:shadow-md"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">Prendre rendez-vous</span>
          </Link>
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-adawi-brown to-adawi-brown/90 text-white p-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Commande sur mesure</h1>
            <p className="text-white/90">Créez le vêtement de vos rêves, parfaitement adapté à vos mesures</p>
          </div>

          {/* Messages d'erreur/succès */}
          <div className="p-6">
            {actionData?.error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-lg mb-6 flex items-start gap-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold mb-1">Erreur</p>
                  <p>{actionData.error}</p>
                </div>
              </div>
            )}

            {actionData?.success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-lg mb-6 flex items-start gap-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold mb-1">Succès !</p>
                  <p>Commande créée avec succès! ID: {actionData.order?.id}</p>
                </div>
              </div>
            )}

            <Form method="post" encType="multipart/form-data" className="space-y-8">
              {/* Description */}
              <section className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-6 h-6 text-adawi-brown" />
                  <h2 className="text-xl font-bold text-gray-900">Description du vêtement</h2>
                </div>
                <textarea
                  name="description"
                  placeholder="Décrivez en détail le vêtement que vous souhaitez (style, couleur, tissu, détails spécifiques, etc.)"
                  rows={5}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all resize-none"
                  required
                  value={description}
                  onChange={handleDescriptionChange}
                />
              </section>

              {/* Taille actuelle */}
              <section className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Ruler className="w-6 h-6 text-adawi-brown" />
                  <h2 className="text-xl font-bold text-gray-900">Votre taille actuelle</h2>
                </div>
                <select
                  name="current_size"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all text-lg"
                  required
                  value={currentSize}
                  onChange={handleCurrentSizeChange}
                >
                  <option value="">Sélectionnez votre taille</option>
                  <option value="XS">XS - Très petit</option>
                  <option value="S">S - Petit</option>
                  <option value="M">M - Moyen</option>
                  <option value="L">L - Large</option>
                  <option value="XL">XL - Très large</option>
                  <option value="XXL">XXL - Extra large</option>
                </select>
              </section>

              {/* Mesures */}
              <section className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Ruler className="w-6 h-6 text-adawi-brown" />
                  <h2 className="text-xl font-bold text-gray-900">Vos mesures (en cm)</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(measurements).map(([key, value]) => {
                    if (key === "other_measurements") {
                      return (
                        <div key={key} className="sm:col-span-2 lg:col-span-3">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {measurementLabels[key]}
                          </label>
                          <textarea
                            name={key}
                            placeholder="Précisez toute autre mesure importante (tour de bras, longueur spécifique, etc.)"
                            rows={3}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all resize-none"
                            value={value as string}
                            onChange={handleMeasurementChange}
                          />
                        </div>
                      );
                    }
                    return (
                      <div key={key}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {measurementLabels[key]}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name={key}
                            step="0.1"
                            placeholder="0"
                            className="w-full p-3 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all"
                            value={value as number}
                            onChange={handleMeasurementChange}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Livraison */}
              <section className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-adawi-brown" />
                  <h2 className="text-xl font-bold text-gray-900">Options de livraison</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type de livraison</label>
                    <select
                      name="delivery_type"
                      value={deliveryType}
                      onChange={handleDeliveryTypeChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all text-lg"
                      required
                    >
                      <option value="pickup">🏪 Retrait en boutique (Gratuit)</option>
                      <option value="delivery">🚚 Livraison à domicile</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date de livraison souhaitée</label>
                    <input
                      type="date"
                      name="delivery_date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all"
                      required
                    />
                  </div>

                  {deliveryType === "delivery" && (
                    <div className="mt-6 p-6 bg-white rounded-xl border-2 border-gray-200 space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">📍 Adresse de livraison</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Rue / Adresse complète</label>
                          <input
                            name="street"
                            type="text"
                            placeholder="123 Rue de la République, Quartier..."
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all"
                            required
                            value={address.street}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
                          <input
                            name="city"
                            type="text"
                            placeholder="Lomé"
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all"
                            required
                            value={address.city}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Code Postal</label>
                          <input
                            name="postal_code"
                            type="text"
                            placeholder="BP 1234"
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all"
                            required
                            value={address.postal_code}
                            onChange={handleAddressChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Pays</label>
                          <input
                            name="country"
                            type="text"
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all"
                            required
                            value={address.country}
                            onChange={handleAddressChange}
                            placeholder="Togo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone de contact</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="text-gray-500 font-medium">+228</span>
                            </div>
                            <input
                              type="text"
                              name="phone"
                              value={deliveryPhone}
                              onChange={handleDeliveryPhoneChange}
                              placeholder="70123456"
                              required
                              className={`w-full pl-16 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-adawi-brown transition-all ${
                                deliveryPhone && !isValidPhone(deliveryPhone)
                                  ? 'border-red-300 bg-red-50 focus:border-red-400'
                                  : 'border-gray-200 focus:border-adawi-brown'
                              }`}
                            />
                          </div>
                          {deliveryPhone && !isValidPhone(deliveryPhone) && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Format invalide
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Photos */}
              <section className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="w-6 h-6 text-adawi-brown" />
                  <h2 className="text-xl font-bold text-gray-900">Photos de référence</h2>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Téléchargez des photos du modèle souhaité ou des détails importants
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="photos"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-adawi-brown file:text-white file:font-semibold hover:file:bg-adawi-brown/90 cursor-pointer"
                    />
                  </div>
                  {photos.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{photos.length} photo(s) sélectionnée(s)</span>
                    </div>
                  )}
                </div>
              </section>

             {/* Paiement */}
              <section className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-adawi-brown" />
                  <h2 className="text-xl font-bold text-gray-900">Informations de paiement</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro de téléphone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium">+228</span>
                      </div>
                      <input
                        type="text"
                        name="phone_number"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="70123456"
                        required
                        className={`w-full pl-16 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-adawi-brown transition-all ${
                          phoneNumber && !isValidPhone(phoneNumber)
                            ? 'border-red-300 bg-red-50 focus:border-red-400'
                            : 'border-gray-200 focus:border-adawi-brown'
                        }`}
                      />
                    </div>
                    {phoneNumber && !isValidPhone(phoneNumber) && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Format invalide
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Opérateur mobile</label>
                    <select
                      name="network"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-adawi-brown focus:border-adawi-brown transition-all text-lg bg-white"
                      required
                    >
                      <option value="">Sélectionnez votre opérateur</option>
                      <option value="TMONEY">💰 T-money (Togocom)</option>
                      <option value="FLOOZ">💳 Flooz (Moov Africa)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">💡 Info:</span> Vous serez redirigé vers la page de paiement mobile pour finaliser votre commande.
                  </p>
                </div>
              </section>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-adawi-brown to-adawi-brown/90 text-white py-4 px-8 rounded-xl hover:from-adawi-brown/90 hover:to-adawi-brown transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Traitement en cours...</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-6 h-6" />
                      <span>Commander sur mesure</span>
                    </>
                  )}
                </button>
                
                <Link
                  to="/client/appointments"
                  className="sm:w-auto px-8 py-4 bg-white border-2 border-adawi-brown text-adawi-brown rounded-xl hover:bg-adawi-brown hover:text-white transition-all flex items-center justify-center gap-3 text-lg font-bold shadow-md hover:shadow-lg"
                >
                  <Calendar className="w-6 h-6" />
                  <span>Ou prendre RDV</span>
                </Link>
              </div>
            </Form>
          </div>
        </div>

        {/* Info supplémentaire */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-adawi-brown">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-adawi-brown/10 p-3 rounded-lg">
                <Ruler className="w-6 h-6 text-adawi-brown" />
              </div>
              <h3 className="font-bold text-gray-900">Mesures précises</h3>
            </div>
            <p className="text-sm text-gray-600">
              Prenez vos mesures avec un mètre ruban ou venez en boutique pour un service professionnel.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-adawi-brown">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-adawi-brown/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-adawi-brown" />
              </div>
              <h3 className="font-bold text-gray-900">Délai de confection</h3>
            </div>
            <p className="text-sm text-gray-600">
              Comptez entre 7 et 14 jours selon la complexité du vêtement demandé.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-adawi-brown">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-adawi-brown/10 p-3 rounded-lg">
                <Package className="w-6 h-6 text-adawi-brown" />
              </div>
              <h3 className="font-bold text-gray-900">Suivi personnalisé</h3>
            </div>
            <p className="text-sm text-gray-600">
              Recevez des notifications à chaque étape de la confection de votre commande.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}