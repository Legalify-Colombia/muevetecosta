import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Save, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UniversityRequiredDocuments } from "./UniversityRequiredDocuments";

export const UniversityProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    website: "",
  });

  const { data: university, isLoading } = useQuery({
    queryKey: ['coordinator-university', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('coordinator_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const updateUniversityMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!university?.id) throw new Error('No university found');
      
      const { error } = await supabase
        .from('universities')
        .update(data)
        .eq('id', university.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinator-university'] });
      setIsEditing(false);
      toast({
        title: "Universidad actualizada",
        description: "La información de la universidad se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la información de la universidad.",
        variant: "destructive",
      });
    }
  });

  const handleEdit = () => {
    if (university) {
      setFormData({
        name: university.name || "",
        description: university.description || "",
        address: university.address || "",
        city: university.city || "",
        phone: university.phone || "",
        email: university.email || "",
        website: university.website || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateUniversityMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      website: "",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!university) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Perfil Universitario
          </CardTitle>
          <CardDescription>
            No se encontró información de la universidad
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Gestión Universitaria
          </CardTitle>
          <CardDescription>
            Administra la información y configuración de tu universidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Información General
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos Específicos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Información de la Universidad</h3>
                {!isEditing && (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    Editar
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre de la Universidad</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={updateUniversityMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {updateUniversityMutation.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nombre</p>
                      <p className="text-lg">{university.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ciudad</p>
                      <p>{university.city || 'No especificada'}</p>
                    </div>
                  </div>
                  
                  {university.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Descripción</p>
                      <p className="mt-1">{university.description}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Teléfono</p>
                      <p>{university.phone || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p>{university.email || 'No especificado'}</p>
                    </div>
                  </div>

                  {university.website && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sitio Web</p>
                      <a href={university.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline">
                        {university.website}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <UniversityRequiredDocuments universityId={university.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
