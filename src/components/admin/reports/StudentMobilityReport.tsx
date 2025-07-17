
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const StudentMobilityReport = () => {
  const { data: applicationsByStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['student-mobility-by-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobility_applications')
        .select('status');
      
      if (error) throw error;

      const statusCounts = data.reduce((acc, app) => {
        const status = app.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(statusCounts).map(([status, count]) => ({
        name: status === 'pending' ? 'Pendientes' : 
              status === 'in_review' ? 'En Revisión' :
              status === 'approved' ? 'Aprobadas' :
              status === 'rejected' ? 'Rechazadas' :
              status === 'completed' ? 'Completadas' : status,
        value: count
      }));
    }
  });

  const { data: applicationsByDestination, isLoading: loadingDestination } = useQuery({
    queryKey: ['student-mobility-by-destination'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobility_applications')
        .select(`
          destination_university_id,
          universities!destination_university_id(name)
        `);
      
      if (error) throw error;

      const universityCounts = data.reduce((acc, app) => {
        const universityName = app.universities?.name || 'Sin especificar';
        acc[universityName] = (acc[universityName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(universityCounts)
        .map(([name, count]) => ({ name, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }
  });

  const { data: applicationsByProgram, isLoading: loadingProgram } = useQuery({
    queryKey: ['student-mobility-by-program'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobility_applications')
        .select(`
          destination_program_id,
          academic_programs!destination_program_id(name)
        `);
      
      if (error) throw error;

      const programCounts = data.reduce((acc, app) => {
        const programName = app.academic_programs?.name || 'Sin especificar';
        acc[programName] = (acc[programName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(programCounts)
        .map(([name, count]) => ({ name, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }
  });

  const { data: monthlyTrend, isLoading: loadingTrend } = useQuery({
    queryKey: ['student-mobility-trend'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobility_applications')
        .select('created_at');
      
      if (error) throw error;

      const monthCounts = data.reduce((acc, app) => {
        const month = new Date(app.created_at || '').toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short' 
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(monthCounts)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    }
  });

  if (loadingStatus || loadingDestination || loadingProgram || loadingTrend) {
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
        <h3 className="text-lg font-semibold mb-4">Resumen de Movilidad Estudiantil</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <CardTitle>Top 10 Universidades de Destino</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationsByDestination} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Bar dataKey="value" fill="#8884d8" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Programas Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applicationsByProgram}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Bar dataKey="value" fill="#82ca9d" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Postulaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
