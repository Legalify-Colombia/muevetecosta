
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Briefcase, GraduationCap, Loader2 } from 'lucide-react';

export const MetricsCards = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const [
        { count: totalApplications },
        { count: totalProjects },
        { count: totalUniversities },
        { count: totalUsers }
      ] = await Promise.all([
        supabase.from('mobility_applications').select('*', { count: 'exact', head: true }),
        supabase.from('research_projects').select('*', { count: 'exact', head: true }),
        supabase.from('universities').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalApplications: totalApplications || 0,
        totalProjects: totalProjects || 0,
        totalUniversities: totalUniversities || 0,
        totalUsers: totalUsers || 0
      };
    },
  });

  const cards = [
    {
      title: 'Total Postulaciones',
      value: metrics?.totalApplications || 0,
      icon: GraduationCap,
      color: 'text-blue-600'
    },
    {
      title: 'Proyectos Activos',
      value: metrics?.totalProjects || 0,
      icon: Briefcase,
      color: 'text-green-600'
    },
    {
      title: 'Universidades',
      value: metrics?.totalUniversities || 0,
      icon: Building2,
      color: 'text-purple-600'
    },
    {
      title: 'Usuarios Totales',
      value: metrics?.totalUsers || 0,
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-2">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl font-bold">{card.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
