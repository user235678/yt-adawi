import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import ProductModal from "~/components/boutique/ProductModal";
import ImageModal from "~/components/ImageModal";
import type { Product } from "~/components/boutique/ProductGrid";

export const meta: MetaFunction = () => {
  return [
    { title: "Résultats de recherche - Adawi" },
    { name: "description", content: "Résultats de recherche sur le site Adawi" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  // implémenter une vraie recherche dans votre base de données
  // Pour l'exemple je simule des résultats
  const mockResults: Product[] = [
    {
      id: 17,
      name: "Montre Sport",
      price: "28000 fcfa",
      priceValue: 28000,
      image: "/template/montres/istockp.png",
      hoverImage: "/template/6.png", // Image de survol ajoutée
      image1: "/template/0.png", // Nouvelle image supplémentaire
      image2: "/template/9.png", // Nouvelle image supplémentaire
      date: new Date(2023, 8, 18),
      category: "montre",
      size: "m",
      color: "noir"
    },
    {
      id: 2,
      name: "Veste Noire L",
      price: "25000 fcfa",
      priceValue: 25000,
      image: "/template/5.png",
      hoverImage: "/template/8.png", // Image de survol ajoutée
      image1: "/template/6.png", // Nouvelle image supplémentaire
      image2: "/template/0.png", // Nouvelle image supplémentaire
      date: new Date(2023, 6, 20),
      category: "homme",
      size: "l",
      color: "noir"
    },
    {
      id: 3,
      name: "Chemise Blanche M",
      price: "7000 fcfa",
      priceValue: 7000,
      image: "/template/5.png",
      hoverImage: "/template/9.png", // Image de survol ajoutée
      image1: "/template/8.png", // Nouvelle image supplémentaire
      image2: "/template/6.png", // Nouvelle image supplémentaire
      date: new Date(2023, 7, 5),
      category: "homme",
      size: "m",
      color: "blanc"
    },
    {
      id: 4,
      name: "Cardigan Vert XXL",
      price: "5000 fcfa",
      priceValue: 5000,
      image: "/template/5.png",
      hoverImage: "/template/0.png", // Image de survol ajoutée
      image1: "/template/9.png", // Nouvelle image supplémentaire
      image2: "/template/8.png", // Nouvelle image supplémentaire
      date: new Date(2023, 8, 10),
      category: "homme",
      size: "xxl",
      color: "vert"
    },
    {
      id: 5,
      name: "T-shirt Rouge M",
      price: "4000 fcfa",
      priceValue: 4000,
      image: "/template/5.png",
      hoverImage: "/template/6.png", // Image de survol ajoutée
      image1: "/template/0.png", // Nouvelle image supplémentaire
      image2: "/template/9.png", // Nouvelle image supplémentaire
      date: new Date(2023, 4, 12),
      category: "homme",
      size: "m",
      color: "rouge"
    },
  ];

  // Filtrer les résultats basés sur la requête
  const filteredResults = query
    ? mockResults.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
      // item.description.toLowerCase().includes(query.toLowerCase()) || 
      // item.category.toLowerCase().includes(query.toLowerCase())
    )
    : [];

  return { query, results: filteredResults };
}

export default function Search() {
  const { query, results } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  // État pour gérer la modale produit
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // État pour gérer la modale d'image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Fonction pour ouvrir la modale produit
  const handleOpenProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  // Fonction pour fermer la modale produit
  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  // Fonction pour ouvrir la modale d'image
  const handleOpenImageModal = (imageUrl: string, imageAlt: string) => {
    setSelectedImage(imageUrl);
    setSelectedImageAlt(imageAlt);
    setIsImageModalOpen(true);
  };

  // Fonction pour fermer la modale d'image
  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
    setSelectedImageAlt("");
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      {/* Section des résultats */}
      <section className="bg-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* En-tête des résultats */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black mb-2">
              Résultats de recherche
            </h1>
            {query && (
              <p className="text-gray-600">
                {results.length} résultat{results.length > 1 ? 's' : ''} pour "{query}"
              </p>
            )}
          </div>

          {/* Résultats */}
          {query ? (
            results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                  >
                    <div className="overflow-hidden group cursor-pointer">
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
                        onClick={() => handleOpenImageModal(result.image, result.name)}
                      />
                    </div>
                    <div className="p-4 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-adawi-gold bg-adawi-gold/10 px-2 py-1 rounded">
                          {result.category}
                        </span>
                        {result.price && (
                          <span className="text-lg font-bold text-gray-800">
                            {result.price}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {result.name}
                      </h3>

                      <button
                        onClick={() => handleOpenProductModal(result)}
                        aria-label={`Voir plus sur ${result.name}`}
                        className="text-black text-center w-full bg-adawi-gold hover:bg-adawi-gold/90 font-medium py-2 px-4 rounded-xl transition-colors duration-300"
                      >
                        Voir plus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez avec d'autres mots-clés ou vérifiez l'orthographe.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Commencez votre recherche
              </h3>
              <p className="text-gray-600">
                Utilisez la barre de recherche pour trouver des produits, articles de blog et plus encore.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modale de produit */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
      />

      {/* Modale d'image */}
      <ImageModal
        imageUrl={selectedImage}
        imageAlt={selectedImageAlt}
        isOpen={isImageModalOpen}
        onClose={handleCloseImageModal}
      />

      <Footer />
    </div>
  );
}
