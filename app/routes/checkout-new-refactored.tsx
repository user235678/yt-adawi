// import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
// import { json, redirect } from "@remix-run/node";
// import { Form, useActionData, useNavigation, useLoaderData } from "@remix-run/react";
// import { useState, useEffect } from "react";
// import { API_BASE } from "~/utils/auth.server";
// import { readToken } from "~/utils/session.server";
// import { useSearchParams } from "react-router-dom";
// import CompactHeader from "~/components/CompactHeader";
// import Footer from "~/components/Footer";
// import TopBanner from "~/components/TopBanner";

// export const meta: MetaFunction = () => [
//   { title: "Checkout - Adawi" },
//   { name: "description", content: "Finaliser votre commande" },
//   { name: "viewport", content: "width=device-width, initial-scale=1.0" },
// ];

// interface LoaderData {
//   cartItems?: any[];
//   cartTotal?: number;
// }

// export const loader: LoaderFunction = async ({ request }) => {
//   return json<LoaderData>({});
// };

// export const action: ActionFunction = async ({ request }) => {
//   const formData = await request.formData();
//   const action = formData.get("_action") as string;

//   const token = await readToken(request);
//   if (!token) {
//     return redirect("/login");
//   }

//   let authToken = "";
//   if (typeof token === "string") {
//     try {
//       const parsed = JSON.parse(token);
//       authToken = parsed?.access_token || token;
//     } catch {
//       authToken = token;
//     }
//   } else {
//     authToken = token as string;
//   }

//   if (action === "checkout") {
//     const street = formData.get("street") as string;
//     const city = formData.get("city") as string;
//     const postal_code = formData.get("postal_code") as string;
//     const country = formData.get("country") as string;
//     const phone = formData.get("phone") as string;
//     const phone_number = formData.get("phone_number") as string;
//     const network = formData.get("network") as string;

//     if (!street || !city || !postal_code || !country || !phone || !phone_number || !network) {
//       return json(
//         { error: "Tous les champs sont requis" },
//         { status: 400 }
//       );
//     }

//     const phoneRegex = /^(70|79|90|91|92|93|96|97|98|99)\d{6}$/;
//     if (!phoneRegex.test(phone_number)) {
//       return json(
//         { error: "Format de numéro de téléphone pour le paiement invalide" },
//         { status: 400 }
//       );
//     }

//     try {
//       console.log("Making checkout request to:", `${API_BASE}/orders/checkout`);
//       console.log("Token:", authToken ? "Present" : "Missing");
//       console.log("Payload:", {
//         address: { street, city, postal_code, country, phone },
//         phone_number,
//         network
//       });

//       const url = new URL(`${API_BASE}/orders/checkout`);
//       url.searchParams.append("phone_number", phone_number);
//       url.searchParams.append("network", network);

//       const res = await fetch(url.toString(), {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${authToken}`,
//         },
//         body: JSON.stringify({
//           street,
//           city,
//           postal_code,
//           country,
//           phone,
//         }),
//       });

//       console.log("Response status:", res.status);
//       console.log("Response ok:", res.ok);

//       if (!res.ok) {
//         const errorText = await res.text();
//         console.error("API Error response:", errorText);

//         let data;
//         let errorMessage = "Une erreur est survenue lors du traitement de la commande";

//         try {
//           data = JSON.parse(errorText);
//           if (res.status === 400) {
//             errorMessage = data.detail || data.message || data.error || "Données invalides";
//           } else if (res.status === 401) {
//             errorMessage = "Session expirée, veuillez vous reconnecter";
//             return redirect("/login");
//           } else if (res.status === 422) {
//             if (data.detail && Array.isArray(data.detail)) {
//               const fieldErrors = data.detail.map((err: any) =>
//                 `${err.loc ? err.loc.join('.') : 'Champ'}: ${err.msg}`
//               ).join(', ');
//               errorMessage = `Erreur de validation: ${fieldErrors}`;
//             } else {
//               errorMessage = "Données de validation incorrectes";
//             }
//           } else if (res.status >= 500) {
//             errorMessage = "Erreur serveur, veuillez réessayer plus tard";
//           }
//         } catch (parseError) {
//           console.error("Error parsing error response:", parseError);
//           errorMessage = `Erreur ${res.status}: ${errorText}`;
//         }

//         return json({ error: errorMessage }, { status: res.status });
//       }

//       const responseText = await res.text();
//       console.log("Response text:", responseText);

//       let data;
//       try {
//         data = JSON.parse(responseText);
//         console.log("Parsed JSON data:", data);

//         if (data.payment_url) {
//           console.log("Redirecting to payment_url:", data.payment_url);
//           console.log("Order created:", data.order);
//           console.log("Payment identifier:", data.identifier);
//           return redirect(data.payment_url);
//         }

//         if (data.order) {
//           return json({
//             success: true,
//             order: data.order,
//             message: "Commande créée avec succès",
