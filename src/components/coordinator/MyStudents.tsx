import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, GraduationCap, School, Download } from 'lucide-react';

interface MobilityApplication {
  id: string;
  application_number: string;
  status: string;
  created_at: string;
  destination_university: { name: string } | null;
  destination_program: { name: string } | null;
}

interface StudentInfo {
  id: string;
  academic_program: string | null;
  current_semester: number | null;
  origin_university_id: string | null;
  profiles: {
    id: string;
    full_name: string;
    document_number: string;
    role: string;
  } | null;
  origin_university: { id: string; name: string } | null;
  mobility_applications: MobilityApplication[] | null;
}

export const MyStudents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch coordinator's university
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

  // Fetch students from coordinator's university
  const { data: myStudents, isLoading } = useQuery({
    queryKey: ['coordinator-students', myUniversity?.id],
    queryFn: async (): Promise<StudentInfo[]> => {
      if (!myUniversity?.id) return [];
      
      const { data, error } = await supabase
        .from('student_info')
        .select(`
          *,
          profiles!inner(id, full_name, document_number, role),
          origin_university:universities!student_info_origin_university_id_fkey(id, name),
          mobility_applications(
            id,
            application_number,
            status,
            created_at,
            destination_university:universities!mobility_applications_destination_university_id_fkey(name),
            destination_program:academic_programs(name)
          )
        `)
        .eq('origin_university_id', myUniversity.id)
        .eq('profiles.role', 'student');
      
      if (error) throw error;
      return (data as any) || [];
    },
    enabled: !!myUniversity?.id
  });

  const handleDownloadDocument = async (fileUrl: string, fileName: string) => {
    try {
      // Handle different bucket URLs and file formats
      let downloadUrl = fileUrl;
      
      if (fileUrl.includes('supabase.co/storage')) {
        // If it's already a full Supabase storage URL, use as is
        downloadUrl = fileUrl;
      } else if (fileUrl.startsWith('/')) {
        // If it's a relative path, construct the full URL
        const buckets = ['student-documents', 'professor-documents', 'template-documents'];
        let foundUrl = null;
        
        for (const bucket of buckets) {
          try {
            const { data } = await supabase.storage
              .from(bucket)
              .getPublicUrl(fileUrl.replace('/', ''));
            
            // Test if the URL is accessible
            const testResponse = await fetch(data.publicUrl, { method: 'HEAD' });
            if (testResponse.ok) {
              foundUrl = data.publicUrl;
              break;
            }
          } catch (error) {
            // Continue to next bucket
            continue;
          }
        }
        
        if (foundUrl) {
          downloadUrl = foundUrl;
        } else {
          throw new Error('Document not found in any bucket');
        }
      }
      
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar el archivo. Verifica que el archivo existe.",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = myStudents?.filter(student =>
    student.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.academic_program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.profiles?.document_number?.includes(searchTerm)
  ) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      under_review: { label: 'En Revisión', variant: 'default' as const },
      approved: { label: 'Aprobado', variant: 'default' as const },
      rejected: { label: 'Rechazado', variant: 'destructive' as const },
      accepted: { label: 'Aceptado', variant: 'default' as const }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!myUniversity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Estudiantes</CardTitle>
          <CardDescription>
            No se encontró una universidad asignada a tu cuenta de coordinador.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Mis Estudiantes - {myUniversity.name}
          </CardTitle>
          <CardDescription>
            Estudiantes de tu universidad que han aplicado a programas de movilidad
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, programa o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estudiantes ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando estudiantes...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron estudiantes que coincidan con la búsqueda' : 'No hay estudiantes registrados de tu universidad'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Programa Origen</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Universidad Destino</TableHead>
                    <TableHead>Programa Destino</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Aplicación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const latestApplication = student.mobility_applications?.[0];
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.profiles?.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              Doc: {student.profiles?.document_number}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                            {student.academic_program || 'No especificado'}
                          </div>
                        </TableCell>
                        <TableCell>{student.current_semester || 'N/A'}</TableCell>
                        <TableCell>
                          {latestApplication ? (
                            <div className="flex items-center">
                              <School className="h-4 w-4 mr-2 text-muted-foreground" />
                              {latestApplication.destination_university?.name || 'No especificado'}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sin aplicaciones</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {latestApplication ? (
                            latestApplication.destination_program?.name || 'No especificado'
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {latestApplication ? (
                            getStatusBadge(latestApplication.status)
                          ) : (
                            <Badge variant="outline">Sin aplicación</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {latestApplication ? (
                            new Date(latestApplication.created_at).toLocaleDateString()
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};