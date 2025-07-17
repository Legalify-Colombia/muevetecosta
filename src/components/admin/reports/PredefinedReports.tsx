
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap, Users, Briefcase, Building2 } from 'lucide-react';
import { StudentMobilityReport } from './StudentMobilityReport';
import { ProfessorMobilityReport } from './ProfessorMobilityReport';
import { ResearchProjectsReport } from './ResearchProjectsReport';
import { UniversityDataReport } from './UniversityDataReport';

export const PredefinedReports = () => {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const reports = [
    {
      id: 'student-mobility',
      title: 'Resumen de Movilidad Estudiantil',
      description: 'Análisis completo de postulaciones estudiantiles, universidades de destino y tendencias.',
      icon: GraduationCap,
      color: 'text-blue-600',
      component: StudentMobilityReport
    },
    {
      id: 'professor-mobility',
      title: 'Resumen de Movilidad Docente',
      description: 'Estadísticas de movilidad de profesores e investigadores por tipo y universidad.',
      icon: Users,
      color: 'text-green-600',
      component: ProfessorMobilityReport
    },
    {
      id: 'research-projects',
      title: 'Proyectos de Investigación Conjunta',
      description: 'Estado y análisis de proyectos de investigación colaborativos entre universidades.',
      icon: Briefcase,
      color: 'text-purple-600',
      component: ResearchProjectsReport
    },
    {
      id: 'university-data',
      title: 'Datos de Usuarios y Universidades',
      description: 'Métricas de registro de usuarios, programas académicos y actividad por universidad.',
      icon: Building2,
      color: 'text-orange-600',
      component: UniversityDataReport
    }
  ];

  if (activeReport) {
    const report = reports.find(r => r.id === activeReport);
    if (report) {
      const ReportComponent = report.component;
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-semibold line-clamp-2">{report.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{report.description}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setActiveReport(null)}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Reportes
            </Button>
          </div>
          <ReportComponent />
        </div>
      );
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Reportes Predefinidos</h3>
        <p className="text-sm text-muted-foreground">
          Seleccione un reporte predefinido para generar análisis detallados de la plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${report.color} flex-shrink-0 mt-0.5`} />
                  <CardTitle className="text-base sm:text-lg leading-tight">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {report.description}
                </p>
                
                <Button 
                  onClick={() => setActiveReport(report.id)}
                  className="w-full"
                  size="sm"
                >
                  Ver Reporte
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
