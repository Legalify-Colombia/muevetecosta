
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Save } from "lucide-react";

const ContentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: termsData, isLoading } = useQuery({
    queryKey: ['terms-content-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('terms_content')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Use useEffect to handle successful data loading
  useEffect(() => {
    if (termsData) {
      setTitle(termsData.title);
      setContent(termsData.content);
    }
  }, [termsData]);

  const updateTermsMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { error } = await supabase
        .from('terms_content')
        .update({ title, content })
        .eq('id', termsData?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Términos actualizados",
        description: "Los términos y condiciones se han actualizado correctamente."
      });
      queryClient.invalidateQueries({ queryKey: ['terms-content-admin'] });
      queryClient.invalidateQueries({ queryKey: ['terms-content'] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los términos y condiciones.",
        variant: "destructive"
      });
      console.error("Error updating terms:", error);
    }
  });

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "El título y contenido son obligatorios.",
        variant: "destructive"
      });
      return;
    }
    updateTermsMutation.mutate({ title, content });
  };

  const handleCancel = () => {
    if (termsData) {
      setTitle(termsData.title);
      setContent(termsData.content);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando contenido...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Gestión de Términos y Condiciones
          </CardTitle>
          <CardDescription>
            Administra el contenido de la página de términos y condiciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!isEditing}
                placeholder="Título de la página"
              />
            </div>
            
            <div>
              <Label htmlFor="content">Contenido (HTML)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={!isEditing}
                rows={15}
                placeholder="Contenido HTML de los términos y condiciones"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes usar HTML básico como &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Editar Contenido
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleSave}
                  disabled={updateTermsMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateTermsMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={updateTermsMutation.isPending}
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>

          {termsData?.updated_at && (
            <div className="text-sm text-gray-500 pt-4 border-t">
              <p>
                Última actualización: {new Date(termsData.updated_at).toLocaleDateString('es-ES')} a las {new Date(termsData.updated_at).toLocaleTimeString('es-ES')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vista Previa</CardTitle>
          <CardDescription>
            Así se verá el contenido en la página pública
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <h1 className="text-2xl font-bold mb-4">{title}</h1>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManagement;
