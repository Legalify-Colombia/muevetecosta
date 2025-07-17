
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PredefinedReports } from './reports/PredefinedReports';
import { CustomReports } from './reports/CustomReports';
import { ReportsDashboard } from './reports/ReportsDashboard';
import { BarChart3, Plus, Layout } from 'lucide-react';

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { value: 'dashboard', label: 'Dashboard', icon: Layout },
    { value: 'predefined', label: 'Predefinidos', icon: BarChart3 },
    { value: 'custom', label: 'Personalizados', icon: Plus }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">Reportes y Análisis</h2>
        <p className="text-sm text-muted-foreground">
          Genere informes personalizados y visualice métricas clave de la plataforma
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        {/* Mobile: Horizontal scroll tabs */}
        <div className="w-full overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 min-w-[300px]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-0">
          <ReportsDashboard />
        </TabsContent>

        <TabsContent value="predefined" className="space-y-0">
          <PredefinedReports />
        </TabsContent>

        <TabsContent value="custom" className="space-y-0">
          <CustomReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;
