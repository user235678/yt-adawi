// app/routes/register.tsx
import { useState } from "react";
import { Form } from "@remix-run/react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      email: formData.get("email"),
      full_name: formData.get("fJull_name"),
      role: "client", // fixe
      is_banned: false,
      is_active: true,
      is_deleted: false,
      password: formData.get("password"),
    };

    try {
      const res = await fetch("https://showroom-backend-2x3g.onrender.com/docs#/authentication/register_auth_register_post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Inscription échouée");
      }

      setSuccess(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Créer un compte</h1>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Inscription réussie 🎉</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" required />
        <input name="full_name" type="text" placeholder="Nom complet" className="w-full p-2 border rounded" required />
        <input name="password" type="password" placeholder="Mot de passe" className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full bg-black text-white p-2 rounded hover:bg-gray-800">
          S'inscrire
        </button>
      </form>
    </div>
  );
}
