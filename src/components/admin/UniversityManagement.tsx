import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Building, Plus, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const universitySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(2, "La ciudad es requerida"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
});

type UniversityFormData = z.infer<typeof universitySchema>;

export const UniversityManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UniversityFormData>({
    resolver: zodResolver(universitySchema),
  });

  // Fetch universities with coordinator info
  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['admin-universities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select(`
          *,
          profiles!coordinator_id(full_name, document_number, phone),
          academic_programs(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create university mutation
  const createUniversityMutation = useMutation({
    mutationFn: async (data: UniversityFormData) => {
      const universityData = {
        name: data.name,
        description: data.description || null,
        address: data.address || null,
        city: data.city,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
      };

      const { data: university, error } = await supabase
        .from('universities')
        .insert([universityData])
        .select()
        .single();

      if (error) throw error;
      return university;
    },
    onSuccess: () => {
      toast({
        title: "Universidad creada",
        description: "La universidad ha sido creada exitosamente",
      });
      setShowCreateDialog(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-universities'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear la universidad",
        variant: "destructive",
      });
    }
  });

  // Update university mutation
  const updateUniversityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UniversityFormData }) => {
      const universityData = {
        name: data.name,
        description: data.description || null,
        address: data.address || null,
        city: data.city,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
      };

      const { data: university, error } = await supabase
        .from('universities')
        .update(universityData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return university;
    },
    onSuccess: () => {
      toast({
        title: "Universidad actualizada",
        description: "La universidad ha sido actualizada exitosamente",
      });
      setEditingUniversity(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-universities'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la universidad",
        variant: "destructive",
      });
    }
  });

  // Toggle university status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase
        .from('universities')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado de la universidad ha sido actualizado",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-universities'] });
    }
  });

  const onSubmit = (data: UniversityFormData) => {
    if (editingUniversity) {
      updateUniversityMutation.mutate({ id: editingUniversity.id, data });
    } else {
      createUniversityMutation.mutate(data);
    }
  };

  const handleEdit = (university: any) => {
    setEditingUniversity(university);
    form.reset({
      name: university.name,
      description: university.description || "",
      address: university.address || "",
      city: university.city || "",
      phone: university.phone || "",
      email: university.email || "",
      website: university.website || "",
    });
  };

  const handleToggleStatus = (university: any) => {
    toggleStatusMutation.mutate({
      id: university.id,
      is_active: !university.is_active
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Universidades</h2>
          <p className="text-gray-600">Administra las universidades del programa</p>
        </div>
        <Dialog 
          open={showCreateDialog || !!editingUniversity} 
          onOpenChange={(open) => {
            if (!open) {
              setShowCreateDialog(false);
              setEditingUniversity(null);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Universidad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingUniversity ? "Editar Universidad" : "Nueva Universidad"}
              </DialogTitle>
              <DialogDescription>
                {editingUniversity 
                  ? "Modifica la información de la universidad"
                  : "Añade una nueva universidad al programa"
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Nombre de la Universidad</FormLabel>
                        <FormControl>
                          <Input placeholder="Universidad Nacional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input placeholder="Cartagena" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+57 5 123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contacto@universidad.edu.co" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sitio Web</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.universidad.edu.co" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Calle 123 #45-67" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Breve descripción de la universidad..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createUniversityMutation.isPending || updateUniversityMutation.isPending}
                  >
                    {(createUniversityMutation.isPending || updateUniversityMutation.isPending) 
                      ? "Guardando..." 
                      : (editingUniversity ? "Actualizar" : "Crear Universidad")
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Universities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Universidades Registradas</CardTitle>
          <CardDescription>
            Lista de todas las universidades del programa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando universidades...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Universidad</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Coordinador</TableHead>
                  <TableHead>Programas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {universities.map((university) => (
                  <TableRow key={university.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{university.name}</div>
                        <div className="text-sm text-gray-500">{university.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{university.city}</TableCell>
                    <TableCell>
                      {university.profiles ? (
                        <div>
                          <div className="font-medium">{university.profiles.full_name}</div>
                          <div className="text-sm text-gray-500">{university.profiles.phone}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {university.academic_programs?.length || 0} programas
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={university.is_active}
                          onCheckedChange={() => handleToggleStatus(university)}
                          disabled={toggleStatusMutation.isPending}
                        />
                        <Badge 
                          variant={university.is_active ? "default" : "secondary"}
                          className={university.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {university.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(university)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
