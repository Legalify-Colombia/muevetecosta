
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export const UniversityStatsChart = () => {
  const { data: universityStats, isLoading } = useQuery({
    queryKey: ['university-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobility_applications')
        .select(`
          destination_university_id,
          universities!destination_university_id (
            name
          )
        `);
      
      if (error) throw error;

      // Agrupar por universidad de destino
      const universityCounts = data.reduce((acc, app) => {
        const universityName = app.universities?.name || 'Sin especificar';
        acc[universityName] = (acc[universityName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Convertir a formato para el gráfico y tomar top 10
      return Object.entries(universityCounts)
        .map(([name, count]) => ({
          universidad: name.length > 20 ? name.substring(0, 20) + '...' : name,
          postulaciones: count
        }))
        .sort((a, b) => b.postulaciones - a.postulaciones)
        .slice(0, 10);
    }
  });

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">Cargando datos...</div>
      </div>
    );
  }

  if (!universityStats || universityStats.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">No hay datos disponibles</div>
      </div>
    );
  }

  const chartConfig = {
    postulaciones: {
      label: "Postulaciones",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={universityStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="universidad" 
            angle={-45}
            textAnchor="end"
            height={100}
            fontSize={12}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="postulaciones" fill="var(--color-postulaciones)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
