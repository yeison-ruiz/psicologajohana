"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Save, ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  published: boolean;
  category: string;
}

interface BlogFormProps {
  initialData?: BlogPost;
  isEdit?: boolean;
}

export function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const [formData, setFormData] = useState<BlogPost>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    published: false,
    category: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }

    // Get the current user ID to set as author
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setProfileId(user.id);
    };
    getUser();
  }, [initialData, supabase.auth]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
      // Auto-generate slug from title if it's a new post and we're typing the title
      ...(name === "title" && !isEdit && !prev.slug
        ? {
            slug: value
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, ""),
          }
        : {}),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error(
        "Configuración de Cloudinary faltante en las variables de entorno (.env.local)",
      );
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Error al subir a Cloudinary");
      }

      setFormData((prev) => ({ ...prev, image_url: data.secure_url }));
      toast.success("Imagen subida con éxito a Cloudinary");
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message || "No se pudo subir la imagen.");
      } else {
        toast.error("No se pudo subir la imagen a Cloudinary.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) {
      toast.error("Error de sesión. Por favor recarga la página.");
      return;
    }

    setLoading(true);

    const postData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      image_url: formData.image_url,
      published: formData.published,
      category: formData.category,
      author_id: profileId,
    };

    let error;

    if (isEdit && formData.id) {
      const { error: updateError } = await supabase
        .from("blog_posts")
        .update(postData)
        .eq("id", formData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("blog_posts")
        .insert([postData]);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success(
        isEdit ? "Artículo actualizado" : "Artículo creado exitosamente",
      );
      router.push("/admin/blog");
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 max-w-4xl mx-auto pb-20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEdit ? "Editar Artículo" : "Nuevo Artículo"}
          </h2>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Guardar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Título
            </label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Técnicas para manejar la ansiedad"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg font-medium outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Resumen (Excerpt)
            </label>
            <textarea
              required
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              placeholder="Breve descripción que aparecerá en la página principal del blog..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Contenido del Artículo
            </label>
            <textarea
              required
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={20}
              placeholder="Puedes usar código HTML básico para estilos (<b>negrita</b>, <h2>títulos</h2>, etc) o simplemente separar por párrafos..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 mt-1">
              Nota: Para separar párrafos en este editor básico, usa doble salto
              de línea.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Ajustes Generales
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  URL Amigable (Slug)
                </label>
                <input
                  required
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Categoría
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
                >
                  <option value="">Selecciona una categoría...</option>
                  <option value="ansiedad">Ansiedad</option>
                  <option value="depresion">Depresión</option>
                  <option value="pareja">Terapia de Pareja</option>
                  <option value="duelo">Duelo</option>
                  <option value="autoestima">Autoestima</option>
                  <option value="infantil">Infantil y Adolescente</option>
                  <option value="general">Recomendaciones Generales</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer mt-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
                />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Publicar de inmediato
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Imagen Destacada
            </h3>

            <div className="flex flex-col gap-4">
              {formData.image_url ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100">
                  <Image
                    src={formData.image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, image_url: "" }))
                    }
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                  >
                    X
                  </button>
                </div>
              ) : (
                <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                  <span className="text-sm font-bold text-slate-500">
                    Subir imagen
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}

              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-wider">
                  o pega una URL
                </p>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://images.unsplash..."
                  className="w-full mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
