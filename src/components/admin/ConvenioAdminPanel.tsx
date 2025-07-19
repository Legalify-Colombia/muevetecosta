
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ConvenioDocumentTemplateManager from './ConvenioDocumentTemplateManager';
import ConvenioTermsManager from './ConvenioTermsManager';
import ConvenioConfigManager from './ConvenioConfigManager';
import ConveniosManagement from './ConveniosManagement';
import { FileText, Settings, Users, BookOpen } from 'lucide-react';

const ConvenioAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('postulaciones');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sistema de Convenios "Muévete"</h2>
        <p className="text-muted-foreground">
          Panel administrativo completo para gestionar el proceso de vinculación de universidades
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="postulaciones" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Postulaciones</span>
          </TabsTrigger>
          <TabsTrigger value="documentos" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="terminos" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Términos</span>
          </TabsTrigger>
          <TabsTrigger value="configuracion" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="postulaciones">
          <ConveniosManagement />
        </TabsContent>

        <TabsContent value="documentos">
          <ConvenioDocumentTemplateManager />
        </TabsContent>

        <TabsContent value="terminos">
          <ConvenioTermsManager />
        </TabsContent>

        <TabsContent value="configuracion">
          <ConvenioConfigManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConvenioAdminPanel;
