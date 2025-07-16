import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter, Eye, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ApplicationsListProps {
  onViewApplication: (applicationId: string) => void;
}

export const ApplicationsList = ({ onViewApplication }: ApplicationsListProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: myUniversity } = useQuery({
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

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['coordinator-applications', myUniversity?.id, statusFilter, searchTerm],
    queryFn: async () => {
      if (!myUniversity?.id) return [];
      
      let query = supabase
        .from('mobility_applications')
        .select(`
          *,
          profiles!mobility_applications_student_id_fkey(full_name, document_number),
          academic_programs(name)
        `)
        .eq('destination_university_id', myUniversity.id)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter by search term if provided
      if (searchTerm) {
        return data.filter(app => 
          app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.profiles?.document_number?.includes(searchTerm)
        );
      }
      
      return data;
    },
    enabled: !!myUniversity?.id
  });

  // Separate query to get student info for applications
  const { data: studentInfoMap = {} } = useQuery({
    queryKey: ['student-info-map', applications.map(app => app.student_id)],
    queryFn: async () => {
      if (applications.length === 0) return {};
      
      const studentIds = applications.map(app => app.student_id).filter(Boolean);
      if (studentIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('student_info')
        .select('*')
        .in('id', studentIds);
      
      if (error) throw error;
      
      // Convert to map for easy lookup
      const infoMap: Record<string, any> = {};
      data.forEach(info => {
        infoMap[info.id] = info;
      });
      
      return infoMap;
    },
    enabled: applications.length > 0
  });

  const exportApplicationsToCSV = () => {
    if (applications.length === 0) return;

    const csvData = [
      [
        'Número de Postulación',
        'Fecha de Postulación',
        'Estado',
        'Nombre del Estudiante',
        'Documento',
        'Universidad de Origen',
        'Programa Actual',
        'Programa de Destino',
        'Semestre Actual',
        'Director Académico',
        'Email Director'
      ]
    ];

    applications.forEach(app => {
      const studentInfo = studentInfoMap[app.student_id || ''];
      csvData.push([
        app.application_number || '',
        new Date(app.created_at).toLocaleDateString('es-ES'),
        getStatusText(app.status),
        app.profiles?.full_name || '',
        `${app.profiles?.document_type?.toUpperCase()} ${app.profiles?.document_number}`,
        studentInfo?.origin_university || '',
        studentInfo?.academic_program || '',
        app.academic_programs?.name || '',
        studentInfo?.current_semester?.toString() || '',
        studentInfo?.academic_director_name || '',
        studentInfo?.academic_director_email || ''
      ]);
    });

    const csvContent = csvData.map(row => 
      row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `postulaciones_movilidad_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_review':
        return "bg-yellow-100 text-yellow-800";
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-blue-100 text-blue-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      case 'completed':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_review':
        return "En Revisión";
      case 'approved':
        return "Aprobado";
      case 'pending':
        return "Pendiente";
      case 'rejected':
        return "Rechazado";
      case 'completed':
        return "Completado";
      default:
        return status;
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    inReview: applications.filter(app => app.status === 'in_review').length,
    approved: applications.filter(app => app.status === 'approved').length,
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Postulaciones de Movilidad
            </CardTitle>
            <CardDescription>
              Gestiona las solicitudes de movilidad estudiantil a tu universidad
            </CardDescription>
          </div>
          <Button onClick={exportApplicationsToCSV} variant="outline" disabled={applications.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{stats.inReview}</p>
            <p className="text-sm text-gray-600">En Revisión</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-gray-600">Aprobadas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, número de documento o radicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="in_review">En Revisión</SelectItem>
                <SelectItem value="approved">Aprobadas</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applications List */}
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => {
              const studentInfo = studentInfoMap[app.student_id || ''];
              
              return (
                <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-lg">{app.application_number}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(app.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <Badge className={getStatusColor(app.status)} variant="secondary">
                        {getStatusText(app.status)}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onViewApplication(app.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        <strong>Estudiante:</strong> {app.profiles?.full_name || 'No disponible'}
                      </p>
                      <p className="text-gray-600">
                        <strong>Documento:</strong> {app.profiles?.document_number || 'No disponible'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <strong>Universidad de Origen:</strong> {studentInfo?.origin_university || 'No disponible'}
                      </p>
                      <p className="text-gray-600">
                        <strong>Programa de Destino:</strong> {app.academic_programs?.name || 'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron postulaciones con los filtros aplicados'
                : 'No hay postulaciones recibidas aún'
              }
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                className="mt-2"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
