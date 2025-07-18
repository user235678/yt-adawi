import { Headphones, CreditCard, Truck, PackageSearch } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: <Headphones className="w-10 h-10 text-black" />,
      title: "Assistance client",
      subtitle: "24h/24 et 7j/7"
    },
    {
      icon: <CreditCard className="w-10 h-10 text-black" />,
      title: "Paiement sécurisé",
      subtitle: "Transactions cryptées"
    },
    {
      icon: <Truck className="w-10 h-10 text-black" />,
      title: "Livraison rapide",
      subtitle: "et gratuite"
    },
    {
      icon: <PackageSearch className="w-10 h-10 text-black" />,
      title: "Suivi en temps réel",
      subtitle: "des commandes"
    }
  ];

  return (
    <section className="bg-white px-6 py-12 ">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="text-center text-black">
              <div className="mb-3 flex justify-center">{service.icon}</div>
              <h3 className="font-semibold mb-1">{service.title}</h3>
              {service.subtitle && <p className="text-sm">{service.subtitle}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
