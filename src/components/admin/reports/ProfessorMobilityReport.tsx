
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ProfessorMobilityReport = () => {
  const { data: applicationsByType, isLoading: loadingType } = useQuery({
    queryKey: ['professor-mobility-by-type'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_mobility_applications' as any)
        .select('mobility_type');
      
      if (error) throw error;

      const typeCounts = (data || []).reduce((acc: any, app: any) => {
        const type = app.mobility_type || 'teaching';
        const typeName = type === 'teaching' ? 'Docencia' :
                        type === 'research' ? 'Investigación' :
                        type === 'training' ? 'Capacitación' : type;
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    }
  });

  const { data: applicationsByStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['professor-mobility-by-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_mobility_applications' as any)
        .select('status');
      
      if (error) throw error;

      const statusCounts = (data || []).reduce((acc: any, app: any) => {
        const status = app.status || 'pending';
        const statusName = status === 'pending' ? 'Pendientes' :
                          status === 'in_review' ? 'En Revisión' :
                          status === 'approved_origin' ? 'Aprobadas (Origen)' :
                          status === 'approved_destination' ? 'Aprobadas (Destino)' :
                          status === 'rejected' ? 'Rechazadas' :
                          status === 'completed' ? 'Completadas' : status;
        acc[statusName] = (acc[statusName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }
  });

  const { data: applicationsByDestination, isLoading: loadingDestination } = useQuery({
    queryKey: ['professor-mobility-by-destination'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_mobility_applications' as any)
        .select(`
          *,
          universities!destination_university_id(name)
        `);
      
      if (error) throw error;

      const universityCounts = (data || []).reduce((acc: any, app: any) => {
        const universityName = app.universities?.name || 'Sin especificar';
        acc[universityName] = (acc[universityName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(universityCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }
  });

  const { data: topProfessors, isLoading: loadingProfessors } = useQuery({
    queryKey: ['top-professors-mobility'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_mobility_applications' as any)
        .select(`
          professor_id,
          profiles!professor_id(full_name)
        `);
      
      if (error) throw error;

      const professorCounts = (data || []).reduce((acc: any, app: any) => {
        const professorName = app.profiles?.full_name || 'Sin especificar';
        acc[professorName] = (acc[professorName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(professorCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
  });

  if (loadingType || loadingStatus || loadingDestination || loadingProfessors) {
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
        <h3 className="text-lg font-semibold mb-4">Resumen de Movilidad Docente</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Postulaciones por Tipo de Movilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationsByType}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" fill="#8884d8" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Postulaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {applicationsByStatus?.map((entry, index) => (
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
            <CardTitle>Universidades de Destino</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationsByDestination} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Bar dataKey="value" fill="#82ca9d" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profesores Más Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProfessors}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Bar dataKey="count" fill="#ffc658" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
