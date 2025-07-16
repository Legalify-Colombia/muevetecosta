
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { User, UserPlus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const coordinatorSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  document_number: z.string().min(5, "Número de documento requerido"),
  phone: z.string().optional(),
  university_id: z.string().min(1, "Selecciona una universidad"),
});

type CoordinatorFormData = z.infer<typeof coordinatorSchema>;

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showCreateCoordinator, setShowCreateCoordinator] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CoordinatorFormData>({
    resolver: zodResolver(coordinatorSchema),
  });

  // Fetch users with profiles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, selectedRole],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          universities!coordinator_id(name)
        `);

      if (selectedRole !== 'all') {
        query = query.eq('role', selectedRole);
      }

      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch universities for coordinator assignment
  const { data: universities = [] } = useQuery({
    queryKey: ['universities-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  // Create coordinator mutation
  const createCoordinatorMutation = useMutation({
    mutationFn: async (data: CoordinatorFormData) => {
      // First create the user in auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: 'TempPassword123!', // Temporary password
        email_confirm: true,
        user_metadata: {
          full_name: data.full_name,
          document_number: data.document_number,
          phone: data.phone,
          role: 'coordinator'
        }
      });

      if (authError) throw authError;

      // Update the university with the new coordinator
      const { error: universityError } = await supabase
        .from('universities')
        .update({ coordinator_id: authUser.user.id })
        .eq('id', data.university_id);

      if (universityError) throw universityError;

      return authUser;
    },
    onSuccess: () => {
      toast({
        title: "Coordinador creado",
        description: "El coordinador ha sido creado exitosamente",
      });
      setShowCreateCoordinator(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear el coordinador",
        variant: "destructive",
      });
    }
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'coordinator': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'coordinator': return 'Coordinador';
      case 'student': return 'Estudiante';
      default: return role;
    }
  };

  const onSubmitCoordinator = (data: CoordinatorFormData) => {
    createCoordinatorMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-gray-600">Administra coordinadores y estudiantes</p>
        </div>
        <Dialog open={showCreateCoordinator} onOpenChange={setShowCreateCoordinator}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Coordinador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Coordinador</DialogTitle>
              <DialogDescription>
                Crea un coordinador y asígnalo a una universidad
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitCoordinator)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo" {...field} />
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
                        <Input type="email" placeholder="email@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="document_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Documento</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" {...field} />
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
                      <FormLabel>Teléfono (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+57 300 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="university_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Universidad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una universidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {universities.map((university) => (
                            <SelectItem key={university.id} value={university.id}>
                              {university.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createCoordinatorMutation.isPending}
                  >
                    {createCoordinatorMutation.isPending ? "Creando..." : "Crear Coordinador"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="coordinator">Coordinadores</SelectItem>
                <SelectItem value="student">Estudiantes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            Lista de todos los usuarios registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando usuarios...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Universidad Asignada</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.document_number}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
                        {getRoleText(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.universities?.[0]?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
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
