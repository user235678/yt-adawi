// components/admin/blog/CreatePostModal.tsx
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { X } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const actionData = useActionData();
  const navigation = useNavigation();
  const [tags, setTags] = useState<string>("");

  if (!isOpen) return null;

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md md:max-w-lg rounded-xl shadow-lg p-6 relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold mb-4">Créer un nouvel article</h1>

        {actionData?.error && (
          <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">
            {typeof actionData.error === "string"
              ? actionData.error
              : JSON.stringify(actionData.error)}
          </div>
        )}
        {actionData?.success && (
          <div className="p-3 mb-4 text-green-700 bg-green-100 rounded">
            Article créé avec succès 🎉
          </div>
        )}


        <Form
          method="post"
          encType="multipart/form-data"
          className="space-y-4"
        >
          <div>
            <label className="block font-medium">Titre *</label>
            <input
              type="text"
              name="title"
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Extrait *</label>
            <textarea
              name="excerpt"
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Contenu *</label>
            <textarea
              name="content"
              required
              className="w-full p-2 border rounded h-40"
            />
          </div>

          <div>
            <label className="block font-medium">Statut *</label>
            <select
              name="status"
              required
              className="w-full p-2 border rounded"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="published">archivé</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Tags (séparés par virgule)</label>
            <input
              type="text"
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Image de couverture</label>
            <input
              type="file"
              name="cover_image"
              accept="image/*"
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isSubmitting ? "Envoi en cours..." : "Créer l'article"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
