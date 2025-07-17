
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PredefinedReports } from './reports/PredefinedReports';
import { CustomReports } from './reports/CustomReports';
import { ReportsDashboard } from './reports/ReportsDashboard';
import { BarChart3, Plus, Layout } from 'lucide-react';

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
          <p className="text-muted-foreground">
            Genere informes personalizados y visualice métricas clave de la plataforma
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="predefined" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reportes Predefinidos
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Reportes Personalizados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ReportsDashboard />
        </TabsContent>

        <TabsContent value="predefined">
          <PredefinedReports />
        </TabsContent>

        <TabsContent value="custom">
          <CustomReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;
