
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = {
  pending: '#f59e0b',
  in_review: '#3b82f6',
  approved: '#10b981',
  rejected: '#ef4444',
  completed: '#8b5cf6'
};

const STATUS_LABELS = {
  pending: 'Pendientes',
  in_review: 'En Revisión',
  approved: 'Aprobadas',
  rejected: 'Rechazadas',
  completed: 'Completadas'
};

export const MobilityOverviewChart = () => {
  const { data: applicationStats, isLoading } = useQuery({
    queryKey: ['mobility-overview-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobility_applications')
        .select('status');
      
      if (error) throw error;

      // Agrupar por estado
      const statusCounts = data.reduce((acc, app) => {
        const status = app.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Convertir a formato para el gráfico
      return Object.entries(statusCounts).map(([status, count]) => ({
        name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
        value: count,
        color: COLORS[status as keyof typeof COLORS] || '#6b7280'
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

  if (!applicationStats || applicationStats.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">No hay datos disponibles</div>
      </div>
    );
  }

  const chartConfig = applicationStats.reduce((config, item) => {
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
            data={applicationStats}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {applicationStats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
