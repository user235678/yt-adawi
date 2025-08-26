// app/routes/admin.blog.tsx
import {
  json,
  redirect,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useActionData,
} from "@remix-run/react";
import { useState } from "react";
import { Plus, Eye } from "lucide-react";
import { readToken } from "~/utils/session.server";
import CreatePostModal from "~/components/admin/CreatePostModal";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string;
  tags: string[];
  author_name: string;
  published_at?: string;
  views_count: number;
}

interface LoaderData {
  posts: BlogPost[];
  error?: string;
}

/* =======================
   LOADER : liste des posts
   ======================= */
export const loader: LoaderFunction = async ({ request }) => {
  try {
    const token = await readToken(request);
    if (!token) throw new Response("Non autorisé", { status: 401 });

    const res = await fetch(
      "https://showroom-backend-2x3g.onrender.com/admin/content/blog/posts?limit=20&skip=0",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      throw new Error("Erreur lors de la récupération des posts");
    }

    const posts: BlogPost[] = await res.json();
    return json<LoaderData>({ posts });
  } catch (error: any) {
    console.error("Erreur loader blog:", error);
    return json<LoaderData>({
      posts: [],
      error: error.message || "Erreur serveur",
    });
  }
};

/* =======================
   ACTION : création de post
   ======================= */
export const action: ActionFunction = async ({ request }) => {
  try {
    const token = await readToken(request);
    if (!token) {
      return json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();

    // Préparer FormData pour le backend
    const backendFormData = new FormData();
    formData.forEach((value, key) => {
      backendFormData.append(key, value);
    });

    const res = await fetch(
      "https://showroom-backend-2x3g.onrender.com/admin/content/blog/posts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: backendFormData,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return json({ error: errorText }, { status: res.status });
    }

    // Après création, on recharge la liste
   return json({ success: true });
  } catch (err: any) {
    console.error("Erreur création post:", err);
    return json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
};

/* =======================
   COMPONENT
   ======================= */
export default function AdminBlog() {
  const { posts, error } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des articles de blog</h1>
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
        >
          <Plus size={18} /> Créer un post
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-gray-500">Aucun post trouvé.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">Titre</th>
                <th className="px-4 py-2">Auteur</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Publié le</th>
                <th className="px-4 py-2">Vues</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 font-medium">{post.title}</td>
                  <td className="px-4 py-2">{post.author_name}</td>
                  <td className="px-4 py-2">
                    {post.published_at ? (
                      <span className="text-green-600 font-semibold">
                        Publié
                      </span>
                    ) : (
                      <span className="text-gray-500">Brouillon</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2">{post.views_count}</td>
                  <td>
                <button>
                   <Eye className="w-4 h-4" />
                </button>
              </td>
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>
      )}

      {/* Modal création */}
      <CreatePostModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}
