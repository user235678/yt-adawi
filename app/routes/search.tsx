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
      price: "28000 F CFA",
      priceValue: 28000,
      image: "/istockp.png",
      hoverImage: "/6.png", // Image de survol ajoutée
      image1: "/0.png", // Nouvelle image supplémentaire
      image2: "/9.png", // Nouvelle image supplémentaire
      date: new Date(2023, 8, 18),
      category: "montre",
      size: "m",
      color: "noir"
    },
    {
      id: 2,
      name: "Veste Noire L",
      price: "25000 F CFA",
      priceValue: 25000,
      image: "/5.png",
      hoverImage: "/8.png", // Image de survol ajoutée
      image1: "/6.png", // Nouvelle image supplémentaire
      image2: "/0.png", // Nouvelle image supplémentaire
      date: new Date(2023, 6, 20),
      category: "homme",
      size: "l",
      color: "noir"
    },
    {
      id: 3,
      name: "Chemise Blanche M",
      price: "7000 F CFA",
      priceValue: 7000,
      image: "/5.png",
      hoverImage: "/9.png", // Image de survol ajoutée
      image1: "/8.png", // Nouvelle image supplémentaire
      image2: "/6.png", // Nouvelle image supplémentaire
      date: new Date(2023, 7, 5),
      category: "homme",
      size: "m",
      color: "blanc"
    },
    {
      id: 4,
      name: "Cardigan Vert XXL",
      price: "5000 F CFA",
      priceValue: 5000,
      image: "/5.png",
      hoverImage: "/0.png", // Image de survol ajoutée
      image1: "/9.png", // Nouvelle image supplémentaire
      image2: "/8.png", // Nouvelle image supplémentaire
      date: new Date(2023, 8, 10),
      category: "homme",
      size: "xxl",
      color: "vert"
    },
    {
      id: 5,
      name: "T-shirt Rouge M",
      price: "4000 F CFA",
      priceValue: 4000,
      image: "/5.png",
      hoverImage: "/6.png", // Image de survol ajoutée
      image1: "/0.png", // Nouvelle image supplémentaire
      image2: "/9.png", // Nouvelle image supplémentaire
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

  // CSS personnalisé pour la grille de résultats de recherche
  const searchResultsStyles = `
    .search-results-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .search-result-card {
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .search-result-card:hover {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .search-result-image-container {
      overflow: hidden;
      position: relative;
      border-radius: 0.75rem 0.75rem 0 0;
      background-color: #f3f4f6;
    }

    .search-result-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: contain;
      transition: transform 0.3s ease;
      padding: 0.5rem;
    }

    .search-result-card:hover .search-result-image {
      transform: scale(1.05);
    }

    @media (min-width: 640px) {
      .search-results-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }
      
      .search-result-image {
        aspect-ratio: 4 / 3;
        object-fit: cover;
        padding: 0;
      }
    }

    @media (min-width: 768px) {
      .search-results-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .search-results-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 480px) {
      .search-results-grid {
        gap: 0.5rem;
      }
      
      .search-result-card {
        border-radius: 0.5rem;
      }
    }
  `;

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      {/* Section des résultats */}
      <section className="bg-white px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* En-tête des résultats */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-black mb-2">
              Résultats de recherche
            </h1>
            {query && (
              <p className="text-gray-600">
                {results.length} résultat{results.length > 1 ? 's' : ''} pour "{query}"
              </p>
            )}
          </div>

          {/* Styles CSS personnalisés */}
          <style dangerouslySetInnerHTML={{ __html: searchResultsStyles }} />

          {/* Résultats */}
          {query ? (
            results.length > 0 ? (
              <div className="search-results-grid">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="search-result-card bg-white border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <div 
                      className="search-result-image-container group cursor-pointer"
                      onClick={() => handleOpenImageModal(result.image, result.name)}
                    >
                      <img
                        src={result.image}
                        alt={result.name}
                        className="search-result-image"
                      />
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-adawi-gold bg-adawi-gold/10 px-2 py-1 rounded truncate max-w-[70%]">
                          {result.category}
                        </span>
                        {result.price && (
                          <span className="text-sm sm:text-base font-bold text-gray-800 whitespace-nowrap">
                            {result.price}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                        {result.name}
                      </h3>

                      <div className="mt-auto pt-2">
                        <button
                          onClick={() => handleOpenProductModal(result)}
                          aria-label={`Voir plus sur ${result.name}`}
                          className="text-black text-center w-full bg-adawi-gold hover:bg-adawi-gold/90 font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors duration-300 text-xs sm:text-sm"
                        >
                          Voir plus
                        </button>
                      </div>
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
