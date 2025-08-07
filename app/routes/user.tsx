// // routes/user.tsx
// import { json, ActionFunction } from "@remix-run/node";
// import { Form } from "@remix-run/react";
// import { connectDb } from "~/utils/db.server";
// import { User } from "~/models/User";

// export const action: ActionFunction = async ({ request }) => {
//   await connectDb();

//   const formData = await request.formData();
//   const email = formData.get("email")?.toString();
//   const password = formData.get("password")?.toString();

//   if (!email || !password) {
//     return json({ error: "Champs requis manquants." }, { status: 400 });
//   }

//   try {
//     await User.create({ email, password }); // non hashé ici
//     return json({ success: true });
//   } catch (error: any) {
//     return json({ error: error.message }, { status: 500 });
//   }
// };

// export default function UserPage() {
//   return (
//     <div className="p-6 max-w-md mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Créer un utilisateur</h1>
//       <Form method="post" className="space-y-4">
//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           className="w-full border px-3 py-2"
//           required
//         />
//         <input
//           name="password"
//           type="password"
//           placeholder="Mot de passe"
//           className="w-full border px-3 py-2"
//           required
//         />
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Enregistrer
//         </button>
//       </Form>
//     </div>
//   );
// }
