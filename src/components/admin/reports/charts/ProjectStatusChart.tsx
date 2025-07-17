
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  proposal: '#f59e0b',
  active: '#10b981',
  completed: '#8b5cf6',
  cancelled: '#ef4444'
};

const STATUS_LABELS = {
  proposal: 'Propuesta',
  active: 'Activo',
  completed: 'Completado',
  cancelled: 'Cancelado'
};

export const ProjectStatusChart = () => {
  const { data: projectStats, isLoading } = useQuery({
    queryKey: ['project-status-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_projects')
        .select('status');
      
      if (error) throw error;

      // Agrupar por estado
      const statusCounts = data.reduce((acc, project) => {
        const status = project.status || 'proposal';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Convertir a formato para el gráfico
      return Object.entries(statusCounts).map(([status, count]) => ({
        name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
        value: count,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280'
      }));
    }
  });

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">Cargando datos...</div>
      </div>
    );
  }

  if (!projectStats || projectStats.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">No hay datos disponibles</div>
      </div>
    );
  }

  const chartConfig = projectStats.reduce((config, item) => {
    config[item.name] = {
      label: item.name,
      color: item.color
    };
    return config;
  }, {} as any);

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={projectStats}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {projectStats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
