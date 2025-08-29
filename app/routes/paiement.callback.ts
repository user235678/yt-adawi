import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

// ce fichier correspond à la route /paiements/callback
export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();

  const { tx_reference, identifier, status, amount, phone_number, network } = body;

  console.log("📥 Callback PayGate reçu :", body);

  // TODO: récupérer la transaction en base
  // exemple: const transaction = await db.transaction.findUnique({ where: { tx_reference } });

  // TODO: mettre à jour la transaction en base
  // exemple: await db.transaction.update({
  //   where: { tx_reference },
  //   data: { status },
  // });

  // on confirme la réception à PayGate
  return json("ok", { status: 200 });
};
