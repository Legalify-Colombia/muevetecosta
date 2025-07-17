
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send } from "lucide-react";

interface ProjectCommentsProps {
  projectId: string;
}

const ProjectComments = ({ projectId }: ProjectCommentsProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  // Obtener comentarios del proyecto
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['project-comments', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_comments')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Crear comentario
  const createCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!user?.id) throw new Error("Usuario no autenticado");
      
      const { error } = await supabase
        .from('project_comments')
        .insert({
          project_id: projectId,
          professor_id: user.id,
          comment
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Comentario enviado",
        description: "Tu comentario se ha añadido al proyecto."
      });
      queryClient.invalidateQueries({ queryKey: ['project-comments', projectId] });
      setNewComment("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo enviar el comentario.",
        variant: "destructive"
      });
      console.error("Error creating comment:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment.trim());
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Comentarios del Proyecto</h3>
        <p className="text-muted-foreground">
          Colabora y comunícate con el equipo del proyecto
        </p>
      </div>

      {/* Formulario para nuevo comentario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Añadir Comentario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu comentario sobre el proyecto..."
              rows={3}
              required
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={createCommentMutation.isPending || !newComment.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {createCommentMutation.isPending ? "Enviando..." : "Enviar Comentario"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Comentarios */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando comentarios...</p>
            </div>
          </CardContent>
        </Card>
      ) : comments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay comentarios</h3>
            <p className="text-muted-foreground">
              Sé el primero en comentar en este proyecto
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(comment.profiles?.full_name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.profiles?.full_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectComments;
