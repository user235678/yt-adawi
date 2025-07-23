import React from "react";
import { Link } from "@remix-run/react";

interface Product {
  id: number;
  name: string;
  image: string;
}

const NewProducts: React.FC = () => {
  const products: Product[] = [
    { id: 1, name: "", image: "/0.png" },
    { id: 2, name: "", image: "/5.png" },
    { id: 3, name: "", image: "/6.png" },
    { id: 4, name: "", image: "/8.png" },
    { id: 5, name: "", image: "/9.png" },
  ];

  return (
    <section className="bg-gray-100 px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-black">Nouveautés</h2>
          <Link to="/boutique" className="border border-adawi-gold/90 text-black px-6 py-2 rounded-full hover:bg-adawi-gold hover:text-white transition-colors">
            Voir tous
          </Link>
          
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="aspect-[4/5] overflow-hidden mb-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-adawi-brown font-medium">{product.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewProducts;
