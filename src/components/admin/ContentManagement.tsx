
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Save, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ContentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    slug: "",
    meta_description: "",
    is_published: true,
    sort_order: 0
  });

  // Fetch all pages
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['pages-content-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages_content')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Load selected page data
  useEffect(() => {
    if (selectedPageId && pages.length > 0) {
      const page = pages.find(p => p.id === selectedPageId);
      if (page) {
        setFormData({
          title: page.title,
          content: page.content,
          slug: page.slug,
          meta_description: page.meta_description || "",
          is_published: page.is_published,
          sort_order: page.sort_order || 0
        });
      }
    }
  }, [selectedPageId, pages]);

  // Create new page mutation
  const createPageMutation = useMutation({
    mutationFn: async (pageData: typeof formData) => {
      const { error } = await supabase
        .from('pages_content')
        .insert([pageData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Página creada",
        description: "La nueva página se ha creado correctamente."
      });
      queryClient.invalidateQueries({ queryKey: ['pages-content-admin'] });
      queryClient.invalidateQueries({ queryKey: ['pages-content'] });
      setIsCreating(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la página.",
        variant: "destructive"
      });
      console.error("Error creating page:", error);
    }
  });

  // Update page mutation
  const updatePageMutation = useMutation({
    mutationFn: async (pageData: typeof formData) => {
      const { error } = await supabase
        .from('pages_content')
        .update(pageData)
        .eq('id', selectedPageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Página actualizada",
        description: "Los cambios se han guardado correctamente."
      });
      queryClient.invalidateQueries({ queryKey: ['pages-content-admin'] });
      queryClient.invalidateQueries({ queryKey: ['pages-content'] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive"
      });
      console.error("Error updating page:", error);
    }
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      const { error } = await supabase
        .from('pages_content')
        .delete()
        .eq('id', pageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Página eliminada",
        description: "La página se ha eliminado correctamente."
      });
      queryClient.invalidateQueries({ queryKey: ['pages-content-admin'] });
      queryClient.invalidateQueries({ queryKey: ['pages-content'] });
      setSelectedPageId(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la página.",
        variant: "destructive"
      });
      console.error("Error deleting page:", error);
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      slug: "",
      meta_description: "",
      is_published: true,
      sort_order: 0
    });
    setSelectedPageId(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim() || !formData.slug.trim()) {
      toast({
        title: "Error",
        description: "El título, contenido y slug son obligatorios.",
        variant: "destructive"
      });
      return;
    }

    if (isCreating) {
      createPageMutation.mutate(formData);
    } else {
      updatePageMutation.mutate(formData);
    }
  };

  const handleDelete = (pageId: string) => {
    const confirmed = confirm("¿Estás seguro de que quieres eliminar esta página?");
    if (confirmed) {
      deletePageMutation.mutate(pageId);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: isCreating ? generateSlug(title) : prev.slug
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando páginas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pages List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Gestión de Páginas
              </CardTitle>
              <CardDescription>
                Administra todas las páginas del sitio web
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Página
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{page.title}</h3>
                    <Badge variant={page.is_published ? "default" : "secondary"}>
                      {page.is_published ? "Publicada" : "Borrador"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">/{page.slug}</p>
                  <p className="text-xs text-gray-500 mt-1">{page.meta_description}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedPageId(page.id);
                      setIsEditing(true);
                      setIsCreating(false);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(page.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor Form */}
      {(isEditing || isCreating) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? "Crear Nueva Página" : "Editar Página"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Título de la página"
                />
              </div>
              
              <div>
                <Label htmlFor="slug">URL (Slug) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-de-la-pagina"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="meta_description">Meta Descripción</Label>
              <Input
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="Descripción para SEO (opcional)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
              />
              <Label htmlFor="is_published">Página publicada</Label>
            </div>

            <div>
              <Label htmlFor="sort_order">Orden</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Contenido (HTML) *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={15}
                placeholder="Contenido HTML de la página"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes usar HTML básico como &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                disabled={createPageMutation.isPending || updatePageMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {createPageMutation.isPending || updatePageMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
                disabled={createPageMutation.isPending || updatePageMutation.isPending}
              >
                Cancelar
              </Button>
            </div>

            {/* Preview */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Vista Previa</h4>
              <div className="border rounded-lg p-4 bg-gray-50">
                <h1 className="text-2xl font-bold mb-4">{formData.title}</h1>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentManagement;
