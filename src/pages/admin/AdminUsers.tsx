
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import DashboardHeader from "@/components/common/DashboardHeader";
import DashboardSidebar from "@/components/common/DashboardSidebar";
import { Search, Users, UserPlus, Filter, Edit, Eye, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminUsers = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', searchQuery, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          student_info (
            origin_university,
            academic_program
          )
        `);
      
      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,document_number.ilike.%${searchQuery}%`);
      }
      
      if (roleFilter !== "all") {
        query = query.eq('role', roleFilter);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    professors: users.filter(u => u.role === 'professor').length,
    coordinators: users.filter(u => u.role === 'coordinator').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'admin': { label: 'Administrador', variant: 'default' as const },
      'coordinator': { label: 'Coordinador', variant: 'secondary' as const },
      'professor': { label: 'Profesor', variant: 'outline' as const },
      'student': { label: 'Estudiante', variant: 'secondary' as const }
    };
    
    const roleInfo = roleMap[role as keyof typeof roleMap] || roleMap.student;
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Gestión de Usuarios"
        searchPlaceholder="Buscar usuarios..."
      />
      
      <div className="flex">
        <DashboardSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Gestión de Usuarios
                </h1>
                <p className="text-muted-foreground">
                  Administra los usuarios del sistema de movilidad estudiantil
                </p>
              </div>
              <Button onClick={() => setShowCreateUser(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                      <p className="text-3xl font-bold text-primary">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estudiantes</p>
                      <p className="text-3xl font-bold text-primary">{stats.students}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {Math.round((stats.students / stats.total) * 100)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Profesores</p>
                      <p className="text-3xl font-bold text-primary">{stats.professors}</p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {Math.round((stats.professors / stats.total) * 100)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Coordinadores</p>
                      <p className="text-3xl font-bold text-primary">{stats.coordinators}</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {Math.round((stats.coordinators / stats.total) * 100)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Búsqueda y Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar por nombre, email o documento..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Roles</SelectItem>
                      <SelectItem value="student">Estudiantes</SelectItem>
                      <SelectItem value="professor">Profesores</SelectItem>
                      <SelectItem value="coordinator">Coordinadores</SelectItem>
                      <SelectItem value="admin">Administradores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Lista de Usuarios
                </CardTitle>
                <CardDescription>
                  Todos los usuarios registrados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Universidad/Programa</TableHead>
                        <TableHead>Fecha Registro</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-muted-foreground">{user.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-mono text-sm">{user.document_number}</p>
                              <p className="text-xs text-muted-foreground uppercase">{user.document_type}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getRoleBadge(user.role)}
                          </TableCell>
                          <TableCell>
                            {user.role === 'student' && user.student_info ? (
                              <div>
                                <p className="text-sm font-medium">{user.student_info.origin_university}</p>
                                <p className="text-xs text-muted-foreground">{user.student_info.academic_program}</p>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {user.role === 'student' ? 'Sin asignar' : 'N/A'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowEditUser(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user.role === 'student' && (
                                <Button variant="outline" size="sm" title="Asignar Universidad" >
                                  <Building className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {users.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay usuarios</h3>
                    <p className="text-muted-foreground">
                      No se encontraron usuarios que coincidan con los criterios de búsqueda
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Dialog para crear usuario */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input id="full_name" placeholder="Ingrese el nombre completo" />
            </div>
            <div>
              <Label htmlFor="document_number">Número de Documento</Label>
              <Input id="document_number" placeholder="Ingrese el número de documento" />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="professor">Profesor</SelectItem>
                  <SelectItem value="coordinator">Coordinador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancelar
              </Button>
              <Button>
                Crear Usuario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar usuario */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_full_name">Nombre Completo</Label>
                <Input 
                  id="edit_full_name" 
                  defaultValue={selectedUser.full_name}
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Teléfono</Label>
                <Input 
                  id="edit_phone" 
                  defaultValue={selectedUser.phone || ''}
                />
              </div>
              <div>
                <Label htmlFor="edit_role">Rol</Label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Estudiante</SelectItem>
                    <SelectItem value="professor">Profesor</SelectItem>
                    <SelectItem value="coordinator">Coordinador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditUser(false)}>
                  Cancelar
                </Button>
                <Button>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
