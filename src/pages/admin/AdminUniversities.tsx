
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardHeader from "@/components/common/DashboardHeader";
import DashboardSidebar from "@/components/common/DashboardSidebar";
import { Search, Building, Plus, Filter, Edit, Eye, TrendingUp, MapPin, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminUniversities = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [showCreateUniversity, setShowCreateUniversity] = useState(false);
  const [showEditUniversity, setShowEditUniversity] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);

  const { data: universities = [], isLoading } = useQuery({
    queryKey: ['admin-universities', searchQuery, countryFilter],
    queryFn: async () => {
      let query = supabase
        .from('universities')
        .select(`
          *,
          profiles!universities_coordinator_id_fkey (
            full_name
          ),
          academic_programs (
            id
          )
        `);
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  const stats = {
    total: universities.length,
    active: universities.filter(u => u.is_active).length,
    totalPrograms: universities.reduce((acc, u) => acc + (u.academic_programs?.length || 0), 0),
    avgPrograms: universities.length > 0 ? 
      Math.round(universities.reduce((acc, u) => acc + (u.academic_programs?.length || 0), 0) / universities.length * 10) / 10 : 0
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title="Gestión de Universidades"
        searchPlaceholder="Buscar universidades..."
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
                  Gestión de Universidades
                </h1>
                <p className="text-muted-foreground">
                  Administra las universidades participantes en el programa de movilidad
                </p>
              </div>
              <Button onClick={() => setShowCreateUniversity(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Universidad
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Universidades Activas</p>
                      <p className="text-3xl font-bold text-primary">{stats.active}</p>
                      <div className="flex items-center space-x-1 text-sm text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Red activa</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Universidades</p>
                      <p className="text-3xl font-bold text-primary">{stats.total}</p>
                      <div className="flex items-center space-x-1 text-sm text-blue-600 mt-1">
                        <span>En la plataforma</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Total
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Programas Académicos</p>
                      <p className="text-3xl font-bold text-primary">{stats.totalPrograms}</p>
                      <div className="flex items-center space-x-1 text-sm text-purple-600 mt-1">
                        <span>Promedio: {stats.avgPrograms} por uni</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Programas
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Con Coordinador</p>
                      <p className="text-3xl font-bold text-primary">
                        {universities.filter(u => u.coordinator_id).length}
                      </p>
                      <div className="flex items-center space-x-1 text-sm text-orange-600 mt-1">
                        <Users className="h-3 w-3" />
                        <span>Asignados</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      Activas
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
                      placeholder="Buscar por nombre, ciudad o país..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Países</SelectItem>
                      <SelectItem value="colombia">Colombia</SelectItem>
                      <SelectItem value="mexico">México</SelectItem>
                      <SelectItem value="brasil">Brasil</SelectItem>
                      <SelectItem value="argentina">Argentina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Universities Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Lista de Universidades
                </CardTitle>
                <CardDescription>
                  Todas las universidades registradas en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Universidad</TableHead>
                        <TableHead>Ubicación</TableHead>
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
                              <p className="font-medium">{university.name}</p>
                              <p className="text-sm text-muted-foreground">{university.website}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{university.city}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {university.profiles ? (
                              <div>
                                <p className="text-sm font-medium">{university.profiles.full_name}</p>
                                <Badge variant="outline" className="text-xs">Asignado</Badge>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Sin asignar</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{university.academic_programs?.length || 0}</span>
                              <span className="text-sm text-muted-foreground">programas</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={university.is_active ? "default" : "secondary"}>
                              {university.is_active ? "Activa" : "Inactiva"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedUniversity(university);
                                  setShowEditUniversity(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {universities.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay universidades</h3>
                    <p className="text-muted-foreground mb-4">
                      No se encontraron universidades que coincidan con los criterios de búsqueda
                    </p>
                    <Button onClick={() => setShowCreateUniversity(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear la primera universidad
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Dialog para crear universidad */}
      <Dialog open={showCreateUniversity} onOpenChange={setShowCreateUniversity}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nueva Universidad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre de la Universidad</Label>
                <Input id="name" placeholder="Ingrese el nombre completo" />
              </div>
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" placeholder="Ciudad donde se ubica" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" placeholder="Descripción de la universidad" rows={3} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Sitio Web</Label>
                <Input id="website" placeholder="https://www.universidad.edu" />
              </div>
              <div>
                <Label htmlFor="email">Email Institucional</Label>
                <Input id="email" placeholder="contacto@universidad.edu" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" placeholder="Dirección física de la universidad" />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateUniversity(false)}>
                Cancelar
              </Button>
              <Button>
                Crear Universidad
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar universidad */}
      <Dialog open={showEditUniversity} onOpenChange={setShowEditUniversity}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Universidad</DialogTitle>
          </DialogHeader>
          {selectedUniversity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_name">Nombre de la Universidad</Label>
                  <Input 
                    id="edit_name" 
                    defaultValue={selectedUniversity.name}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_city">Ciudad</Label>
                  <Input 
                    id="edit_city" 
                    defaultValue={selectedUniversity.city || ''}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit_description">Descripción</Label>
                <Textarea 
                  id="edit_description" 
                  defaultValue={selectedUniversity.description || ''}
                  rows={3} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_website">Sitio Web</Label>
                  <Input 
                    id="edit_website" 
                    defaultValue={selectedUniversity.website || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email</Label>
                  <Input 
                    id="edit_email" 
                    defaultValue={selectedUniversity.email || ''}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  defaultChecked={selectedUniversity.is_active}
                />
                <Label htmlFor="edit_is_active">Universidad activa</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditUniversity(false)}>
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

export default AdminUniversities;
