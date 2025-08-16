import { readToken } from "./session.server";

const API_BASE = process.env.API_BASE_URL
  || "https://showroom-backend-2x3g.onrender.com"; // <- ton backend Render

/** Récupère le profil via /auth/me en joignant le JWT du cookie */
export async function getUserProfile(request: Request) {
  const token = await readToken(request);
  if (!token) return null;

  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json();
}

/** Exige un user connecté (sinon null) */
export async function requireUser(request: Request) {
  return getUserProfile(request);
}

/** Expose la base API (utile si besoin ailleurs) */
export { API_BASE };
