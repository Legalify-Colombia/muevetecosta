
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';

export const CustomReports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Reportes Personalizados</h3>
        <p className="text-muted-foreground">
          Cree reportes personalizados seleccionando métricas, dimensiones y filtros específicos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Crear Nuevo Reporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-12">
            <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">Constructor de Reportes</h4>
            <p className="text-muted-foreground mb-6">
              El generador de reportes personalizados estará disponible próximamente.
              Podrá seleccionar fuentes de datos, métricas, visualizaciones y filtros personalizados.
            </p>
            <Button disabled>
              Próximamente
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reportes Guardados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay reportes personalizados guardados
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
