
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, Plus, X } from "lucide-react";

const ProfessorProfile = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    university: "",
    faculty_department: "",
    expertise_areas: [] as string[],
    research_interests: "",
    relevant_publications: [] as Array<{ title: string; year: string; url?: string }>,
    project_experience: "",
    cv_url: "",
    profile_photo_url: ""
  });
  
  const [newExpertiseArea, setNewExpertiseArea] = useState("");
  const [newPublication, setNewPublication] = useState({ title: "", year: "", url: "" });

  // Obtener información del profesor
  const { data: professorInfo, isLoading } = useQuery({
    queryKey: ['professor-info', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('professor_info')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Actualizar formulario cuando se cargan los datos
  useEffect(() => {
    if (professorInfo) {
      setFormData({
        university: professorInfo.university || "",
        faculty_department: professorInfo.faculty_department || "",
        expertise_areas: professorInfo.expertise_areas || [],
        research_interests: professorInfo.research_interests || "",
        relevant_publications: professorInfo.relevant_publications || [],
        project_experience: professorInfo.project_experience || "",
        cv_url: professorInfo.cv_url || "",
        profile_photo_url: professorInfo.profile_photo_url || ""
      });
    }
  }, [professorInfo]);

  // Mutación para actualizar/crear perfil del profesor
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error("Usuario no autenticado");
      
      const { error } = await supabase
        .from('professor_info')
        .upsert({
          id: user.id,
          ...data
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido guardada correctamente."
      });
      queryClient.invalidateQueries({ queryKey: ['professor-info', user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive"
      });
      console.error("Error updating professor profile:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const addExpertiseArea = () => {
    if (newExpertiseArea.trim()) {
      setFormData(prev => ({
        ...prev,
        expertise_areas: [...prev.expertise_areas, newExpertiseArea.trim()]
      }));
      setNewExpertiseArea("");
    }
  };

  const removeExpertiseArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.filter((_, i) => i !== index)
    }));
  };

  const addPublication = () => {
    if (newPublication.title.trim() && newPublication.year.trim()) {
      setFormData(prev => ({
        ...prev,
        relevant_publications: [...prev.relevant_publications, newPublication]
      }));
      setNewPublication({ title: "", year: "", url: "" });
    }
  };

  const removePublication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      relevant_publications: prev.relevant_publications.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando perfil...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>
            Información básica de contacto y afiliación institucional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                value={profile?.full_name || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Para cambiar tu nombre, contacta al administrador
              </p>
            </div>
            
            <div>
              <Label htmlFor="university">Universidad</Label>
              <Input
                id="university"
                value={formData.university}
                onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                placeholder="Nombre de tu universidad"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="faculty_department">Facultad/Departamento</Label>
            <Input
              id="faculty_department"
              value={formData.faculty_department}
              onChange={(e) => setFormData(prev => ({ ...prev, faculty_department: e.target.value }))}
              placeholder="Ej. Facultad de Ingeniería, Departamento de Sistemas"
            />
          </div>
        </CardContent>
      </Card>

      {/* Información Académica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Académica y de Investigación</CardTitle>
          <CardDescription>
            Detalles sobre tu experiencia y áreas de especialización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Áreas de Experticia */}
          <div>
            <Label>Áreas de Experticia</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newExpertiseArea}
                onChange={(e) => setNewExpertiseArea(e.target.value)}
                placeholder="Ej. Inteligencia Artificial, Biotecnología"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertiseArea())}
              />
              <Button type="button" onClick={addExpertiseArea} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.expertise_areas.map((area, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {area}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeExpertiseArea(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Intereses de Investigación */}
          <div>
            <Label htmlFor="research_interests">Intereses de Investigación</Label>
            <Textarea
              id="research_interests"
              value={formData.research_interests}
              onChange={(e) => setFormData(prev => ({ ...prev, research_interests: e.target.value }))}
              placeholder="Describe tus líneas de investigación actuales o futuras..."
              rows={4}
            />
          </div>

          {/* Publicaciones Relevantes */}
          <div>
            <Label>Publicaciones Relevantes</Label>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
              <Input
                className="md:col-span-6"
                value={newPublication.title}
                onChange={(e) => setNewPublication(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título de la publicación"
              />
              <Input
                className="md:col-span-2"
                value={newPublication.year}
                onChange={(e) => setNewPublication(prev => ({ ...prev, year: e.target.value }))}
                placeholder="Año"
              />
              <Input
                className="md:col-span-3"
                value={newPublication.url}
                onChange={(e) => setNewPublication(prev => ({ ...prev, url: e.target.value }))}
                placeholder="URL (opcional)"
              />
              <Button type="button" onClick={addPublication} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.relevant_publications.map((pub, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{pub.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {pub.year} {pub.url && `• ${pub.url}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePublication(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Experiencia en Proyectos */}
          <div>
            <Label htmlFor="project_experience">Experiencia en Proyectos</Label>
            <Textarea
              id="project_experience"
              value={formData.project_experience}
              onChange={(e) => setFormData(prev => ({ ...prev, project_experience: e.target.value }))}
              placeholder="Describe tu experiencia previa en proyectos de investigación..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documentos y Multimedia */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos y Multimedia</CardTitle>
          <CardDescription>
            Currículum vitae y foto de perfil profesional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cv_url">URL del Currículum Vitae (PDF)</Label>
            <Input
              id="cv_url"
              type="url"
              value={formData.cv_url}
              onChange={(e) => setFormData(prev => ({ ...prev, cv_url: e.target.value }))}
              placeholder="https://ejemplo.com/mi-cv.pdf"
            />
          </div>

          <div>
            <Label htmlFor="profile_photo_url">URL de Foto de Perfil</Label>
            <Input
              id="profile_photo_url"
              type="url"
              value={formData.profile_photo_url}
              onChange={(e) => setFormData(prev => ({ ...prev, profile_photo_url: e.target.value }))}
              placeholder="https://ejemplo.com/mi-foto.jpg"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateProfileMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateProfileMutation.isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
};

export default ProfessorProfile;
