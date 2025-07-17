
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, GraduationCap, Building2, Briefcase } from 'lucide-react';

export const MetricsCards = () => {
  // Total de postulaciones
  const { data: totalApplications } = useQuery({
    queryKey: ['metrics-total-applications'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('mobility_applications')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Total de universidades activas
  const { data: totalUniversities } = useQuery({
    queryKey: ['metrics-total-universities'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('universities')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    }
  });

  // Total de usuarios
  const { data: totalUsers } = useQuery({
    queryKey: ['metrics-total-users'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Total de proyectos
  const { data: totalProjects } = useQuery({
    queryKey: ['metrics-total-projects'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('research_projects')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  const metrics = [
    {
      title: 'Total Postulaciones',
      value: totalApplications?.toLocaleString() || '0',
      icon: GraduationCap,
      color: 'text-blue-600'
    },
    {
      title: 'Universidades Activas',
      value: totalUniversities?.toLocaleString() || '0',
      icon: Building2,
      color: 'text-green-600'
    },
    {
      title: 'Usuarios Registrados',
      value: totalUsers?.toLocaleString() || '0',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Proyectos de Investigación',
      value: totalProjects?.toLocaleString() || '0',
      icon: Briefcase,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
