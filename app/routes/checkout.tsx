import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { API_BASE } from "~/utils/auth.server";
import { readToken } from "~/utils/session.server";
import { useSearchParams } from "react-router-dom";

// loader obligatoire même si vide
export const loader: LoaderFunction = async () => {
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const phone_number = formData.get("phone_number") as string;
  const amount = formData.get("amount") as string;
  const network = formData.get("network") as string;

  // Server-side validation
  if (!phone_number || !amount || !network) {
    return json(
      { error: "Tous les champs sont requis" },
      { status: 400 }
    );
  }

  // Validate phone number format (Togo format: 8 digits starting with specific prefixes)
  const phoneRegex = /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/;
  if (!phoneRegex.test(phone_number)) {
    return json(
      { error: "Format de numéro de téléphone invalide" },
      { status: 400 }
    );
  }

  const token = await readToken(request);
  if (!token) {
    return redirect("/login");
  }

  try {
    console.log("Making request to:", `${API_BASE}/paiements/`);
    console.log("Token:", token ? "Present" : "Missing");
    console.log("Payload:", { phone_number, amount: Number(amount), network });

    const res = await fetch(`${API_BASE}/paiements/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        phone_number,
        amount: Number(amount),
        network,
      }),
    });

    console.log("Response status:", res.status);
    console.log("Response ok:", res.ok);

    if (!res.ok) {
      // Lire la réponse d'erreur
      const errorText = await res.text();
      console.error("API Error response:", errorText);
      
      let data;
      let errorMessage = "Une erreur est survenue lors du traitement du paiement";
      
      try {
        data = JSON.parse(errorText);
        if (res.status === 400) {
          errorMessage = data.detail || data.message || data.error || "Données de paiement invalides";
        } else if (res.status === 401) {
          errorMessage = "Session expirée, veuillez vous reconnecter";
          return redirect("/login");
        } else if (res.status === 422) {
          // Handle FastAPI validation errors
          if (data.detail && Array.isArray(data.detail)) {
            const fieldErrors = data.detail.map((err: any) => 
              `${err.loc ? err.loc.join('.') : 'Champ'}: ${err.msg}`
            ).join(', ');
            errorMessage = `Erreur de validation: ${fieldErrors}`;
          } else {
            errorMessage = "Données de validation incorrectes";
          }
        } else if (res.status >= 500) {
          errorMessage = "Erreur serveur, veuillez réessayer plus tard";
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
        errorMessage = `Erreur ${res.status}: ${errorText}`;
      }
      
      return json({ error: errorMessage }, { status: res.status });
    }

    // Succès - Lire la réponse
    const responseText = await res.text();
    console.log("Response text:", responseText);

    // Essayer de parser en JSON d'abord
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed JSON data:", data);
      
      // Si c'est un JSON avec payment_url
      if (data.payment_url) {
        console.log("Redirecting to payment_url:", data.payment_url);
        console.log("Payment identifier:", data.identifier);
        return redirect(data.payment_url);
      }
      
      // Si c'est un JSON avec identifier mais pas payment_url
      if (data.identifier) {
        console.log("JSON response with identifier:", data.identifier);
        return json(
          { error: "URL de paiement manquante dans la réponse JSON" },
          { status: 500 }
        );
      }
    } catch (parseError) {
      console.log("Not JSON, checking if it's a direct URL...");
    }

    // Vérifier si la réponse est directement une URL PayGateGlobal
    if (responseText.includes('paygateglobal.com')) {
      console.log("Direct PayGateGlobal URL detected:", responseText);
      return redirect(responseText.trim());
    }

    // Vérifier si c'est une redirection (status 301, 302, etc.)
    const location = res.headers.get('location');
    if (location) {
      console.log("Redirect location header:", location);
      return redirect(location);
    }

    // Si rien ne marche, essayer de rediriger vers le texte brut s'il ressemble à une URL
    const urlPattern = /^https?:\/\/.+/;
    if (urlPattern.test(responseText.trim())) {
      console.log("Assuming responseText is URL:", responseText.trim());
      return redirect(responseText.trim());
    }

    console.error("Unexpected response format:", responseText);
    return json(
      { error: `Format de réponse inattendu: ${responseText}` },
      { status: 500 }
    );

  } catch (error) {
    console.error("Fetch error:", error);
    
    // Différencier les erreurs de réseau des autres erreurs
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return json(
        { error: "Erreur de connexion au serveur de paiement. Vérifiez votre connexion internet." },
        { status: 500 }
      );
    }
    
    return json(
      { error: `Erreur technique: ${error.message}` },
      { status: 500 }
    );
  }
};

export default function CheckoutPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [network, setNetwork] = useState("");
  
  const total = Number(searchParams.get("total")) || 0;
  const isSubmitting = navigation.state === "submitting";

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 8) {
      setPhoneNumber(value);
    }
  };

  // Validate phone number format
  const isValidPhone = () => {
    const phoneRegex = /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/;
    return phoneRegex.test(phoneNumber);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">Finaliser la commande</h1>
      
      {/* Display total amount */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total à payer:</span>
          <span className="text-xl font-bold text-adawi-brown">
            {total.toLocaleString()} Fcfa
          </span>
        </div>
      </div>

      {/* Error display */}
      {actionData?.error && (
        <div className="bg-red-100 border border-red-200 text-red-700 p-3 rounded mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {actionData.error}
          </div>
        </div>
      )}

      {/* Debug info in development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 p-2 rounded mb-4 text-xs">
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <div className="mt-2">
              <p>API_BASE: {typeof window === 'undefined' ? 'Server-side' : 'Client-side'}</p>
              <p>Total: {total}</p>
              <p>Action Data: {JSON.stringify(actionData, null, 2)}</p>
            </div>
          </details>
        </div>
      )} */}

      <Form method="post" className="space-y-4">
        <input type="hidden" name="amount" value={total} />
        
        {/* Phone number input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Numéro de téléphone
          </label>
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
              className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent ${
                phoneNumber && !isValidPhone() 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            />
          </div>
          {phoneNumber && !isValidPhone() && (
            <p className="mt-1 text-sm text-red-600">
              Format invalide. Ex: 70123456, 91234567
            </p>
          )}
        </div>

        {/* Network selection */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Opérateur de paiement mobile
          </label>
          <select 
            name="network" 
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-adawi-brown focus:border-transparent" 
            required
          >
            <option value="">-- Sélectionnez votre opérateur --</option>
            <option value="t-money">T-money (Togocom)</option>
            <option value="flooz">Flooz (Moov)</option>
          </select>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !isValidPhone() || !network}
          className="w-full bg-adawi-brown text-white py-3 rounded-lg hover:bg-adawi-brown/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Traitement en cours...
            </>
          ) : (
            "Payer maintenant"
          )}
        </button>
      </Form>

      {/* Help text */}
      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">💡 <strong>Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Assurez-vous que votre compte mobile money a suffisamment de solde</li>
          <li>Vous recevrez une notification de paiement sur votre téléphone</li>
          <li>Composez votre code PIN pour confirmer le paiement</li>
        </ul>
      </div>
    </div>
  );
}