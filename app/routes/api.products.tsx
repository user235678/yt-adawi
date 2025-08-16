import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

// Interface pour les produits (basée sur la structure existante)
interface Product {
  id: number;
  name: string;
  price: string;
  priceValue: number;
  image: string;
  hoverImage?: string;
  image1?: string;
  image2?: string;
  date: Date;
  category: string;
  size?: string;
  sizes?: string;
  color?: string;
  colors?: string;
  stock?: number;
  description?: string;
}

// Données de produits (en production, cela viendrait d'une base de données)
const products: Product[] = [
  {
    id: 1,
    name: "Robe Élégante",
    price: "25000 fcfa",
    priceValue: 25000,
    image: "/1.png",
    hoverImage: "/2.png",
    image1: "/3.png",
    image2: "/4.png",
    date: new Date(2023, 8, 15),
    category: "femme",
    sizes: "s,m,l,xl",
    colors: "noir,blanc,rouge",
    stock: 15,
    description: "Robe élégante pour toutes occasions"
  },
  {
    id: 2,
    name: "Costume Homme",
    price: "45000 fcfa",
    priceValue: 45000,
    image: "/2.png",
    hoverImage: "/3.png",
    image1: "/4.png",
    image2: "/5.png",
    date: new Date(2023, 9, 10),
    category: "homme",
    sizes: "m,l,xl,xxl",
    colors: "noir,bleu,gris",
    stock: 8,
    description: "Costume élégant pour homme"
  },
  {
    id: 3,
    name: "Robe Enfant S",
    price: "5000 fcfa",
    priceValue: 5000,
    image: "/5.png",
    hoverImage: "/6.png",
    image1: "/8.png",
    image2: "/0.png",
    date: new Date(2023, 9, 5),
    category: "enfant",
    size: "s",
    color: "rouge",
    stock: 20,
    description: "Robe colorée pour enfant"
  },
  {
    id: 4,
    name: "Veste Enfant M",
    price: "6000 fcfa",
    priceValue: 6000,
    image: "/5.png",
    hoverImage: "/8.png",
    image1: "/9.png",
    image2: "/0.png",
    date: new Date("2025-07-20"),
    category: "enfant",
    size: "m",
    color: "vert",
    stock: 12,
    description: "Veste confortable pour enfant"
  },
  {
    id: 5,
    name: "T-shirt Premium",
    price: "15000 fcfa",
    priceValue: 15000,
    image: "/5.png",
    hoverImage: "/6.png",
    image1: "/8.png",
    image2: "/9.png",
    date: new Date("2025-08-05"),
    category: "homme",
    sizes: "s,m,l,xl",
    colors: "noir,blanc,rouge",
    stock: 25,
    description: "T-shirt premium en coton"
  }
];

// Fonction utilitaire pour parser les paramètres de requête
function parseQueryParam(param: string | null): string[] {
  if (!param) return [];
  return param.split(',').map(item => item.trim()).filter(Boolean);
}

// Fonction utilitaire pour normaliser les tailles/couleurs d'un produit
function getProductSizes(product: Product): string[] {
  if (product.sizes) {
    return product.sizes.split(',').map(size => size.trim());
  }
  if (product.size) {
    return [product.size];
  }
  return [];
}

function getProductColors(product: Product): string[] {
  if (product.colors) {
    return product.colors.split(',').map(color => color.trim());
  }
  if (product.color) {
    return [product.color];
  }
  return [];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Extraction des paramètres de requête
  const skip = parseInt(url.searchParams.get('skip') || '0');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const categoryId = url.searchParams.get('category_id');
  const minPrice = url.searchParams.get('min_price') ? parseFloat(url.searchParams.get('min_price')!) : null;
  const maxPrice = url.searchParams.get('max_price') ? parseFloat(url.searchParams.get('max_price')!) : null;
  const sizesFilter = parseQueryParam(url.searchParams.get('sizes'));
  const colorsFilter = parseQueryParam(url.searchParams.get('colors'));
  const search = url.searchParams.get('search');
  const nameFilter = url.searchParams.get('name');

  // Validation des paramètres
  if (skip < 0) {
    return json({ error: "Le paramètre 'skip' doit être >= 0" }, { status: 400 });
  }

  if (limit <= 0) {
    return json({ error: "Le paramètre 'limit' doit être > 0" }, { status: 400 });
  }

  if (minPrice !== null && minPrice < 0) {
    return json({ error: "Le prix minimum doit être >= 0" }, { status: 400 });
  }

  if (maxPrice !== null && maxPrice < 0) {
    return json({ error: "Le prix maximum doit être >= 0" }, { status: 400 });
  }

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return json({ error: "Le prix minimum ne peut pas être supérieur au prix maximum" }, { status: 400 });
  }

  // Filtrage des produits
  let filteredProducts = products.filter(product => {
    // Filtre par catégorie
    if (categoryId && product.category !== categoryId) {
      return false;
    }

    // Filtre par prix minimum
    if (minPrice !== null && product.priceValue < minPrice) {
      return false;
    }

    // Filtre par prix maximum
    if (maxPrice !== null && product.priceValue > maxPrice) {
      return false;
    }

    // Filtre par tailles
    if (sizesFilter.length > 0) {
      const productSizes = getProductSizes(product);
      const hasMatchingSize = sizesFilter.some(filterSize => 
        productSizes.some(productSize => 
          productSize.toLowerCase() === filterSize.toLowerCase()
        )
      );
      if (!hasMatchingSize) {
        return false;
      }
    }

    // Filtre par couleurs
    if (colorsFilter.length > 0) {
      const productColors = getProductColors(product);
      const hasMatchingColor = colorsFilter.some(filterColor => 
        productColors.some(productColor => 
          productColor.toLowerCase() === filterColor.toLowerCase()
        )
      );
      if (!hasMatchingColor) {
        return false;
      }
    }

    // Filtre par recherche textuelle
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower)) ||
        product.category.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Filtre par nom exact
    if (nameFilter && !product.name.toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Tri par date (plus récent en premier)
  filteredProducts.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Pagination
  const total = filteredProducts.length;
  const paginatedProducts = filteredProducts.slice(skip, skip + limit);

  // Formatage de la réponse
  const formattedProducts = paginatedProducts.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    priceValue: product.priceValue,
    image: product.image,
    hoverImage: product.hoverImage,
    image1: product.image1,
    image2: product.image2,
    category: product.category,
    sizes: getProductSizes(product),
    colors: getProductColors(product),
    stock: product.stock || 0,
    description: product.description,
    createdAt: product.date.toISOString()
  }));

  return json({
    products: formattedProducts,
    pagination: {
      skip,
      limit,
      total,
      hasNext: skip + limit < total,
      hasPrevious: skip > 0,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(skip / limit) + 1
    },
    filters: {
      category_id: categoryId,
      min_price: minPrice,
      max_price: maxPrice,
      sizes: sizesFilter,
      colors: colorsFilter,
      search,
      name: nameFilter
    }
  });
}
