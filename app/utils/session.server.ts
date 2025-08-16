import { createCookie } from "@remix-run/node";

/**
 * Cookie qui stocke le JWT (côté serveur uniquement).
 * - HttpOnly: non lisible en JS
 * - secure en prod
 * - signé (empêche la falsification)
 */
export const tokenCookie = createCookie("access_token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  // IMPORTANT: fournissez une secret key en prod, ex: process.env.SESSION_SECRET
  secrets: [process.env.SESSION_SECRET || "dev-secret-change-me"],
  maxAge: 60 * 60 * 24 // 1 jour
});

/** Lit le token depuis le Cookie de la requête */
export async function readToken(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  return tokenCookie.parse(cookieHeader);
}

/** En-têtes Set-Cookie pour écrire le token */
export async function commitToken(token: string) {
  return {
    "Set-Cookie": await tokenCookie.serialize(token),
  };
}

/** En-têtes Set-Cookie pour détruire le token */
export async function destroyToken() {
  return {
    "Set-Cookie": await tokenCookie.serialize("", { maxAge: 0 }),
  };
}
