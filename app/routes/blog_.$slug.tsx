import { useState, useEffect } from "react";
import { useParams, Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import Newsletter from "~/components/Newsletter";

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `Article - Adawi` },
    {
      name: "description",
      content: "Découvrez cet article de mode et nos conseils vestimentaires.",
    },
  ];
};

interface BlogPostDetail {
  slug: string;
  title: string;
  body_html: string;
  meta_description?: string;
  meta_keywords?: string;
  status: string;
  id: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author_name: string;
  views_count: number;
  cover_image?: string;
  excerpt?: string;
}

export default function BlogSlug() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const res = await fetch(
          `https://showroom-backend-2x3g.onrender.com/content/blog/posts/${slug}`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (!res.ok) {
          throw new Error(`Article non trouvé (${res.status})`);
        }

        const data = await res.json();
        setPost(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement de l'article");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <TopBanner />
        <Header />
        
        <div className="bg-adawi-beige-dark py-4"></div>
        <div className="bg-gray-200 py-2"></div>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </main>

        <Newsletter />
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <TopBanner />
        <Header />
        
        <div className="bg-adawi-beige-dark py-4"></div>
        <div className="bg-gray-200 py-2"></div>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Oups ! Article introuvable
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                L'article que vous recherchez n'existe pas ou a été supprimé.
              </p>
            </div>
            
            <Link
              to="/blog"
              className="inline-flex items-center bg-adawi-gold text-white px-8 py-4 rounded-lg hover:bg-adawi-gold/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ← Retour au blog
            </Link>
          </div>
        </main>

        <Newsletter />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      <div className="bg-adawi-beige-dark py-4"></div>
      <div className="bg-gray-200 py-2"></div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link 
                to="/" 
                className="hover:text-adawi-gold transition-colors duration-200"
              >
                Accueil
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link 
                to="/blog" 
                className="hover:text-adawi-gold transition-colors duration-200"
              >
                Blog
              </Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-400 truncate max-w-md">
              {post.title}
            </li>
          </ol>
        </nav>

        <article className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Article Header */}
          <header className="relative">
            {/* Image de couverture avec effet parallax */}
            {post.cover_image && (
              <div className="relative h-[28rem] overflow-hidden">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                
                {/* Badge de statut */}
                <div className="absolute top-6 right-6">
                  <span className="bg-adawi-gold text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
                    {post.status === 'published' ? '✓ Publié' : '📝 Brouillon'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Contenu du header avec design moderne */}
            <div className={`${post.cover_image ? 'absolute bottom-0 left-0 right-0 text-white p-8 md:p-12' : 'p-8 md:p-12 pb-6 bg-gradient-to-br from-gray-50 to-white'}`}>
              <div className="max-w-4xl">
                {/* Métadonnées avec icônes modernes */}
                <div className="flex flex-wrap items-center gap-6 text-sm mb-6">
                  <div className="flex items-center group">
                    <div className="w-12 h-12 bg-gradient-to-r from-adawi-gold to-yellow-500 rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <span className="text-white font-bold text-lg">
                        {post.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className={`font-semibold ${post.cover_image ? 'text-white' : 'text-adawi-gold'} block`}>
                        {post.author_name}
                      </span>
                      <span className={`text-xs ${post.cover_image ? 'text-white/80' : 'text-gray-500'}`}>
                        Auteur
                      </span>
                    </div>
                  </div>
                  
                  {post.published_at && (
                    <div className="flex items-center bg-black/20 rounded-full px-4 py-2 backdrop-blur-sm">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className={post.cover_image ? 'text-white/90' : 'text-gray-600'}>
                        {formatDate(post.published_at)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center bg-black/20 rounded-full px-4 py-2 backdrop-blur-sm">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className={post.cover_image ? 'text-white/90' : 'text-gray-600'}>
                      {post.views_count.toLocaleString()} vues
                    </span>
                  </div>
                </div>

                {/* Titre avec animation */}
                <h1 className={`text-4xl md:text-6xl font-black leading-tight mb-6 ${post.cover_image ? 'text-white' : 'text-gray-900'} transform hover:scale-[1.02] transition-transform duration-300`}>
                  {post.title}
                </h1>

                {/* Excerpt avec style élégant */}
                {(post.excerpt || post.meta_description) && (
                  <div className="relative">
                    <p className={`text-xl leading-relaxed font-light ${post.cover_image ? 'text-white/95' : 'text-gray-600'} max-w-4xl`}>
                      {post.excerpt || post.meta_description}
                    </p>
                    {!post.cover_image && (
                      <div className="absolute -left-6 top-0 w-1 h-full bg-gradient-to-b from-adawi-gold to-transparent rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Contenu de l'article avec espacement amélioré */}
          <div className="p-8 md:p-16 bg-white">
            {/* Séparateur décoratif si pas d'image de couverture */}
            {!post.cover_image && (
              <div className="flex items-center justify-center mb-12">
                <div className="h-px bg-gradient-to-r from-transparent via-adawi-gold to-transparent w-32"></div>
                <div className="mx-4 w-2 h-2 bg-adawi-gold rounded-full"></div>
                <div className="h-px bg-gradient-to-r from-adawi-gold via-adawi-gold to-transparent w-32"></div>
              </div>
            )}
            
            {/* Zone de lecture avec focus */}
            <div className="article-content-wrapper max-w-4xl mx-auto">
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: post.body_html }}
              />
            </div>

            {/* Mots-clés avec design moderne */}
            {post.meta_keywords && (
              <div className="mt-16 pt-12 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-adawi-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Mots-clés
                </h3>
                <div className="flex flex-wrap gap-3">
                  {post.meta_keywords.split(',').map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-gradient-to-r from-adawi-gold to-yellow-500 text-white text-sm px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      #{keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Footer de l'article */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-sm text-gray-500">
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Dernière mise à jour : {formatShortDate(post.updated_at)}
              </p>
              <p className="mt-1 text-xs">
                Article créé le {formatShortDate(post.created_at)}
              </p>
            </div>
            
            <div className="flex gap-4">
              <Link
                to="/blog"
                className="inline-flex items-center bg-adawi-gold text-white px-6 py-3 rounded-lg hover:bg-adawi-gold/90 transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                ← Retour au blog
              </Link>
              
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                ↑ Haut de page
              </button>
            </div>
          </div>
        </footer>
      </main>

      <Newsletter />
      <Footer />

      {/* Styles CSS intégrés pour le contenu et la page */}
      <style jsx>{`
        /* === STYLES POUR LE CONTENU DE L'ARTICLE === */
        .article-content-wrapper {
          max-width: none;
          line-height: 1.8;
          color: #374151;
          font-size: 1.1rem;
        }

        .article-content * {
          max-width: 100%;
          word-wrap: break-word;
        }

        /* Titres */
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          font-weight: 700;
          line-height: 1.3;
          color: #111827;
        }

        .article-content h1 {
          font-size: 2.5rem;
          border-bottom: 3px solid #d4af37;
          padding-bottom: 0.5rem;
          margin-bottom: 2rem;
        }

        .article-content h2 {
          font-size: 2rem;
          color: #1f2937;
          position: relative;
        }

        .article-content h2::before {
          content: '';
          position: absolute;
          left: -1.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 60%;
          background: linear-gradient(to bottom, #d4af37, #b8941f);
          border-radius: 2px;
        }

        .article-content h3 {
          font-size: 1.6rem;
          color: #374151;
        }

        .article-content h4 {
          font-size: 1.3rem;
          color: #4b5563;
        }

        /* Paragraphes */
        .article-content p {
          margin-bottom: 1.75rem;
          line-height: 1.8;
          color: #374151;
          text-align: justify;
        }

        .article-content p:first-of-type {
          font-size: 1.2rem;
          color: #1f2937;
          font-weight: 400;
        }

        .article-content p:first-of-type::first-letter {
          font-size: 4rem;
          font-weight: 700;
          float: left;
          line-height: 3rem;
          margin: 0.5rem 0.5rem 0 0;
          color: #d4af37;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        /* Images */
        .article-content img {
          max-width: 100%;
          height: auto;
          margin: 3rem auto;
          display: block;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .article-content img:hover {
          transform: scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        /* Listes */
        .article-content ul,
        .article-content ol {
          margin: 2rem 0;
          padding-left: 2rem;
        }

        .article-content ul {
          list-style: none;
        }

        .article-content ul li::before {
          content: '→';
          color: #d4af37;
          font-weight: bold;
          position: absolute;
          margin-left: -1.5rem;
        }

        .article-content ol li {
          counter-increment: list-counter;
        }

        .article-content ol {
          counter-reset: list-counter;
        }

        .article-content ol li::marker {
          color: #d4af37;
          font-weight: bold;
        }

        .article-content li {
          margin-bottom: 0.75rem;
          line-height: 1.7;
          position: relative;
        }

        /* Citations */
        .article-content blockquote {
          margin: 3rem 0;
          padding: 2rem;
          border-left: 5px solid #d4af37;
          background: linear-gradient(135deg, #fefdf8 0%, #f9f7f0 100%);
          font-style: italic;
          color: #4b5563;
          border-radius: 0 1rem 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .article-content blockquote::before {
          content: '"';
          font-size: 4rem;
          color: #d4af37;
          position: absolute;
          top: -1rem;
          left: 1rem;
          font-family: Georgia, serif;
        }

        .article-content blockquote p {
          margin-bottom: 0;
          font-size: 1.1rem;
          position: relative;
          z-index: 1;
        }

        /* Liens */
        .article-content a {
          color: #d4af37;
          text-decoration: none;
          position: relative;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .article-content a::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -2px;
          left: 0;
          background: linear-gradient(90deg, #d4af37, #b8941f);
          transition: width 0.3s ease;
        }

        .article-content a:hover::after {
          width: 100%;
        }

        .article-content a:hover {
          color: #b8941f;
        }

        /* Code */
        .article-content code {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          padding: 0.25rem 0.6rem;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          color: #dc2626;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          border: 1px solid #e5e7eb;
        }

        .article-content pre {
          background: linear-gradient(135deg, #1f2937, #111827);
          color: #f9fafb;
          padding: 2rem;
          border-radius: 1rem;
          overflow-x: auto;
          margin: 2rem 0;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border: 1px solid #374151;
        }

        .article-content pre code {
          background: none;
          padding: 0;
          color: inherit;
          border: none;
        }

        /* Tableaux */
        .article-content table {
          width: 100%;
          margin: 2rem 0;
          border-collapse: collapse;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .article-content th,
        .article-content td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .article-content th {
          background: linear-gradient(135deg, #d4af37, #b8941f);
          color: white;
          font-weight: 600;
        }

        .article-content tr:nth-child(even) {
          background-color: #f9fafb;
        }

        .article-content tr:hover {
          background-color: #f3f4f6;
        }

        /* Séparateurs */
        .article-content hr {
          margin: 3rem auto;
          border: none;
          height: 2px;
          background: linear-gradient(to right, transparent, #d4af37, transparent);
          width: 50%;
        }

        /* Éléments strong et em */
        .article-content strong {
          color: #1f2937;
          font-weight: 700;
        }

        .article-content em {
          color: #4b5563;
          font-style: italic;
        }

        /* Divs et sections */
        .article-content div,
        .article-content section {
          margin-bottom: 1.5rem;
        }

        /* === AMÉLIORATIONS VISUELLES GÉNÉRALES === */
        
        /* Animation d'apparition */
        .article-content {
          animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .article-content h1 {
            font-size: 2rem;
          }
          
          .article-content h2 {
            font-size: 1.6rem;
          }
          
          .article-content p:first-of-type::first-letter {
            font-size: 3rem;
            line-height: 2.5rem;
          }
          
          .article-content blockquote {
            margin: 2rem -1rem;
            padding: 1.5rem;
          }
          
          .article-content pre {
            margin: 1.5rem -1rem;
            border-radius: 0;
          }
        }

        /* Print styles */
        @media print {
          .article-content {
            color: black !important;
          }
          
          .article-content a {
            color: black !important;
            text-decoration: underline !important;
          }
          
          .article-content img {
            max-width: 100% !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}