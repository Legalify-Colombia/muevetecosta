
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Briefcase, Building2 } from 'lucide-react';
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{report.title}</h3>
              <p className="text-muted-foreground">{report.description}</p>
            </div>
            <Button variant="outline" onClick={() => setActiveReport(null)}>
              Volver a Reportes
            </Button>
          </div>
          <ReportComponent />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Reportes Predefinidos</h3>
        <p className="text-muted-foreground">
          Seleccione un reporte predefinido para generar análisis detallados de la plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${report.color}`} />
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {report.description}
                </p>
                
                <Button 
                  onClick={() => setActiveReport(report.id)}
                  className="w-full"
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
