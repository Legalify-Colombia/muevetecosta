
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const UniversityDataReport = () => {
  const { data: usersByRole, isLoading: loadingRoles } = useQuery({
    queryKey: ['users-by-role'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role');
      
      if (error) throw error;

      const roleCounts = data.reduce((acc, profile) => {
        const role = profile.role || 'student';
        const roleName = role === 'student' ? 'Estudiantes' :
                        role === 'professor' ? 'Profesores' :
                        role === 'coordinator' ? 'Coordinadores' :
                        role === 'admin' ? 'Administradores' : role;
        acc[roleName] = (acc[roleName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(roleCounts).map(([name, value]) => ({ name, value }));
    }
  });

  const { data: universityStats, isLoading: loadingStats } = useQuery({
    queryKey: ['university-stats'],
    queryFn: async () => {
      const { data: universities, error: univError } = await supabase
        .from('universities')
        .select(`
          id,
          name,
          academic_programs(id),
          mobility_applications!destination_university_id(id)
        `);
      
      if (univError) throw univError;

      return universities.map(university => ({
        name: university.name,
        programs: university.academic_programs?.length || 0,
        applications: university.mobility_applications?.length || 0
      })).sort((a, b) => b.applications - a.applications);
    }
  });

  const { data: studentsByUniversity, isLoading: loadingStudents } = useQuery({
    queryKey: ['students-by-university'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_info')
        .select('origin_university');
      
      if (error) throw error;

      const universityCounts = data.reduce((acc, student) => {
        const university = student.origin_university || 'Sin especificar';
        acc[university] = (acc[university] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(universityCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
  });

  const { data: professorsByUniversity, isLoading: loadingProfessors } = useQuery({
    queryKey: ['professors-by-university'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_info')
        .select('university');
      
      if (error) throw error;

      const universityCounts = data.reduce((acc, professor) => {
        const university = professor.university || 'Sin especificar';
        acc[university] = (acc[university] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(universityCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
  });

  if (loadingRoles || loadingStats || loadingStudents || loadingProfessors) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Datos de Usuarios y Universidades</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Usuarios por Rol</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usersByRole}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {usersByRole?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estudiantes por Universidad de Origen</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsByUniversity} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Bar dataKey="count" fill="#8884d8" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profesores por Universidad</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={professorsByUniversity}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Bar dataKey="count" fill="#82ca9d" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas por Universidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Universidad</TableHead>
                    <TableHead className="text-right">Programas</TableHead>
                    <TableHead className="text-right">Postulaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {universityStats?.slice(0, 10).map((university, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{university.name}</TableCell>
                      <TableCell className="text-right">{university.programs}</TableCell>
                      <TableCell className="text-right">{university.applications}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
