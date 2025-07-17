
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Briefcase, Building2, Download } from 'lucide-react';

export const PredefinedReports = () => {
  const reports = [
    {
      id: 'student-mobility',
      title: 'Resumen de Movilidad Estudiantil',
      description: 'Análisis completo de postulaciones estudiantiles, universidades de destino y tendencias.',
      icon: GraduationCap,
      color: 'text-blue-600'
    },
    {
      id: 'faculty-mobility',
      title: 'Resumen de Movilidad Docente',
      description: 'Estadísticas de movilidad de profesores e investigadores por tipo y universidad.',
      icon: Users,
      color: 'text-green-600'
    },
    {
      id: 'research-projects',
      title: 'Proyectos de Investigación Conjunta',
      description: 'Estado y análisis de proyectos de investigación colaborativos entre universidades.',
      icon: Briefcase,
      color: 'text-purple-600'
    },
    {
      id: 'university-data',
      title: 'Datos de Usuarios y Universidades',
      description: 'Métricas de registro de usuarios, programas académicos y actividad por universidad.',
      icon: Building2,
      color: 'text-orange-600'
    }
  ];

  const handleGenerateReport = (reportId: string) => {
    // TODO: Implementar generación de reporte específico
    console.log(`Generando reporte: ${reportId}`);
  };

  const handleExportReport = (reportId: string, format: 'csv' | 'pdf') => {
    // TODO: Implementar exportación
    console.log(`Exportando reporte ${reportId} en formato ${format}`);
  };

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
            <Card key={report.id} className="hover:shadow-md transition-shadow">
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
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => handleGenerateReport(report.id)}
                    className="flex-1 min-w-0"
                  >
                    Generar Reporte
                  </Button>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportReport(report.id, 'csv')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportReport(report.id, 'pdf')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
