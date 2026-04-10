import { Paperclip, AlertCircle, CheckCircle, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUniversityRequiredDocuments } from "@/hooks/useUniversityRequiredDocuments";

interface RequiredDocumentsDisplayProps {
  universityId: string;
  universityName: string;
  variant?: "default" | "compact" | "inline";
  mobilityType?: "student" | "professor";
  onlyMandatory?: boolean;
}

export const RequiredDocumentsDisplay = ({
  universityId,
  universityName,
  variant = "default",
  mobilityType,
  onlyMandatory = false
}: RequiredDocumentsDisplayProps) => {
  const { data: allDocuments = [], isLoading } = useUniversityRequiredDocuments(universityId);

  // Filtrar documentos basado en los criterios
  let requiredDocuments = allDocuments.filter(doc => {
    // Filtrar por tipo de movilidad si se especifica
    if (mobilityType && doc.mobility_type !== "both" && doc.mobility_type !== mobilityType) {
      return false;
    }
    // Filtrar solo obligatorios si se solicita
    if (onlyMandatory && !doc.is_mandatory) {
      return false;
    }
    return true;
  });

  if (!requiredDocuments || requiredDocuments.length === 0) {
    return null;
  }

  if (variant === "compact") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Paperclip className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2">
              {requiredDocuments.length} documento{requiredDocuments.length !== 1 ? 's' : ''} requerido{requiredDocuments.length !== 1 ? 's' : ''}
            </h4>
            <div className="space-y-1">
              {requiredDocuments.map((doc: any) => (
                <div key={doc.id} className="text-sm text-blue-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  {doc.document_title}
                  {doc.is_mandatory && (
                    <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-orange-800">
                Documentos {onlyMandatory ? "Obligatorios" : "Requeridos"}
              </h4>
              <p className="text-sm text-orange-700 mt-1">
                Asegúrate de cargar todos los documentos {onlyMandatory ? "obligatorios" : "requeridos"} antes de enviar tu aplicación.
              </p>
              <ul className="text-sm text-orange-700 mt-2 list-disc list-inside">
                {requiredDocuments.map((doc: any) => (
                  <li key={doc.id} className="flex items-center gap-2">
                    {doc.document_title}
                    {doc.is_mandatory && (
                      <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="bg-amber-100 border-b border-amber-200">
        <CardTitle className="flex items-center text-amber-900">
          <Paperclip className="h-5 w-5 mr-2" />
          Documentos Requeridos
        </CardTitle>
        <CardDescription className="text-amber-800 mt-1">
          Estos son los documentos que necesitarás al postularte a {universityName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requiredDocuments.map((doc: any) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg p-4 border border-amber-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {doc.is_mandatory ? (
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-gray-900">
                      {doc.document_title}
                    </h4>
                    <Badge
                      variant={doc.is_mandatory ? "destructive" : "secondary"}
                      className="text-xs whitespace-nowrap"
                    >
                      {doc.is_mandatory ? "Obligatorio" : "Opcional"}
                    </Badge>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                  {doc.template_file_url && (
                    <a
                      href={doc.template_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Descargar plantilla
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
