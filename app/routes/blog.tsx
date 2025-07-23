import { useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import Newsletter from "~/components/Newsletter";
import BlogGrid from "~/components/blog/BlogGrid";
import Pagination from "~/components/blog/Pagination";

export const meta: MetaFunction = () => {
    return [
        { title: "Blog - Adawi" },
        { name: "description", content: "Découvrez nos articles de mode et conseils vestimentaires." },
    ];
};

export interface BlogPost {
    id: number;
    title: string;
    date: string;
    image: string;
}

export default function Blog() {
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 16; // Augmenté pour avoir plus de photos par page avec la taille réduite

    // Données des articles de blog avec identifiants uniques
    const allBlogPosts: BlogPost[] = [
        // Page 1 (16 articles identiques comme dans l'image)
        { id: 17, title: "Guide des tendances automne-hiver", date: "15/10/04", image: "/6.png" },
        { id: 18, title: "Comment bien choisir sa veste", date: "16/10/04", image: "/8.png" },
        { id: 19, title: "Les couleurs de la saison", date: "17/10/04", image: "/9.png" },
        { id: 20, title: "Conseils pour un look professionnel", date: "18/10/04", image: "/0.png" },
        { id: 21, title: "Mode éthique et durable", date: "19/10/04", image: "/5.png" },
        { id: 22, title: "Accessoires indispensables", date: "20/10/04", image: "/6.png" },
        { id: 23, title: "Style décontracté chic", date: "21/10/04", image: "/8.png" },
        { id: 24, title: "Entretien de vos vêtements", date: "22/10/04", image: "/9.png" },
        { id: 25, title: "Morphologie et style", date: "23/10/04", image: "/0.png" },
        { id: 26, title: "Les basiques du dressing", date: "24/10/04", image: "/5.png" },
        { id: 27, title: "Inspiration street style", date: "25/10/04", image: "/6.png" },
        { id: 28, title: "Mode et confiance en soi", date: "26/10/04", image: "/8.png" },
        { id: 29, title: "Tendances printemps-été", date: "01/11/04", image: "/9.png" },
        { id: 30, title: "Look de soirée élégant", date: "02/11/04", image: "/0.png" },
        { id: 31, title: "Mode masculine moderne", date: "03/11/04", image: "/5.png" },
        { id: 32, title: "Style minimaliste", date: "04/11/04", image: "/6.png" },

        // Page 2 (16 articles variés)
        { id: 1, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 2, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 3, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 4, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 5, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 6, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 7, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 8, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 9, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 10, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 11, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 12, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 13, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 14, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 15, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        { id: 16, title: "Les 10 idées de vêtements confortables pour femmes", date: "10/10/04", image: "/5.png" },
        // Page 3 (16 articles variés)
        { id: 17, title: "Guide des tendances automne-hiver", date: "15/10/04", image: "/6.png" },
        { id: 18, title: "Comment bien choisir sa veste", date: "16/10/04", image: "/8.png" },
        { id: 19, title: "Les couleurs de la saison", date: "17/10/04", image: "/9.png" },
        { id: 20, title: "Conseils pour un look professionnel", date: "18/10/04", image: "/0.png" },
        { id: 21, title: "Mode éthique et durable", date: "19/10/04", image: "/5.png" },
        { id: 22, title: "Accessoires indispensables", date: "20/10/04", image: "/6.png" },
        { id: 23, title: "Style décontracté chic", date: "21/10/04", image: "/8.png" },
        { id: 24, title: "Entretien de vos vêtements", date: "22/10/04", image: "/9.png" },
        { id: 25, title: "Morphologie et style", date: "23/10/04", image: "/0.png" },
        { id: 26, title: "Les basiques du dressing", date: "24/10/04", image: "/5.png" },
        { id: 27, title: "Inspiration street style", date: "25/10/04", image: "/6.png" },
        { id: 28, title: "Mode et confiance en soi", date: "26/10/04", image: "/8.png" },
        { id: 29, title: "Tendances printemps-été", date: "01/11/04", image: "/9.png" },
        { id: 30, title: "Look de soirée élégant", date: "02/11/04", image: "/0.png" },
        { id: 31, title: "Mode masculine moderne", date: "03/11/04", image: "/5.png" },
        { id: 32, title: "Style minimaliste", date: "04/11/04", image: "/6.png" },
    ];

    const totalPages = Math.ceil(allBlogPosts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const currentPosts = allBlogPosts.slice(startIndex, startIndex + postsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white">
            <TopBanner />
            <Header />

            {/* Espacement après le header - exactement comme dans l'image */}
            <div className="bg-adawi-beige-dark">
                <br />
                <br />
                <br />
            </div>
            <div className="bg-gray-200">
                <br />
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <BlogGrid posts={currentPosts} />

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </main>

            <Newsletter />
            <Footer />
        </div>
    );
}
