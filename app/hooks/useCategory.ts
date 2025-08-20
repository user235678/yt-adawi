// import { useState, useEffect } from 'react';

// interface Category {
//     id: string;
//     name: string;
//     description: string;
//     parent_id: string | null;
//     children: string[];
//     created_at: string;
//     updated_at: string;
// }

// export function useCategory(categoryId: string | null) {
//     const [category, setCategory] = useState<Category | null>(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         if (!categoryId) {
//             setCategory(null);
//             setError(null);
//             return;
//         }

//         const loadCategory = async () => {
//             setIsLoading(true);
//             setError(null);

//             try {
//                 console.log(`🔍 Hook useCategory - Chargement de la catégorie: ${categoryId}`);

//                 const response = await fetch(`/api/categories/${categoryId}`);
//                 const data = await response.json();

//                 console.log(`📡 Hook useCategory - Réponse:`, data);

//                 if (data.success) {
//                     setCategory(data.category);
//                     console.log(`✅ Hook useCategory - Catégorie chargée:`, data.category.name);
//                 } else {
//                     setError(data.error);
//                     setCategory(null);
//                     console.error(`❌ Hook useCategory - Erreur:`, data.error);
//                 }
//             } catch (err) {
//                 setError("Erreur de connexion");
//                 setCategory(null);
//                 console.error(`❌ Hook useCategory - Erreur de connexion:`, err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         loadCategory();
//     }, [categoryId]);

//     const refetch = () => {
//         if (categoryId) {
//             const loadCategory = async () => {
//                 setIsLoading(true);
//                 setError(null);

//                 try {
//                     console.log(`🔄 Hook useCategory - Refetch de la catégorie: ${categoryId}`);

//                     const response = await fetch(`/api/categories/${categoryId}`);
//                     const data = await response.json();

//                     if (data.success) {
//                         setCategory(data.category);
//                     } else {
//                         setError(data.error);
//                         setCategory(null);
//                     }
//                 } catch (err) {
//                     setError("Erreur de connexion");
//                     setCategory(null);
//                 } finally {
//                     setIsLoading(false);
//                 }
//             };

//             loadCategory();
//         }
//     };

//     return { category, isLoading, error, refetch };
// }
