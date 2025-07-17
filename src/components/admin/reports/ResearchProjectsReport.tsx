
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ResearchProjectsReport = () => {
  const { data: projectsByStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['projects-by-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_projects')
        .select('status');
      
      if (error) throw error;

      const statusCounts = data.reduce((acc, project) => {
        const status = project.status || 'proposal';
        const statusName = status === 'proposal' ? 'Propuesta' :
                          status === 'active' ? 'Activo' :
                          status === 'completed' ? 'Completado' :
                          status === 'cancelled' ? 'Cancelado' : status;
        acc[statusName] = (acc[statusName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }
  });

  const { data: universitiesWithProjects, isLoading: loadingUniversities } = useQuery({
    queryKey: ['universities-with-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_universities')
        .select(`
          university_id,
          universities!university_id(name)
        `);
      
      if (error) throw error;

      const universityCounts = data.reduce((acc, pu) => {
        const universityName = pu.universities?.name || 'Sin especificar';
        acc[universityName] = (acc[universityName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(universityCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
  });

  const { data: activeProjects, isLoading: loadingActive } = useQuery({
    queryKey: ['active-projects-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_projects')
        .select('status')
        .in('status', ['active', 'proposal']);
      
      if (error) throw error;

      const active = data.filter(p => p.status === 'active').length;
      const proposal = data.filter(p => p.status === 'proposal').length;
      
      return [
        { name: 'Proyectos Activos', value: active },
        { name: 'Propuestas', value: proposal }
      ];
    }
  });

  const { data: topProfessors, isLoading: loadingProfessors } = useQuery({
    queryKey: ['top-research-professors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_participants')
        .select(`
          professor_id,
          profiles!professor_id(full_name)
        `)
        .eq('status', 'active');
      
      if (error) throw error;

      const professorCounts = data.reduce((acc, participant) => {
        const professorName = participant.profiles?.full_name || 'Sin especificar';
        acc[professorName] = (acc[professorName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(professorCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
  });

  if (loadingStatus || loadingUniversities || loadingActive || loadingProfessors) {
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
        <h3 className="text-lg font-semibold mb-4">Proyectos de Investigación Conjunta</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectsByStatus?.map((entry, index) => (
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
            <CardTitle>Universidades con Más Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={universitiesWithProjects} layout="horizontal">
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
            <CardTitle>Proyectos Activos vs Propuestas</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeProjects}>
                  <XAxis dataKey="name" />
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
            <CardTitle>Investigadores Más Activos</CardTitle>
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
