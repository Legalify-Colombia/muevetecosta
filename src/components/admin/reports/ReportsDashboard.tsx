
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

      <div className="grid grid-cols-1 gap-6">
        {/* Mobile: Stack all charts vertically */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Estado de Postulaciones de Movilidad</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[250px] sm:h-[300px]">
              <MobilityOverviewChart />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Postulaciones por Universidad</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[250px] sm:h-[300px]">
              <UniversityStatsChart />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Estado de Proyectos de Investigación</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[250px] sm:h-[300px]">
              <ProjectStatusChart />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Tendencia de Postulaciones</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              Gráfico de tendencias por implementar
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
