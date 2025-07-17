import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/common/Header";
import { useAuth } from "@/hooks/useAuth";

interface PageContent {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string | null;
  is_published: boolean;
  sort_order: number | null;
}

interface PagesContentProps {
  pages: PageContent[];
}

const ContentManagement = () => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [metaDescription, setMetaDescription] = useState<string | null>("");
  const [isPublished, setIsPublished] = useState(false);
  const [sortOrder, setSortOrder] = useState<number | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: pages, isLoading, isError } = useQuery<PageContent[]>("pages", async () => {
    const { data, error } = await supabase
      .from("pages_content")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  });

  const createPageMutation = useMutation(
    async () => {
      if (!user?.id) {
        throw new Error("User ID is missing");
      }

      const { data, error } = await supabase.from("pages_content").insert([
        {
          title,
          slug,
          content,
          meta_description: metaDescription,
          is_published: isPublished,
          sort_order: sortOrder,
          last_updated_by: user.id,
        },
      ]);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("pages");
        toast({
          title: "Éxito",
          description: "Página creada correctamente",
        });
        resetForm();
        setIsModalOpen(false);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const updatePageMutation = useMutation(
    async (pageId: string) => {
      if (!user?.id) {
        throw new Error("User ID is missing");
      }

      const { data, error } = await supabase
        .from("pages_content")
        .update({
          title,
          slug,
          content,
          meta_description: metaDescription,
          is_published: isPublished,
          sort_order: sortOrder,
          last_updated_by: user.id,
        })
        .eq("id", pageId);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("pages");
        toast({
          title: "Éxito",
          description: "Página actualizada correctamente",
        });
        resetForm();
        setEditingPageId(null);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const deletePageMutation = useMutation(
    async (pageId: string) => {
      const { data, error } = await supabase.from("pages_content").delete().eq("id", pageId);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("pages");
        toast({
          title: "Éxito",
          description: "Página eliminada correctamente",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  useEffect(() => {
    if (editingPageId && pages) {
      const pageToEdit = pages.find((page) => page.id === editingPageId);
      if (pageToEdit) {
        setTitle(pageToEdit.title);
        setSlug(pageToEdit.slug);
        setContent(pageToEdit.content);
        setMetaDescription(pageToEdit.meta_description || "");
        setIsPublished(pageToEdit.is_published);
        setSortOrder(pageToEdit.sort_order || null);
        setIsModalOpen(true);
      }
    }
  }, [editingPageId, pages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPageId) {
      updatePageMutation.mutate(editingPageId);
    } else {
      createPageMutation.mutate();
    }
  };

  const handleEdit = (pageId: string) => {
    setEditingPageId(pageId);
  };

  const handleDelete = (pageId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta página?")) {
      deletePageMutation.mutate(pageId);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setMetaDescription("");
    setIsPublished(false);
    setSortOrder(null);
    setEditingPageId(null);
  };

  if (isLoading) {
    return <div className="text-center">Cargando páginas...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500">Error al cargar las páginas.</div>;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Gestión de Contenido</CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Página
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {pages && pages.length > 0 ? (
                pages.map((page) => (
                  <div key={page.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{page.title}</h3>
                        <Badge variant="secondary">{page.slug}</Badge>
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(page.id)}
                          disabled={editingPageId !== null}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(page.id)}
                          disabled={deletePageMutation.isLoading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center">No hay páginas creadas.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <CardTitle className="text-lg font-medium">
                  {editingPageId ? "Editar Página" : "Añadir Página"}
                </CardTitle>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Contenido</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaDescription">Meta Descripción</Label>
                    <Input
                      id="metaDescription"
                      type="text"
                      value={metaDescription || ""}
                      onChange={(e) => setMetaDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">Orden de visualización</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={sortOrder !== null ? sortOrder.toString() : ""}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="isPublished">Publicado</Label>
                    <Switch
                      id="isPublished"
                      checked={isPublished}
                      onCheckedChange={(checked) => setIsPublished(checked)}
                    />
                  </div>
                  <div className="items-center space-x-2">
                    <Button type="submit" disabled={createPageMutation.isLoading || updatePageMutation.isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {editingPageId ? "Actualizar" : "Guardar"}
                    </Button>
                    <Button variant="ghost" onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}>
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ContentManagement;
