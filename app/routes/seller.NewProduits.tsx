import React, { useState, useEffect, useRef } from "react";
import { Upload, X, Trash2, Eye, Plus, Image as ImageIcon, Store } from "lucide-react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { readToken } from "~/utils/session.server";
import { requireVendor } from "~/utils/auth.server";
import SellerLayout from "~/components/seller/SellerLayout";

interface UserPhoto {
  image_url: string;
  description: string;
  _id: string;
  user_id: string;
  created_at: string;
}

interface PhotoUpload {
  file: File;
  description: string;
  preview: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await readToken(request);
  await requireVendor(request);

  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return json({ token });
}

const SellerNewProduits: React.FC = () => {
  const { token } = useLoaderData<typeof loader>();
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<PhotoUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les photos de l'utilisateur
  const fetchMyPhotos = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('https://showroom-backend-2x3g.onrender.com/user-photos/my-photos?skip=0&limit=100', {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: UserPhoto[] = await response.json();
      const sortedPhotos = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setPhotos(sortedPhotos);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPhotos();
  }, []);

  // Gestion du drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const remainingSlots = 10 - uploadFiles.length;
    const filesToAdd = imageFiles.slice(0, remainingSlots);

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: PhotoUpload = {
          file,
          description: '',
          preview: e.target?.result as string
        };
        setUploadFiles(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateDescription = (index: number, description: string) => {
    setUploadFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, description } : item
    ));
  };

  // Upload des photos
  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    try {
      setUploading(true);
      
      const formData = new FormData();
      
      // Ajouter les fichiers
      uploadFiles.forEach((item, index) => {
        formData.append('photos', item.file);
      });
      
      // Ajouter les descriptions
      const descriptions = uploadFiles.map(item => item.description || '');
      formData.append('descriptions', JSON.stringify(descriptions));

      const response = await fetch('https://showroom-backend-2x3g.onrender.com/user-photos/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const newPhotos: UserPhoto[] = await response.json();
      setPhotos(prev => [...newPhotos, ...prev]);
      setUploadFiles([]);
      setError(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
      console.error('Erreur upload:', err);
    } finally {
      setUploading(false);
    }
  };

  // Supprimer une photo
  const deletePhoto = async (photoId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;

    try {
      
      const response = await fetch(`https://showroom-backend-2x3g.onrender.com/user-photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      setPhotos(prev => prev.filter(photo => photo._id !== photoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      console.error('Erreur suppression:', err);
    }
  };

  return (
    <SellerLayout>
    <div className="min-h-screen bg-gradient-to-br from-adawi-beige to-adawi-beige-dark p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-adawi-brown mb-2 flex items-center">
            <Store className="w-8 h-8 mr-3 text-adawi-gold" />
            Gestion des Photos - Vendeur

          </h1>
          <p className="text-adawi-brown/70">Gérez vos photos de produits et présentations</p>
        </div>

        {/* Section Upload */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-adawi-gold/20 p-6 mb-8">
          <h2 className="text-xl font-semibold text-adawi-brown mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-adawi-gold" />
            Ajouter des Photos
          </h2>

          {/* Zone de drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-adawi-gold bg-adawi-gold/10 scale-105' 
                : 'border-adawi-gold/30 hover:border-adawi-gold/60 hover:bg-adawi-gold/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <ImageIcon className="w-12 h-12 text-adawi-gold/60 mx-auto mb-4" />
            <p className="text-lg font-medium text-adawi-brown mb-2">
              Glissez-déposez vos photos ici
            </p>
            <p className="text-adawi-brown/60 mb-4">
              ou cliquez pour sélectionner (max 10 photos)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-adawi-gold to-adawi-gold/90 text-white px-6 py-3 rounded-lg hover:from-adawi-gold/90 hover:to-adawi-gold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Sélectionner des fichiers
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Prévisualisation des fichiers à uploader */}
          {uploadFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-adawi-brown mb-4">
                Photos à uploader ({uploadFiles.length}/10)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {uploadFiles.map((item, index) => (
                  <div key={index} className="bg-adawi-beige/50 rounded-lg p-4 border border-adawi-gold/20">
                    <div className="relative mb-3">
                      <img
                        src={item.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => removeUploadFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Description de la photo..."
                      value={item.description}
                      onChange={(e) => updateDescription(index, e.target.value)}
                      className="w-full px-3 py-2 border border-adawi-gold/30 rounded-lg focus:ring-2 focus:ring-adawi-gold focus:border-transparent bg-white/80"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center shadow-lg transform hover:scale-105"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Uploader {uploadFiles.length} photo{uploadFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Messages d'erreur```tsx:app\routes\seller.NewProduits.tsx
        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 shadow-md">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm mt-2 underline"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Section Mes Photos */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-adawi-gold/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-adawi-brown flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-adawi-gold" />
              Mes Photos ({photos.length})
            </h2>
            <button
              onClick={fetchMyPhotos}
              disabled={loading}
              className="text-adawi-gold hover:text-adawi-gold/80 transition-colors px-3 py-1 rounded-lg hover:bg-adawi-gold/10"
            >
              Actualiser
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-adawi-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-adawi-brown/70">Chargement des photos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-adawi-gold/40 mx-auto mb-4" />
              <p className="text-adawi-brown text-lg font-medium">Aucune photo trouvée</p>
              <p className="text-adawi-brown/60">Commencez par uploader vos premières photos de produits</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {photos.map((photo) => (
                <div key={photo._id} className="break-inside-avoid bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden group hover:shadow-xl transition-all duration-300 border border-adawi-gold/10 hover:border-adawi-gold/30">
                  <div className="relative">
                    <img
                      src={photo.image_url}
                      alt={photo.description}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(photo.image_url, '_blank')}
                          className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors shadow-lg"
                          title="Voir en grand"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePhoto(photo._id)}
                          className="bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-600/80 transition-colors shadow-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-adawi-brown font-medium mb-2 line-clamp-2">
                      {photo.description || "Sans description"}
                    </p>
                    <p className="text-xs text-adawi-brown/60">
                      {new Date(photo.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
    </SellerLayout>
  );
};

export default SellerNewProduits;
