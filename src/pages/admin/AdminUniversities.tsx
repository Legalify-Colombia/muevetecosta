
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UniversityManagement } from "@/components/admin/UniversityManagement";
import DashboardHeader from "@/components/common/DashboardHeader";
import DashboardSidebar from "@/components/common/DashboardSidebar";
import { Search, Building, Plus, Filter, TrendingUp } from "lucide-react";

const AdminUniversities = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Universidad
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Universidades Activas</p>
                      <p className="text-3xl font-bold text-primary">28</p>
                      <div className="flex items-center space-x-1 text-sm text-green-600 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>+4 este mes</span>
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
                      <p className="text-sm font-medium text-muted-foreground">Programas Académicos</p>
                      <p className="text-3xl font-bold text-primary">142</p>
                      <div className="flex items-center space-x-1 text-sm text-blue-600 mt-1">
                        <span>Promedio: 5.1 por universidad</span>
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
                      <p className="text-sm font-medium text-muted-foreground">Países Participantes</p>
                      <p className="text-3xl font-bold text-primary">12</p>
                      <div className="flex items-center space-x-1 text-sm text-purple-600 mt-1">
                        <span>Red Internacional</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Global
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
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* University Management Component */}
          <UniversityManagement />
        </main>
      </div>
    </div>
  );
};

export default AdminUniversities;
