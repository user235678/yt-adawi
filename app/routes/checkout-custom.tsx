import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import CompactHeader from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import TopBanner from "~/components/TopBanner";

export const meta: MetaFunction = () => [
  { title: "Commande sur mesure - Adawi" },
  { name: "description", content: "Commandez un vêtement sur mesure" },
];

export const loader: LoaderFunction = async ({ request }) => {
  const token = await readToken(request);
  if (!token) {
    return redirect("/login");
  }

  // Correction du parsing du token (même logique que dans le code availability)
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

  // Correction du parsing du token (même logique que dans le code availability)
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

  // Measurements
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

  // Address if delivery
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

  // Validation
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
    // Build FormData for multipart
    const submitData = new FormData();
    submitData.append("description", description);
    submitData.append("measurements", JSON.stringify(measurements));
    submitData.append("current_size", current_size);
    submitData.append("delivery_type", delivery_type);
    submitData.append("delivery_date", delivery_date);

    if (address) {
      submitData.append("address", JSON.stringify(address));
    }

    // Add photos
    const photos = formData.getAll("photos") as File[];
    photos.forEach((photo, index) => {
      if (photo.size > 0) {
        submitData.append("photos", photo);
      }
    });

    // Build URL with query params
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

  // Initialize state with profile data or defaults
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [phoneNumber, setPhoneNumber] = useState(profile?.address?.phone || "");
  const [deliveryPhone, setDeliveryPhone] = useState(profile?.address?.phone || "");
  const [photos, setPhotos] = useState<File[]>([]);

  // Measurements state initialized from profile or default 0
  const [measurements, setMeasurements] = useState({
    height: profile?.measurements?.height || 0,
    weight: profile?.measurements?.weight || 0,
    shoulder_width: profile?.measurements?.shoulder_width || 0,
    chest: profile?.measurements?.chest || 0,
    waist_length: profile?.measurements?.waist_length || 0,
    ventral_circumference: profile?.measurements?.ventral_circumference || 0,
    hips: profile?.measurements?.hips || 0,
    corsage_length: profile?.measurements?.corsage_length || 0,
    belt: profile?.measurements?.belt || 0,
    skirt_length: profile?.measurements?.skirt_length || 0,
    dress_length: profile?.measurements?.dress_length || 0,
    sleeve_length: profile?.measurements?.sleeve_length || 0,
    sleeve_circumference: profile?.measurements?.sleeve_circumference || 0,
    pants_length: profile?.measurements?.pants_length || 0,
    short_dress_length: profile?.measurements?.short_dress_length || 0,
    thigh_circumference: profile?.measurements?.thigh_circumference || 0,
    knee_length: profile?.measurements?.knee_length || 0,
    knee_circumference: profile?.measurements?.knee_circumference || 0,
    bottom: profile?.measurements?.bottom || 0,
    inseam: profile?.measurements?.inseam || 0,
    other_measurements: profile?.measurements?.other_measurements || "",
  });

  // Description state (empty, no profile field for it)
  const [description, setDescription] = useState("");

  // Current size state initialized from profile.size or empty
  const [currentSize, setCurrentSize] = useState(profile?.size || "");

  // Address state initialized from profile.address or empty strings
  const [address, setAddress] = useState({
    street: profile?.address?.street || "",
    city: profile?.address?.city || "",
    postal_code: profile?.address?.postal_code || "",
    country: profile?.address?.country || "Togo",
    phone: profile?.address?.phone || "",
  });

  const isSubmitting = navigation.state === "submitting";

  // Handlers for controlled inputs
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 8) {
      setPhoneNumber(value);
    }
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

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/;
    return phoneRegex.test(phone);
  };

  // Handlers for measurements inputs
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMeasurements((prev) => ({
      ...prev,
      [name]: name === "other_measurements" ? value : parseFloat(value) || 0,
    }));
  };

  // Handler for description
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  // Handler for current size
  const handleCurrentSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentSize(e.target.value);
  };

  // Handler for address inputs
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for delivery type select
  const handleDeliveryTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeliveryType(e.target.value);
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <CompactHeader />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-adawi-brown text-center">Commande sur mesure</h1>

        {actionData?.error && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {actionData.error}
          </div>
        )}

        {actionData?.success && (
          <div className="bg-green-100 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            Commande créée avec succès! ID: {actionData.order?.id}
          </div>
        )}

        <Form method="post" encType="multipart/form-data" className="space-y-8">
          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-adawi-brown">Description du vêtement souhaité</h2>
            <textarea
              name="description"
              placeholder="Décrivez le vêtement que vous souhaitez (style, couleur, tissu, etc.)"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
              required
              value={description}
              onChange={handleDescriptionChange}
            />
          </div>

          {/* Taille actuelle */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-adawi-brown">Votre taille actuelle</h2>
            <select
              name="current_size"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
              required
              value={currentSize}
              onChange={handleCurrentSizeChange}
            >
              <option value="">Sélectionnez votre taille</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>

          {/* Mesures */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-adawi-brown">Vos mesures (en cm)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(measurements).map(([key, value]) => {
                if (key === "other_measurements") {
                  return (
                    <div key={key} className="mt-4 col-span-full">
                      <label className="block text-sm font-medium mb-1">Autres mesures</label>
                      <textarea
                        name={key}
                        placeholder="Précisez toute autre mesure importante"
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded"
                        value={value as string}
                        onChange={handleMeasurementChange}
                      />
                    </div>
                  );
                }
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1">{key.replace(/_/g, " ")}</label>
                    <input
                      type="number"
                      name={key}
                      step="0.1"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={value as number}
                      onChange={handleMeasurementChange}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Livraison */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-adawi-brown">Options de livraison</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type de livraison</label>
                <select
                  name="delivery_type"
                  value={deliveryType}
                  onChange={handleDeliveryTypeChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                  required
                >
                  <option value="pickup">Retrait en boutique</option>
                  <option value="delivery">Livraison à domicile</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date de livraison souhaitée</label>
                <input
                  type="date"
                  name="delivery_date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                  required
                />
              </div>

              {deliveryType === "delivery" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Adresse de livraison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Rue / Adresse</label>
                      <input
                        name="street"
                        type="text"
                        placeholder="123 Rue de la République"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                        required
                        value={address.street}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ville</label>
                      <input
                        name="city"
                        type="text"
                        placeholder="Lomé"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                        required
                        value={address.city}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Code Postal</label>
                      <input
                        name="postal_code"
                        type="text"
                        placeholder="BP 1234"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                        required
                        value={address.postal_code}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pays</label>
                      <input
                        name="country"
                        type="text"
                        defaultValue="Togo"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                        required
                        value={address.country}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Téléphone de contact</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">+228</span>
                        </div>
                        <input
                          type="text"
                          name="phone"
                          value={deliveryPhone}
                          onChange={handleDeliveryPhoneChange}
                          placeholder="70123456"
                          required
                          className={`w-full pl-12 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent ${deliveryPhone && !isValidPhone(deliveryPhone)
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                            }`}
                        />
                      </div>
                      {deliveryPhone && !isValidPhone(deliveryPhone) && (
                        <p className="mt-1 text-sm text-red-600">Format invalide</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-adawi-brown">Photos de référence</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Veillez nous faire parvenir votre photo</label>
              <input
                type="file"
                name="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
              />
              {photos.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">{photos.length} photo(s) sélectionnée(s)</p>
              )}
            </div>
          </div>

          {/* Paiement */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-adawi-brown">Informations de paiement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Numéro de téléphone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+228</span>
                  </div>
                  <input
                    type="text"
                    name="phone_number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="70123456"
                    required
                    className={`w-full pl-12 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent ${phoneNumber && !isValidPhone(phoneNumber)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                      }`}
                  />
                </div>
                {phoneNumber && !isValidPhone(phoneNumber) && (
                  <p className="mt-1 text-sm text-red-600">Format invalide</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Opérateur</label>
                <select
                  name="network"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent"
                  required
                >
                  <option value="">Sélectionnez</option>
                  <option value="TMONEY">T-money</option>
                  <option value="FLOOZ">Flooz</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-adawi-brown text-white py-4 px-6 rounded-lg hover:bg-adawi-brown/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
          >
            {isSubmitting ? "Traitement..." : "Commander sur mesure"}
          </button>
        </Form>
      </div>
      <Footer />
    </div>
  );
}
