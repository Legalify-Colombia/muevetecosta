import { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Paperclip } from 'lucide-react';

interface PreparationGuideProps {
  universityName: string;
  documentsCount: number;
  mandatoryCount: number;
  optionalCount: number;
}

/**
 * Componente informativo que guía al estudiante sobre la preparación de documentos
 * Esta es una guía previa a la postulación
 */
export const DocumentPreparationGuide: FC<PreparationGuideProps> = ({
  universityName,
  documentsCount,
  mandatoryCount,
  optionalCount
}) => {
  const completionPercentage = mandatoryCount > 0 ? (mandatoryCount / (mandatoryCount + optionalCount)) * 100 : 0;

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader className="bg-blue-100 border-b border-blue-200">
        <CardTitle className="flex items-center text-blue-900">
          <Paperclip className="h-5 w-5 mr-2" />
          Guía de Preparación de Documentos
        </CardTitle>
        <CardDescription className="text-blue-800 mt-1">
          Preparación para postular a {universityName}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Resumen de documentos */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {documentsCount}
            </div>
            <div className="text-sm text-gray-600">Total de documentos</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-red-100 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {mandatoryCount}
            </div>
            <div className="text-sm text-gray-600">Obligatorios</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-100 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {optionalCount}
            </div>
            <div className="text-sm text-gray-600">Opcionales</div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Requisitos mínimos
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {mandatoryCount}/{mandatoryCount + optionalCount}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Recomendaciones */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Recomendaciones
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex gap-3 p-3 bg-white rounded border border-gray-200">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                Asegurate de obtener <strong>todos los documentos obligatorios</strong> antes de postular
              </span>
            </div>
            
            <div className="flex gap-3 p-3 bg-white rounded border border-gray-200">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                Los documentos opcionales pueden mejorar tu candidatura
              </span>
            </div>
            
            <div className="flex gap-3 p-3 bg-white rounded border border-gray-200">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                Descarga las plantillas si están disponibles para evitar rechazos
              </span>
            </div>

            <div className="flex gap-3 p-3 bg-white rounded border border-gray-200">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                Ve a <strong>"Detalles de la Universidad"</strong> para ver la lista completa de documentos
              </span>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>💡 Consejo:</strong> Prepara todos tus documentos en formato digital (PDF o imágenes claras) para agilizar el proceso de carga.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreparationGuide;
