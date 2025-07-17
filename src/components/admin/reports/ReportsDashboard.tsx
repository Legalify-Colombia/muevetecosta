
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobilityOverviewChart } from './charts/MobilityOverviewChart';
import { UniversityStatsChart } from './charts/UniversityStatsChart';
import { ProjectStatusChart } from './charts/ProjectStatusChart';
import { MetricsCards } from './MetricsCards';

export const ReportsDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Vista Rápida - Métricas Principales</h3>
        <MetricsCards />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Postulaciones de Movilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <MobilityOverviewChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Postulaciones por Universidad</CardTitle>
          </CardHeader>
          <CardContent>
            <UniversityStatsChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Proyectos de Investigación</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectStatusChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Postulaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Gráfico de tendencias por implementar
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
